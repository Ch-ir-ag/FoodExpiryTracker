import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { getSupabaseAdmin } from '@/lib/supabase';

// This is a simplified and more reliable endpoint for checking subscriptions
export async function GET(request: NextRequest) {
  console.log('Starting admin-check-subscription API call');
  const cookieStore = cookies();
  
  try {
    // Use createRouteHandlerClient to properly get user session from cookies
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error retrieving session in admin-check-subscription:', sessionError.message);
      return NextResponse.json({ 
        isPremium: false, 
        message: 'Session error: ' + sessionError.message
      }, { status: 200 });
    }
    
    if (!session || !session.user) {
      console.error('No active session found in admin-check-subscription');
      return NextResponse.json({ 
        isPremium: false, 
        message: 'Not authenticated - no active session'
      }, { status: 200 });
    }
    
    const user = session.user;
    console.log(`Session found for user ${user.id} (${user.email})`);
    console.log(`Checking subscription status for user ${user.id} using admin check`);
    
    // Use Supabase admin client for direct database access
    const supabaseAdmin = getSupabaseAdmin();
    
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('status, stripe_subscription_id')
      .eq('user_id', user.id)
      .maybeSingle();
      
    if (subError && subError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching subscription using admin client:', subError);
      return NextResponse.json({ 
        isPremium: false,
        message: 'Error checking subscription'
      }, { status: 500 }); // Return 500 for server error
    }
    
    if (subscription) {
      const isActive = ['active', 'trialing', 'past_due'].includes(subscription.status);
      console.log(`Found subscription via admin client: status=${subscription.status}, isActive=${isActive}`);
      
      return NextResponse.json({ 
        isPremium: isActive,
        status: subscription.status,
        subscriptionId: subscription.stripe_subscription_id,
        method: 'admin_direct'
      });
    }
    
    // If we get here, no subscription was found in the database
    console.log(`No subscription found for user ${user.id} using admin client`);
    return NextResponse.json({ 
      isPremium: false,
      message: 'No subscription found',
      userId: user.id,
      method: 'admin_direct'
    }, { status: 200 }); // Return 200 OK, just no subscription
    
  } catch (error) {
    console.error('Error in admin-check-subscription:', error);
    return NextResponse.json({ 
      isPremium: false, 
      message: 'Error checking subscription status: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 }); // Return 500 for server error
  }
} 