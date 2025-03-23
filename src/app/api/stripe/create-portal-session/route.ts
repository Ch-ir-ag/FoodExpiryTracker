import { NextResponse } from 'next/server';
import { StripeService } from '@/services/stripeService';
import { getSupabase } from '@/lib/supabase';

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
    
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Failed to create portal session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 