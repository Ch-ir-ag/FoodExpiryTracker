import { NextResponse } from 'next/server';
import { StripeService } from '@/services/stripeService';
import { getSupabase, getSupabaseAdmin } from '@/lib/supabase';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    // Extract data from the request
    const { priceId, successUrl, cancelUrl, email } = await req.json();
    
    if (!priceId || !successUrl || !cancelUrl) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Try to get the user from Supabase if they're logged in
    let userId = null;
    try {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
        console.log('User is authenticated:', userId);
      }
    } catch (error) {
      console.log('Not authenticated, continuing with guest checkout');
    }
    
    // Create checkout session (works for both logged-in and guest users)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email || undefined, // Use the user's email if available
      metadata: {
        userId: userId || 'guest', // Track if this was a logged-in user
        source: 'webapp',
        version: '1.0'
      },
      subscription_data: {
        metadata: {
          userId: userId || 'guest', // Also add to subscription for webhook processing
          source: 'webapp',
          version: '1.0'
        },
      },
    });
    
    // Log the checkout session for debugging
    console.log('Created checkout session:', {
      sessionId: session.id,
      userId: userId || 'guest',
      metadata: session.metadata
    });
    
    // Return the session details to the client
    return new NextResponse(
      JSON.stringify({ 
        sessionId: session.id,
        url: session.url 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Failed to create checkout session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 