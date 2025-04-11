import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { getSupabaseAdmin } from '@/lib/supabase';

// This is a direct emergency endpoint to set premium status
export async function GET(request: NextRequest) {
  console.log('Starting force-premium API call');
  const cookieStore = cookies();
  
  // Get the authenticated user
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session || !session.user) {
    return NextResponse.json({ 
      success: false, 
      message: 'Authentication required'
    }, { status: 401 });
  }
  
  const user = session.user;
  console.log(`Forcing premium for user ${user.id}`);
  
  try {
    // Get Supabase admin client
    const supabaseAdmin = getSupabaseAdmin();
    
    // Try multiple approaches to ensure success
    
    // 1. Try direct SQL execution
    try {
      const { error: sqlError } = await supabaseAdmin.rpc('execute_sql', {
        sql_query: `
          INSERT INTO public.subscriptions (
            user_id,
            stripe_customer_id,
            stripe_subscription_id,
            status,
            created_at,
            updated_at
          ) VALUES (
            '${user.id}',
            'cus_force_${Date.now()}',
            'sub_force_${Date.now()}',
            'active',
            NOW(),
            NOW()
          ) ON CONFLICT (user_id) DO UPDATE SET
            status = 'active',
            updated_at = NOW();
          
          INSERT INTO public.user_trials (
            user_id,
            is_trial_used,
            trial_start_time,
            created_at,
            updated_at
          ) VALUES (
            '${user.id}',
            TRUE,
            NOW(),
            NOW(),
            NOW()
          ) ON CONFLICT (user_id) DO UPDATE SET
            is_trial_used = TRUE,
            updated_at = NOW();
        `
      });
      
      if (sqlError) {
        console.error('SQL error:', sqlError);
      } else {
        console.log('Successfully set premium via SQL');
        return NextResponse.json({ 
          success: true, 
          message: 'Premium status set via SQL'
        });
      }
    } catch (sqlError) {
      console.error('SQL execution error:', sqlError);
    }
    
    // 2. Try admin_create_subscription function
    try {
      const { error: funcError } = await supabaseAdmin.rpc('admin_create_subscription', {
        p_user_id: user.id,
        p_stripe_customer_id: `cus_force_${Date.now()}`,
        p_stripe_subscription_id: `sub_force_${Date.now()}`,
        p_status: 'active'
      });
      
      if (funcError) {
        console.error('Function error:', funcError);
      } else {
        console.log('Successfully set premium via function');
        return NextResponse.json({ 
          success: true, 
          message: 'Premium status set via function'
        });
      }
    } catch (funcError) {
      console.error('Function execution error:', funcError);
    }
    
    // 3. Try direct insert
    try {
      // First try subscriptions
      const { error: subError } = await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          stripe_customer_id: `cus_force_${Date.now()}`,
          stripe_subscription_id: `sub_force_${Date.now()}`,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (subError) {
        console.error('Subscription insert error:', subError);
      }
      
      // Then try trials
      const { error: trialError } = await supabaseAdmin
        .from('user_trials')
        .upsert({
          user_id: user.id,
          is_trial_used: true,
          trial_start_time: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (trialError) {
        console.error('Trial insert error:', trialError);
      }
      
      if (!subError || !trialError) {
        console.log('Successfully set premium via direct insert');
        return NextResponse.json({ 
          success: true, 
          message: 'Premium status set via direct insert'
        });
      }
    } catch (insertError) {
      console.error('Insert error:', insertError);
    }
    
    // If we made it here, all attempts failed
    return NextResponse.json({ 
      success: false, 
      message: 'All methods failed to set premium status'
    }, { status: 500 });
    
  } catch (error) {
    console.error('Error in force-premium:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error forcing premium status: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
} 