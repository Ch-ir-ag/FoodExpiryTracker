import { NextResponse } from 'next/server';
import { getSupabase, getSupabaseAdmin } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';

export async function GET(req: Request) {
  try {
    // Get the user from Supabase
    const supabase = getSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error in check-subscription:', authError.message);
      // Don't return 401, return isPremium: false with 200 to prevent continuous retries
      return NextResponse.json({ 
        isPremium: false, 
        message: 'Authentication required'
      }, { status: 200 });
    }
    
    if (!user) {
      // Don't return 401, return isPremium: false with 200 to prevent continuous retries
      return NextResponse.json({ 
        isPremium: false, 
        message: 'Not authenticated'
      }, { status: 200 });
    }
    
    console.log('Checking subscription status via API for user:', user.id);
    
    // First attempt: Check Supabase database directly using admin client
    const supabaseAdmin = getSupabaseAdmin();
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    // If no subscription found and no error
    if (subError && subError.code === 'PGRST116') {
      console.log('No subscription found in database for user:', user.id);
    } else if (subError) {
      console.error('Error checking subscription in database:', subError);
    } else if (subscription) {
      // Check if subscription is active
      const isActive = ['active', 'trialing'].includes(subscription.status);
      console.log(`Found subscription status: ${subscription.status}, isActive: ${isActive}`);
      
      return NextResponse.json({ 
        isPremium: isActive,
        status: subscription.status,
        subscriptionId: subscription.stripe_subscription_id
      });
    }
    
    // Second attempt: Check with Stripe directly
    try {
      // Find customer associated with this user
      const { data: customerData } = await supabaseAdmin
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user.id);
      
      if (customerData && customerData.length > 0) {
        const customerId = customerData[0].stripe_customer_id;
        
        // Get subscriptions for this customer
        const stripeSubscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: 'all',
          limit: 1
        });
        
        if (stripeSubscriptions.data.length > 0) {
          const latestSubscription = stripeSubscriptions.data[0];
          const isActive = ['active', 'trialing'].includes(latestSubscription.status);
          
          console.log(`Found subscription in Stripe: ${latestSubscription.id}, status: ${latestSubscription.status}`);
          
          // Update our database with this information
          await supabaseAdmin
            .from('subscriptions')
            .upsert({
              user_id: user.id,
              stripe_customer_id: customerId,
              stripe_subscription_id: latestSubscription.id,
              status: latestSubscription.status,
              updated_at: new Date().toISOString()
            });
            
          return NextResponse.json({ 
            isPremium: isActive,
            status: latestSubscription.status,
            subscriptionId: latestSubscription.id
          });
        }
      }
    } catch (stripeError) {
      console.error('Error checking with Stripe API:', stripeError);
    }
    
    // Default fallback: User is not premium
    return NextResponse.json({ isPremium: false });
    
  } catch (error) {
    console.error('Error in subscription check API:', error);
    // Return 200 with isPremium: false instead of error to prevent endless retries
    return NextResponse.json({ 
      isPremium: false, 
      message: 'Failed to check subscription status' 
    }, { status: 200 });
  }
} 