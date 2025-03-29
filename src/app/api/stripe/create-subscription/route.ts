import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// This is an emergency endpoint to force-create a subscription record 
export async function POST(req: Request) {
  try {
    const { userId, subscriptionId, customerId, status } = await req.json();
    
    if (!userId || !subscriptionId || !customerId) {
      return NextResponse.json({ 
        error: 'Missing required parameters', 
        required: ['userId', 'subscriptionId', 'customerId'],
        received: { userId, subscriptionId, customerId } 
      }, { status: 400 });
    }
    
    console.log('🆘 EMERGENCY: Manual subscription creation requested', {
      userId,
      subscriptionId,
      customerId,
      status: status || 'active'
    });
    
    const supabaseAdmin = getSupabaseAdmin();
    
    // First try using the admin_create_subscription function
    try {
      const { data, error } = await supabaseAdmin.rpc('admin_create_subscription', {
        p_user_id: userId,
        p_stripe_customer_id: customerId,
        p_stripe_subscription_id: subscriptionId,
        p_status: status || 'active'
      });
      
      if (error) {
        console.log('Function call failed, falling back to direct insert', error);
      } else {
        console.log('Successfully created subscription via function call');
        return NextResponse.json({ success: true, method: 'function_call' });
      }
    } catch (funcError) {
      console.error('Error calling admin function:', funcError);
      // Continue to fallback
    }
    
    // Fallback: Direct insert/update
    // 1. Try to insert subscription
    const { error: insertError } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id: userId,
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: customerId,
        status: status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
    if (insertError) {
      console.error('Error creating subscription record:', insertError);
      return NextResponse.json({ error: 'Failed to create subscription record', details: insertError }, { status: 500 });
    }
    
    // 2. Update user_trials
    const { error: trialError } = await supabaseAdmin
      .from('user_trials')
      .upsert({
        user_id: userId,
        is_trial_used: true,
        trial_start_time: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
    if (trialError) {
      console.error('Error updating user trial:', trialError);
      // Don't fail completely if only the trial update fails
    }
    
    return NextResponse.json({ 
      success: true, 
      method: 'direct_insert',
      subscription: {
        userId,
        subscriptionId,
        customerId,
        status: status || 'active'
      } 
    });
    
  } catch (error) {
    console.error('Error in emergency subscription creation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 