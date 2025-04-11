import { NextResponse } from 'next/server';
import { getSupabase, getSupabaseAdmin } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const supabase = getSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    console.log(`Manual sync requested for user: ${user.id}`);
    const supabaseAdmin = getSupabaseAdmin();
    let customerId: string | null = null;
    let subscriptionId: string | null = null;
    let subscriptionStatus: string | null = null;

    try {
      // 1. Try finding customer by email in Stripe
      console.log(`Searching Stripe customer by email: ${user.email}`);
      const customerSearch = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (customerSearch.data.length > 0) {
        customerId = customerSearch.data[0].id;
        console.log(`Found customer by email: ${customerId}`);

        // 2. Find the latest subscription for this customer
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: 'all', // Check active, trialing, past_due, etc.
          limit: 1,       // Get the most recent one
          expand: ['data.default_payment_method'], // Optional: expand if needed
        });

        if (subscriptions.data.length > 0) {
          const latestSubscription = subscriptions.data[0];
          subscriptionId = latestSubscription.id;
          subscriptionStatus = latestSubscription.status;
          console.log(`Found latest subscription ${subscriptionId} with status: ${subscriptionStatus}`);
        } else {
          console.log(`No subscriptions found for customer ${customerId}`);
        }
      } else {
         console.log(`No Stripe customer found for email: ${user.email}`);
        // Attempt lookup in our DB just in case email mismatch but DB has link
        const { data: existingSub } = await supabaseAdmin
          .from('subscriptions')
          .select('stripe_customer_id, stripe_subscription_id, status')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingSub?.stripe_customer_id && existingSub?.stripe_subscription_id) {
          console.log('Found customer/subscription info in local DB, verifying status with Stripe');
          customerId = existingSub.stripe_customer_id;
          subscriptionId = existingSub.stripe_subscription_id;
          try {
            // Ensure subscriptionId is not null before calling retrieve
            if (subscriptionId) {
              const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
              subscriptionStatus = stripeSub.status;
              console.log(`Verified subscription ${subscriptionId} status with Stripe: ${subscriptionStatus}`);
            } else {
              // This case should ideally not happen if existingSub.stripe_subscription_id was truthy, but adding safety check.
               console.error('Subscription ID from DB was unexpectedly null.');
               return NextResponse.json({ success: false, error: 'Internal error retrieving subscription ID from database' }, { status: 500 });
            }
          } catch (stripeError) {
             console.error(`Error verifying subscription ${subscriptionId} with Stripe:`, stripeError);
             // Could proceed with DB status, but safer to report failure
             return NextResponse.json({ success: false, error: 'Failed to verify subscription status with Stripe' }, { status: 500 });
          }
        } else {
          console.log('No customer found by email and no existing subscription link in DB.');
        }
      }

      // 3. If we found a subscription, sync it to Supabase
      if (customerId && subscriptionId && subscriptionStatus) {
        console.log(`Syncing subscription ${subscriptionId} for user ${user.id}`);
        const { data: syncResult, error: syncError } = await supabaseAdmin.rpc('sync_stripe_subscription', {
          p_user_id: user.id,
          p_stripe_customer_id: customerId,
          p_stripe_subscription_id: subscriptionId,
          p_status: subscriptionStatus
        });

        if (syncError || !syncResult) {
          console.error('Error calling sync_stripe_subscription function:', syncError);
          return NextResponse.json({ success: false, error: 'Database sync failed' }, { status: 500 });
        }

        console.log('Sync successful via DB function.');
        return NextResponse.json({
          success: true,
          subscription: {
            id: subscriptionId,
            status: subscriptionStatus,
            // You might want to retrieve current_period_end again if needed
          }
        });

      } else {
        // 4. No active or relevant subscription found
        console.log('Could not find a relevant subscription in Stripe to sync.');
        // Check if there's an *inactive* subscription in the DB that needs updating
        const { data: existingSubCheck } = await supabaseAdmin
          .from('subscriptions')
          .select('status')
          .eq('user_id', user.id)
          .in('status', ['active', 'trialing', 'past_due']) // Check for previously active states
          .maybeSingle();
        
        if(existingSubCheck) {
           console.log('Found previously active subscription in DB, but none in Stripe. Setting status to canceled.');
           // Attempt to mark as canceled
           const { error: cancelError } = await supabaseAdmin
             .from('subscriptions')
             .update({ status: 'canceled', updated_at: new Date().toISOString() })
             .eq('user_id', user.id);
           if(cancelError) console.error('Error marking DB subscription as canceled:', cancelError);
        }

        return NextResponse.json({ success: false, error: 'No active subscription found in Stripe' });
      }

    } catch (error) {
      console.error('Error during Stripe API interaction or DB sync:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json({ success: false, error: `Sync process error: ${errorMessage}` }, { status: 500 });
    }
  } catch (error) {
    console.error('Outer error in subscription sync endpoint:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
} 