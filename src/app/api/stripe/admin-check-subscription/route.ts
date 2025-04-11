import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { getSupabaseAdmin } from '@/lib/supabase';

// This is a simplified and more reliable endpoint for checking subscriptions
export async function GET(request: NextRequest) {
  console.log('Starting admin-check-subscription API call');
  const cookieStore = cookies();
  
  try {
    // Get the authenticated user using the auth helpers that properly handle cookies
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Better logging to track authentication issues
    if (sessionError) {
      console.error('Error retrieving session:', sessionError.message);
      return NextResponse.json({ 
        isPremium: false, 
        message: 'Session error: ' + sessionError.message
      }, { status: 200 }); // Return 200 to prevent continuous retries
    }
    
    if (!session || !session.user) {
      console.error('No active session found');
      return NextResponse.json({ 
        isPremium: false, 
        message: 'Not authenticated - no active session'
      }, { status: 200 }); // Return 200 to prevent continuous retries
    }
    
    const user = session.user;
    console.log(`Session found for user ${user.id} (${user.email})`);
    console.log(`Checking subscription status for user ${user.id} using admin function`);
    
    // Get Supabase admin client
    const supabaseAdmin = getSupabaseAdmin();
    
    // Try the direct SQL approach which bypasses RLS completely
    const { data, error } = await supabaseAdmin.rpc('execute_sql', {
      sql_query: `
        SELECT 
          s.id, 
          s.user_id, 
          s.stripe_customer_id, 
          s.stripe_subscription_id, 
          s.status,
          s.created_at,
          s.updated_at,
          t.is_trial_used,
          t.trial_start_time
        FROM 
          subscriptions s
        LEFT JOIN
          user_trials t ON s.user_id = t.user_id
        WHERE 
          s.user_id = '${user.id}'
      `
    });
    
    if (error) {
      console.error('SQL execution error:', error);
      
      // Fallback to direct table access with admin client
      const { data: subscription, error: subError } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (subError && subError.code !== 'PGRST116') {
        console.error('Error fetching subscription:', subError);
        return NextResponse.json({ 
          isPremium: false,
          message: 'Error checking subscription'
        });
      }
      
      if (subscription) {
        const isActive = ['active', 'trialing'].includes(subscription.status);
        console.log(`Found subscription via admin client: status=${subscription.status}, isActive=${isActive}`);
        
        return NextResponse.json({ 
          isPremium: isActive,
          status: subscription.status,
          subscriptionId: subscription.stripe_subscription_id,
          method: 'admin_direct'
        });
      }
    } else {
      // Process SQL result
      if (data && data.length > 0) {
        const subscription = data[0];
        const isActive = ['active', 'trialing'].includes(subscription.status);
        console.log(`Found subscription via SQL: status=${subscription.status}, isActive=${isActive}`);
        
        return NextResponse.json({ 
          isPremium: isActive,
          status: subscription.status,
          subscriptionId: subscription.stripe_subscription_id,
          trialUsed: subscription.is_trial_used,
          method: 'admin_sql'
        });
      }
    }
    
    // If we get here, no subscription was found
    console.log(`No subscription found for user ${user.id}`);
    return NextResponse.json({ 
      isPremium: false,
      message: 'No subscription found',
      userId: user.id
    });
    
  } catch (error) {
    console.error('Error in admin-check-subscription:', error);
    return NextResponse.json({ 
      isPremium: false, 
      message: 'Error checking subscription status: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 200 }); // Return 200 to prevent continuous retries
  }
} 