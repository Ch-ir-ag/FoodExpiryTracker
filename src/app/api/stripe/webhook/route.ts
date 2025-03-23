import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { StripeService } from '@/services/stripeService';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    // Verify the event came from Stripe using the webhook secret
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  console.log(`Stripe webhook event received: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Extract metadata from the session
        const userId = session.metadata?.userId;
        if (!userId) {
          console.error('No userId found in session metadata');
          break;
        }
        
        console.log(`Checkout completed for user: ${userId}`);
        
        // Update subscription status in the database
        await StripeService.updateSubscriptionStatus(
          userId, 
          session.subscription as string, 
          'active'
        );
        
        break;
        
      case 'customer.subscription.created':
        const subscriptionCreated = event.data.object as Stripe.Subscription;
        console.log(`Subscription created: ${subscriptionCreated.id}`);
        
        // Get customer ID to find the user
        const customerCreated = subscriptionCreated.customer as string;
        // Need to have a way to look up user by customer ID
        // For now, we'll handle this through the checkout.session.completed event
        
        break;
        
      case 'customer.subscription.updated':
        const subscriptionUpdated = event.data.object as Stripe.Subscription;
        const statusUpdated = subscriptionUpdated.status;
        console.log(`Subscription updated: ${subscriptionUpdated.id}, status: ${statusUpdated}`);
        
        // Get customer ID to find the user
        const customerUpdated = subscriptionUpdated.customer as string;
        // Update the subscription status based on customer ID
        // This would require a lookup from customer ID to user ID
        
        break;
        
      case 'customer.subscription.deleted':
        const subscriptionDeleted = event.data.object as Stripe.Subscription;
        console.log(`Subscription deleted: ${subscriptionDeleted.id}`);
        
        // Get customer ID to find the user
        const customerDeleted = subscriptionDeleted.customer as string;
        // Update the subscription status based on customer ID
        // This would require a lookup from customer ID to user ID
        
        break;
        
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment succeeded: ${paymentIntent.id}`);
        
        // Add your business logic here
        break;
        
      case 'payment_intent.payment_failed':
        const paymentFailed = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed: ${paymentFailed.id}`);
        
        // Add your business logic here
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('Error processing webhook event:', error);
    return new NextResponse(`Error processing webhook: ${error}`, { status: 500 });
  }

  // Return a response to acknowledge receipt of the event
  return new NextResponse(JSON.stringify({ received: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
} 