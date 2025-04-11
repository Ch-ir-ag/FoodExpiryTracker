import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// This endpoint checks the current user's subscription status
export async function GET(request: NextRequest) {
  console.log('Starting check-subscription-status API call');
  const cookieStore = cookies();
  
  try {
    // First try to get the user from the auth cookie
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting authenticated user:', userError);
      return NextResponse.json({ 
        error: 'Authentication required',
        isAuthenticated: false
      }, { status: 401 });
    }
    
    console.log(`Checking subscription status for user ${user.id}`);
    
    // Try to get the subscription status with admin client for higher privileges
    const supabaseAdmin = getSupabaseAdmin();
    
    // Get subscription status
    const { data: subscription, error: subscriptionError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    if (subscriptionError && subscriptionError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error retrieving subscription:', subscriptionError);
      return NextResponse.json({ 
        error: 'Error retrieving subscription data',
        details: subscriptionError.message,
        code: subscriptionError.code
      }, { status: 500 });
    }
    
    // Get trial status
    const { data: trialData, error: trialError } = await supabaseAdmin
      .from('user_trials')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    if (trialError && trialError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error retrieving trial data:', trialError);
      return NextResponse.json({ 
        error: 'Error retrieving trial data',
        details: trialError.message,
        code: trialError.code
      }, { status: 500 });
    }
    
    // Check RLS policies for debugging
    const { data: policies, error: policyError } = await supabaseAdmin.rpc(
      'execute_sql',
      {
        sql_query: `
          SELECT 
            schemaname, 
            tablename, 
            policyname, 
            permissive,
            roles,
            cmd,
            qual,
            with_check
          FROM 
            pg_policies 
          WHERE 
            tablename IN ('subscriptions', 'user_trials')
        `
      }
    );
    
    console.log(`Retrieved subscription status for user ${user.id}`);
    
    return NextResponse.json({
      isAuthenticated: true,
      user: {
        id: user.id,
        email: user.email
      },
      subscription: subscription || null,
      trial: trialData || null,
      has_subscription: !!subscription,
      is_active: subscription?.status === 'active' || subscription?.status === 'trialing',
      has_used_trial: trialData?.is_trial_used || false,
      debug: {
        policies: policies || [],
        policyError: policyError ? policyError.message : null
      }
    });
  } catch (error) {
    console.error('Uncaught exception in check-subscription-status:', error);
    return NextResponse.json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 