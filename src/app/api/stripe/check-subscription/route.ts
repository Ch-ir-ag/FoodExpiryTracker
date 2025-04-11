import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  console.log('Starting check-subscription API call');
  const cookieStore = cookies();
  
  try {
    // Use createRouteHandlerClient to properly get user session from cookies
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError) {
      console.error('Auth error getting session in check-subscription:', authError.message);
      return NextResponse.json({ isPremium: false, message: 'Authentication error' }, { status: 200 });
    }

    if (!session || !session.user) {
      console.log('No active session found in check-subscription');
      return NextResponse.json({ isPremium: false, message: 'Not authenticated' }, { status: 200 });
    }
    
    const user = session.user;
    console.log('Checking subscription status via API for user:', user.id);

    // Use admin client for database checks
    const supabaseAdmin = getSupabaseAdmin();
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('status, stripe_subscription_id, stripe_customer_id') // Select specific columns
      .eq('user_id', user.id)
      .maybeSingle(); // Use maybeSingle to handle no rows gracefully

    // If subscription found in DB
    if (subscription) {
      const isActive = ['active', 'trialing', 'past_due'].includes(subscription.status);
      console.log(`DB Check: Found subscription status: ${subscription.status}, isActive: ${isActive}`);
      return NextResponse.json({ 
        isPremium: isActive,
        status: subscription.status,
        subscriptionId: subscription.stripe_subscription_id
      });
    }
    
    // Handle case where no subscription found in DB
    if (subError && subError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('DB Check: Error checking subscription in database:', subError);
        // Fall through to Stripe check, maybe DB is out of sync
    } else {
       console.log('DB Check: No subscription found in database for user:', user.id);
    }

    // Second attempt: Check with Stripe directly
    try {
      console.log('Stripe Check: Looking for customer by email:', user.email);
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });

      if (customers.data.length > 0) {
        const customerId = customers.data[0].id;
        console.log(`Stripe Check: Found customer ${customerId} by email.`);
        
        const stripeSubscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: 'all',
          limit: 1
        });
        
        if (stripeSubscriptions.data.length > 0) {
          const latestSubscription = stripeSubscriptions.data[0];
          const isActive = ['active', 'trialing', 'past_due'].includes(latestSubscription.status);
          console.log(`Stripe Check: Found subscription ${latestSubscription.id}, status: ${latestSubscription.status}, isActive: ${isActive}`);
          
          // Try to sync this back to our database
          const { error: syncError } = await supabaseAdmin.rpc('sync_stripe_subscription', {
            p_user_id: user.id,
            p_stripe_customer_id: customerId,
            p_stripe_subscription_id: latestSubscription.id,
            p_status: latestSubscription.status
          });
          if (syncError) {
            console.error('Stripe Check: Error syncing subscription found in Stripe:', syncError);
            // Still return the status found in Stripe
          }
            
          return NextResponse.json({ 
            isPremium: isActive,
            status: latestSubscription.status,
            subscriptionId: latestSubscription.id
          });
        } else {
           console.log(`Stripe Check: No subscriptions found for customer ${customerId}.`);
        }
      } else {
         console.log(`Stripe Check: No customer found for email ${user.email}.`);
      }
    } catch (stripeError) {
      console.error('Stripe Check: Error checking with Stripe API:', stripeError);
    }
    
    // Default fallback: User is not premium
    console.log('Fallback: Returning isPremium: false');
    return NextResponse.json({ isPremium: false, message: 'No active subscription found' }, { status: 200 });
    
  } catch (error) {
    console.error('Error in check-subscription API:', error);
    return NextResponse.json({ 
      isPremium: false, 
      message: 'Failed to check subscription status' 
    }, { status: 200 });
  }
} 