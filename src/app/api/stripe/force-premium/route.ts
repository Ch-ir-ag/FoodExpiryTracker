import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { getSupabaseAdmin } from '@/lib/supabase';

// This is a direct emergency endpoint to set premium status
export async function GET(request: NextRequest) {
  console.log('Starting force-premium API call');
  const cookieStore = cookies();
  
  try {
    // Use createRouteHandlerClient to properly get user session from cookies
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session || !session.user) {
      console.error('Auth error or no session in force-premium');
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required'
      }, { status: 401 });
    }
    
    const user = session.user;
    console.log(`Forcing premium for user ${user.id}`);
  
    // Get Supabase admin client
    const supabaseAdmin = getSupabaseAdmin();
    
    // Call the sync function which handles upserting both subscription and trial
    const { data: syncResult, error: syncError } = await supabaseAdmin.rpc('sync_stripe_subscription', {
      p_user_id: user.id,
      p_stripe_customer_id: `cus_force_${Date.now()}`, // Use placeholders
      p_stripe_subscription_id: `sub_force_${Date.now()}`, // Use placeholders
      p_status: 'active' // Force active status
    });

    if (syncError || !syncResult) {
      console.error('Error calling sync_stripe_subscription in force-premium:', syncError);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to force premium status via DB function'
      }, { status: 500 });
    }

    console.log('Successfully forced premium status via sync function.');
    return NextResponse.json({ 
      success: true, 
      message: 'Premium status forced via sync function'
    });

  } catch (error) {
    console.error('Error in force-premium:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error forcing premium status: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
} 