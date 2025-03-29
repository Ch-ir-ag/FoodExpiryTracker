import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase';

// Keep track of processed webhook events to prevent duplicates
const processedEvents = new Set<string>();

export async function POST(req: Request) {
  console.log('🔔 Stripe webhook received:', new Date().toISOString());
  
  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature') as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    if (!webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET is not set in environment variables');
      return new NextResponse('Webhook secret missing', { status: 500 });
    }

    if (!sig) {
      console.error('❌ stripe-signature header is missing');
      return new NextResponse('Stripe signature missing', { status: 400 });
    }

    console.log('🔑 Webhook signature received:', sig.substring(0, 20) + '...');

    let event: Stripe.Event;

    try {
      // Verify the event came from Stripe using the webhook secret
      console.log('🔐 Verifying event with secret:', webhookSecret.substring(0, 5) + '...');
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
      console.log('✅ Event verified successfully:', event.id);
      
      // Check if we've already processed this event
      if (processedEvents.has(event.id)) {
        console.log('⏭️ Event already processed, skipping:', event.id);
        return new NextResponse(JSON.stringify({ received: true, already_processed: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      // Add to processed events
      processedEvents.add(event.id);
      
      // Limit the size of the set to prevent memory leaks
      if (processedEvents.size > 100) {
        const iterator = processedEvents.values();
        processedEvents.delete(iterator.next().value);
      }
    } catch (err: any) {
      console.error(`❌ Webhook signature verification failed: ${err.message}`);
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Handle the event
    console.log(`📣 Stripe webhook event: ${event.type} (${event.id})`);
    console.log('📦 Event data:', JSON.stringify(event.data.object).substring(0, 200) + '...');

    // Get admin client for database operations
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      console.error('❌ Failed to get supabaseAdmin client');
      return new NextResponse('Internal server error', { status: 500 });
    }

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Extract metadata from the session
        const userId = session.metadata?.userId;
        console.log('👤 Session metadata:', session.metadata, 'User ID:', userId);
        
        if (!userId || userId === 'guest') {
          console.error('❌ No valid userId found in session metadata');
          break;
        }
        
        console.log(`✅ Checkout completed for user: ${userId}`);
        
        // Get the subscription details to retrieve the customer ID
        const subscriptionId = session.subscription as string;
        if (!subscriptionId) {
          console.error('❌ No subscription ID found in session');
          break;
        }
        
        console.log(`🔍 Retrieving subscription details: ${subscriptionId}`);
        
        try {
          // Retrieve full subscription details to get customer ID
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const customerId = subscription.customer as string;
          
          console.log(`📊 Retrieved subscription:`, {
            subscriptionId,
            customerId,
            status: subscription.status
          });
          
          // CRITICAL: Direct database operation to ensure data is saved
          console.log(`💾 Updating database for user ${userId} with subscription ${subscriptionId}`);
          
          // Try inserting a new subscription record first
          try {
            console.log('🆕 Attempting to insert new subscription record');
            const { error: insertError } = await supabaseAdmin
              .from('subscriptions')
              .insert({
                user_id: userId,
                stripe_subscription_id: subscriptionId,
                stripe_customer_id: customerId,
                status: subscription.status,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
              
            if (insertError) {
              if (insertError.code === '23505') { // Unique violation error code
                console.log('⚠️ Record already exists, attempting update instead');
                
                // If insert fails due to unique constraint, try update instead
                const { error: updateError } = await supabaseAdmin
                  .from('subscriptions')
                  .update({
                    stripe_subscription_id: subscriptionId,
                    stripe_customer_id: customerId,
                    status: subscription.status,
                    updated_at: new Date().toISOString(),
                  })
                  .eq('user_id', userId);
                  
                if (updateError) {
                  console.error('❌ Error updating subscription:', updateError);
                } else {
                  console.log(`✅ Updated subscription for user ${userId}`);
                }
              } else {
                console.error('❌ Error creating subscription:', insertError);
              }
            } else {
              console.log(`✅ Created new subscription for user ${userId}`);
            }
            
            // Also update the user_trials table to mark the trial as used
            console.log('🔄 Updating user_trials table');
            const { error: trialUpsertError } = await supabaseAdmin
              .from('user_trials')
              .upsert({
                user_id: userId,
                is_trial_used: true,
                trial_start_time: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
              
            if (trialUpsertError) {
              console.error('❌ Error updating user_trials:', trialUpsertError);
            } else {
              console.log(`✅ Updated trial status for user ${userId}`);
            }
            
            console.log(`✅ Successfully completed subscription process for user ${userId}`);
          } catch (dbErr) {
            console.error(`❌ Database error:`, dbErr);
          }
        } catch (stripeErr) {
          console.error(`❌ Stripe API error:`, stripeErr);
        }
        
        break;
        
      case 'customer.subscription.created':
        const subscriptionCreated = event.data.object as Stripe.Subscription;
        console.log(`🆕 Subscription created: ${subscriptionCreated.id}`);
        
        // Get customer ID
        const customerIdCreated = subscriptionCreated.customer as string;
        
        // Extract user ID from metadata
        const userIdFromMeta = subscriptionCreated.metadata?.userId;
        console.log(`👤 Extracted userId from metadata: ${userIdFromMeta || 'not found'}`);
        
        if (userIdFromMeta && userIdFromMeta !== 'guest') {
          try {
            console.log(`💾 Updating database for user ${userIdFromMeta}`);
            const { error: subscriptionInsertError } = await supabaseAdmin
              .from('subscriptions')
              .upsert({
                user_id: userIdFromMeta,
                stripe_subscription_id: subscriptionCreated.id,
                stripe_customer_id: customerIdCreated,
                status: subscriptionCreated.status,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
              
            if (subscriptionInsertError) {
              console.error('❌ Error upserting subscription:', subscriptionInsertError);
            } else {
              console.log(`✅ Upserted subscription for user ${userIdFromMeta}`);
              
              // Also update user_trials
              const { error: trialUpdateError } = await supabaseAdmin
                .from('user_trials')
                .upsert({
                  user_id: userIdFromMeta,
                  is_trial_used: true,
                  trial_start_time: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
              
              if (trialUpdateError) {
                console.error('❌ Error updating trial status:', trialUpdateError);
              } else {
                console.log(`✅ Updated trial status for user ${userIdFromMeta}`);
              }
            }
          } catch (err) {
            console.error('❌ Error processing subscription.created event:', err);
          }
        } else {
          console.log('⚠️ No valid userId found in subscription metadata, attempting customer lookup');
          
          // Try to find the user by customer ID
          try {
            const { data: customers, error: lookupError } = await supabaseAdmin
              .from('subscriptions')
              .select('user_id')
              .eq('stripe_customer_id', customerIdCreated);
              
            if (lookupError) {
              console.error('❌ Error looking up customer:', lookupError);
            } else if (customers && customers.length > 0) {
              const foundUserId = customers[0].user_id;
              console.log(`👤 Found user ${foundUserId} for customer ${customerIdCreated}`);
              
              // Update the subscription
              const { error: updateError } = await supabaseAdmin
                .from('subscriptions')
                .update({
                  stripe_subscription_id: subscriptionCreated.id,
                  status: subscriptionCreated.status,
                  updated_at: new Date().toISOString()
                })
                .eq('user_id', foundUserId);
                
              if (updateError) {
                console.error('❌ Error updating subscription after customer lookup:', updateError);
              } else {
                console.log(`✅ Updated subscription for user ${foundUserId}`);
              }
            } else {
              console.log('⚠️ No user found for customer ID:', customerIdCreated);
            }
          } catch (err) {
            console.error('❌ Error during customer lookup:', err);
          }
        }
        
        break;
        
      case 'customer.subscription.updated':
        const subscriptionUpdated = event.data.object as Stripe.Subscription;
        const statusUpdated = subscriptionUpdated.status;
        console.log(`Subscription updated: ${subscriptionUpdated.id}, status: ${statusUpdated}`);
        
        // Get customer ID to find the user
        const customerIdUpdated = subscriptionUpdated.customer as string;
        
        try {
          // Find the user_id from the subscriptions table using customer_id
          const { data: subscriptionData, error: lookupError } = await supabaseAdmin
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', customerIdUpdated);
          
          if (lookupError) {
            console.error('Error finding user for customer:', lookupError);
            break;
          }
          
          if (!subscriptionData || subscriptionData.length === 0) {
            console.error('Could not find user for customer:', customerIdUpdated);
            break;
          }
          
          const userId = subscriptionData[0].user_id;
          
          // Update the subscription status
          const { error: updateError } = await supabaseAdmin
            .from('subscriptions')
            .update({
              stripe_subscription_id: subscriptionUpdated.id,
              status: statusUpdated,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
            
          if (updateError) {
            console.error('Error updating subscription status:', updateError);
          } else {
            console.log(`Successfully updated subscription status for user ${userId} to ${statusUpdated}`);
          }
        } catch (err) {
          console.error('Error processing subscription.updated event:', err);
        }
        
        break;
        
      case 'customer.subscription.deleted':
        const subscriptionDeleted = event.data.object as Stripe.Subscription;
        console.log(`Subscription deleted: ${subscriptionDeleted.id}`);
        
        // Similar to subscription.updated event
        const customerIdDeleted = subscriptionDeleted.customer as string;
        
        try {
          // Find the user_id from the subscriptions table using customer_id
          const { data: subscriptionData, error: lookupError } = await supabaseAdmin
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', customerIdDeleted);
          
          if (lookupError) {
            console.error('Error finding user for customer:', lookupError);
            break;
          }
          
          if (!subscriptionData || subscriptionData.length === 0) {
            console.error('Could not find user for customer:', customerIdDeleted);
            break;
          }
          
          const userId = subscriptionData[0].user_id;
          
          // Update the subscription status
          const { error: updateError } = await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'canceled',
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
            
          if (updateError) {
            console.error('Error updating subscription status to canceled:', updateError);
          } else {
            console.log(`Successfully marked subscription as canceled for user ${userId}`);
          }
        } catch (err) {
          console.error('Error processing subscription.deleted event:', err);
        }
        
        break;
        
      case 'customer.subscription.trial_will_end':
        const subscriptionTrialEnding = event.data.object as Stripe.Subscription;
        console.log(`Trial ending soon for subscription: ${subscriptionTrialEnding.id}`);
        
        // You might want to send an email notification here
        // This event is triggered 3 days before the trial ends
        
        break;
        
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment succeeded: ${paymentIntent.id}`);
        break;
        
      case 'payment_intent.payment_failed':
        const paymentFailed = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed: ${paymentFailed.id}`);
        break;
        
      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
  }

  // Return a response to acknowledge receipt of the event
  console.log('✅ Webhook processing complete');
  return new NextResponse(JSON.stringify({ received: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
} 