import { stripe } from '@/lib/stripe';
import { getSupabase, getSupabaseAdmin } from '@/lib/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

export class StripeService {
  /**
   * Updates a user's subscription status in the database
   * @param userId - The user ID
   * @param stripeSubscriptionId - The Stripe subscription ID
   * @param stripeCustomerId - The Stripe customer ID
   * @param status - The subscription status
   */
  static async updateSubscriptionStatus(
    userId: string,
    stripeSubscriptionId: string,
    stripeCustomerId: string,
    status: string
  ): Promise<void> {
    const supabase = getSupabase();
    
    try {
      console.log(`Updating subscription for user ${userId}:`, {
        stripeSubscriptionId,
        stripeCustomerId,
        status
      });
      
      if (!supabase) {
        console.error('Supabase client is not available');
        throw new Error('Supabase client is not available');
      }
      
      // Check if the subscription record exists
      const { data: existingSubscription, error: queryError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (queryError && queryError.code !== 'PGRST116') { // PGRST116 is the "no rows returned" error
        console.error('Error checking existing subscription:', queryError);
        throw queryError;
      }
      
      if (existingSubscription) {
        // Update existing subscription
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            stripe_subscription_id: stripeSubscriptionId,
            stripe_customer_id: stripeCustomerId,
            status: status,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
          
        if (updateError) {
          console.error('Error updating subscription:', updateError);
          throw updateError;
        }
        
        console.log(`Updated existing subscription for user ${userId}`);
      } else {
        // Create new subscription record
        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            stripe_subscription_id: stripeSubscriptionId,
            stripe_customer_id: stripeCustomerId,
            status: status,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          
        if (insertError) {
          console.error('Error creating subscription:', insertError);
          throw insertError;
        }
        
        console.log(`Created new subscription for user ${userId}`);
      }
      
      // Also update the user_trials table to mark the trial as started
      try {
        // First check if there's an existing trial for this user
        const { data: existingTrial } = await supabase
          .from('user_trials')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        if (existingTrial) {
          // Update existing trial
          const { error: trialError } = await supabase
            .from('user_trials')
            .update({
              trial_start_time: new Date().toISOString(),
              is_trial_used: true,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
            
          if (trialError) {
            console.error('Error updating user trial:', trialError);
          } else {
            console.log(`Updated trial status for user ${userId}`);
          }
        } else {
          // Create new trial record
          const { error: trialError } = await supabase
            .from('user_trials')
            .insert({
              user_id: userId,
              trial_start_time: new Date().toISOString(),
              is_trial_used: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (trialError) {
            console.error('Error creating user trial:', trialError);
          } else {
            console.log(`Created trial status for user ${userId}`);
          }
        }
      } catch (trialErr) {
        console.error('Exception updating trial status:', trialErr);
      }
    } catch (error) {
      console.error('Error in updateSubscriptionStatus:', error);
      throw error;
    }
  }

  /**
   * Updates a user's subscription status in the database using an admin Supabase client
   * This version is for use in webhook handlers and API routes
   * 
   * @param userId - The user ID
   * @param stripeSubscriptionId - The Stripe subscription ID
   * @param stripeCustomerId - The Stripe customer ID
   * @param status - The subscription status
   * @param supabaseAdmin - An admin Supabase client with service role privileges
   */
  static async updateSubscriptionStatusAdmin(
    userId: string,
    stripeSubscriptionId: string,
    stripeCustomerId: string,
    status: string,
    supabaseAdmin: SupabaseClient
  ): Promise<void> {
    try {
      console.log(`[ADMIN] Updating subscription for user ${userId}:`, {
        stripeSubscriptionId,
        stripeCustomerId,
        status
      });
      
      // Check if the subscription record exists
      const { data: existingSubscription, error: queryError } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (queryError && queryError.code !== 'PGRST116') { // PGRST116 is the "no rows returned" error
        console.error('[ADMIN] Error checking existing subscription:', queryError);
        console.error('[ADMIN] Error details:', {
          code: queryError.code,
          message: queryError.message,
          details: queryError.details,
          hint: queryError.hint,
        });
        throw queryError;
      }
      
      if (existingSubscription) {
        // Update existing subscription
        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            stripe_subscription_id: stripeSubscriptionId,
            stripe_customer_id: stripeCustomerId,
            status: status,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
          
        if (updateError) {
          console.error('[ADMIN] Error updating subscription:', updateError);
          console.error('[ADMIN] Error details:', {
            code: updateError.code,
            message: updateError.message,
            details: updateError.details,
            hint: updateError.hint,
          });
          throw updateError;
        }
        
        console.log(`[ADMIN] Updated existing subscription for user ${userId}`);
      } else {
        // Create new subscription record
        const { error: insertError } = await supabaseAdmin
          .from('subscriptions')
          .insert({
            user_id: userId,
            stripe_subscription_id: stripeSubscriptionId,
            stripe_customer_id: stripeCustomerId,
            status: status,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          
        if (insertError) {
          console.error('[ADMIN] Error creating subscription:', insertError);
          console.error('[ADMIN] Error details:', {
            code: insertError.code,
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
          });
          throw insertError;
        }
        
        console.log(`[ADMIN] Created new subscription for user ${userId}`);
      }
      
      // Also update the user_trials table to mark the trial as started
      try {
        // First check if there's an existing trial for this user
        const { data: existingTrial } = await supabaseAdmin
          .from('user_trials')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        if (existingTrial) {
          // Update existing trial
          const { error: trialError } = await supabaseAdmin
            .from('user_trials')
            .update({
              trial_start_time: new Date().toISOString(),
              is_trial_used: true,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
            
          if (trialError) {
            console.error('[ADMIN] Error updating user trial:', trialError);
          } else {
            console.log(`[ADMIN] Updated trial status for user ${userId}`);
          }
        } else {
          // Create new trial record
          const { error: trialError } = await supabaseAdmin
            .from('user_trials')
            .insert({
              user_id: userId,
              trial_start_time: new Date().toISOString(),
              is_trial_used: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (trialError) {
            console.error('[ADMIN] Error creating user trial:', trialError);
          } else {
            console.log(`[ADMIN] Created trial status for user ${userId}`);
          }
        }
      } catch (trialErr) {
        console.error('[ADMIN] Exception updating trial status:', trialErr);
      }
    } catch (error) {
      console.error('[ADMIN] Error in updateSubscriptionStatusAdmin:', error);
      throw error;
    }
  }

  /**
   * Creates a new Stripe checkout session
   * @param userId - The user ID
   * @param priceId - The Stripe price ID
   * @param successUrl - The URL to redirect to after successful payment
   * @param cancelUrl - The URL to redirect to if payment is canceled
   */
  static async createCheckoutSession(
    userId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ) {
    try {
      // Get the user's email from Supabase
      const supabase = getSupabase();
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();
      
      if (userError || !userData || !userData.email) {
        console.error('Error fetching user email:', userError);
        throw new Error('User email not found');
      }

      // Create a new Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: userData.email,
        metadata: {
          userId: userId,
        },
      });

      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  /**
   * Creates a customer portal session for managing subscriptions
   * @param userId - The user ID
   * @param returnUrl - The URL to return to after the portal session
   */
  static async createPortalSession(userId: string, returnUrl: string) {
    try {
      // Get the user's subscription from Supabase
      const supabase = getSupabase();
      
      if (!supabase) {
        console.error('Supabase client is not available');
        throw new Error('Supabase client is not available');
      }
      
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single();
      
      // PGRST116 is the error code for "no rows returned"
      if (subError && subError.code === 'PGRST116') {
        console.log(`No subscription found for user: ${userId}`);
        throw new Error('No subscription found for user');
      }
      
      if (subError) {
        console.error('Error fetching customer ID:', subError);
        throw new Error('Error fetching subscription: ' + JSON.stringify(subError));
      }
      
      if (!subscription || !subscription.stripe_customer_id) {
        console.error('No stripe_customer_id found in subscription');
        throw new Error('No customer ID found in subscription');
      }
      
      // Create a portal session
      return await StripeService.createPortalSessionWithCustomerId(
        subscription.stripe_customer_id,
        returnUrl
      );
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw error;
    }
  }
  
  /**
   * Creates a customer portal session directly using a Stripe customer ID
   * This is useful when bypassing the need to look up the customer ID from the user ID
   * 
   * @param customerId - The Stripe customer ID
   * @param returnUrl - The URL to return to after the portal session
   */
  static async createPortalSessionWithCustomerId(
    customerId: string,
    returnUrl: string
  ) {
    try {
      console.log(`Creating portal session for customer: ${customerId}`);
      
      // Create a portal session
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });
      
      return session;
    } catch (error) {
      console.error('Error creating portal session with customer ID:', error);
      throw error;
    }
  }
} 