import { NextResponse } from 'next/server';
import { StripeService } from '@/services/stripeService';
import { getSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    // Extract data from the request
    const { priceId, successUrl, cancelUrl } = await req.json();
    
    if (!priceId || !successUrl || !cancelUrl) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the current user from Supabase
    const supabase = getSupabase();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Create a checkout session
    const session = await StripeService.createCheckoutSession(
      user.id,
      priceId,
      successUrl,
      cancelUrl
    );
    
    // Return the session ID to the client
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