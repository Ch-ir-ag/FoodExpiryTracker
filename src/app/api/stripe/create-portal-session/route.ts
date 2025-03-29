import { NextResponse } from 'next/server';
import { StripeService } from '@/services/stripeService';
import { getSupabase, getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    // Extract the return URL from the request
    const { returnUrl } = await req.json();
    
    if (!returnUrl) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing returnUrl parameter' }),
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
    
    try {
      // Create a portal session
      const session = await StripeService.createPortalSession(
        user.id,
        returnUrl
      );
      
      // Return the session URL to the client
      return new NextResponse(
        JSON.stringify({ url: session.url }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (portalError: any) {
      console.error('Error creating portal session:', portalError);
      
      // If we get "No subscription found for user" error, it might be because
      // the client-side Supabase instance doesn't have access to the subscription
      // Try again with the admin client
      if (portalError.message === 'No subscription found for user') {
        try {
          console.log('Retrying portal session creation with admin client');
          // Get a Supabase admin client
          const supabaseAdmin = getSupabaseAdmin();
          
          // Get the customer ID from the admin client
          const { data: subscription, error: subError } = await supabaseAdmin
            .from('subscriptions')
            .select('stripe_customer_id')
            .eq('user_id', user.id)
            .single();
          
          if (subError || !subscription || !subscription.stripe_customer_id) {
            return new NextResponse(
              JSON.stringify({ error: 'No active subscription found' }),
              { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
          }
          
          // Create a portal session using the customer ID
          const portalSession = await StripeService.createPortalSessionWithCustomerId(
            subscription.stripe_customer_id,
            returnUrl
          );
          
          // Return the session URL to the client
          return new NextResponse(
            JSON.stringify({ url: portalSession.url }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        } catch (adminError: any) {
          console.error('Error creating portal session with admin client:', adminError);
          return new NextResponse(
            JSON.stringify({ error: adminError.message || 'Failed to create portal session' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
      
      return new NextResponse(
        JSON.stringify({ error: portalError.message || 'Failed to create portal session' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Failed to create portal session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 