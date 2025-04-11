import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase';
import { StripeService } from '@/services/stripeService';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  console.log('🔔 Stripe webhook received:', new Date().toISOString());
  
  const body = await req.text();
  const headersList = headers();
  const sig = headersList.get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) {
      console.error('❌ Webhook secret or signature missing');
      return new NextResponse('Webhook secret or signature missing', { status: 400 });
    }

    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    console.log('✅ Webhook signature verified');
    
    // Get Supabase admin client for database operations
    const supabaseAdmin = getSupabaseAdmin();

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`💰 Checkout session completed: ${session.id}`);
        
        // Get the customer and subscription IDs from the session
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        
        // Get the user ID from the session metadata
        const userId = session.metadata?.userId;
        
        if (!userId || userId === 'guest') {
          console.error('❌ No user ID found in session metadata');
          break;
        }

        try {
          // Get subscription details from Stripe
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          
          // Update subscription status in database
          await StripeService.updateSubscriptionStatusAdmin(
            userId,
            subscriptionId,
            customerId,
            subscription.status,
            supabaseAdmin
          );
          
          console.log(`✅ Successfully created/updated subscription for user ${userId}`);
        } catch (error) {
          console.error('❌ Error updating subscription status:', error);
        }
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`📝 Subscription ${event.type}: ${subscription.id}`);
        
        // Get the user ID from the subscription metadata
        const subUserId = subscription.metadata?.userId;
        
        if (!subUserId || subUserId === 'guest') {
          console.error('❌ No user ID found in subscription metadata');
          break;
        }

        try {
          await StripeService.updateSubscriptionStatusAdmin(
            subUserId,
            subscription.id,
            subscription.customer as string,
            subscription.status,
            supabaseAdmin
          );
          
          console.log(`✅ Successfully updated subscription status for user ${subUserId}`);
        } catch (error) {
          console.error('❌ Error updating subscription status:', error);
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        console.log(`🗑️ Subscription deleted: ${deletedSubscription.id}`);
        
        // Get the user ID from the subscription metadata
        const deletedSubUserId = deletedSubscription.metadata?.userId;
        
        if (!deletedSubUserId || deletedSubUserId === 'guest') {
          console.error('❌ No user ID found in subscription metadata');
          break;
        }

        try {
          await StripeService.updateSubscriptionStatusAdmin(
            deletedSubUserId,
            deletedSubscription.id,
            deletedSubscription.customer as string,
            'canceled',
            supabaseAdmin
          );
          
          console.log(`✅ Successfully marked subscription as canceled for user ${deletedSubUserId}`);
        } catch (error) {
          console.error('❌ Error updating subscription status:', error);
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
    return new NextResponse('Webhook error: ' + (error instanceof Error ? error.message : 'Unknown error'), { status: 400 });
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