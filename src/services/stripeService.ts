import { stripe } from '@/lib/stripe';
import { getSupabase } from '@/lib/supabase';

export class StripeService {
  /**
   * Updates a user's subscription status in the database
   * @param userId - The user ID
   * @param stripeSubscriptionId - The Stripe subscription ID
   * @param status - The subscription status
   */
  static async updateSubscriptionStatus(
    userId: string,
    stripeSubscriptionId: string | null,
    status: string
  ): Promise<void> {
    const supabase = getSupabase();
    
    try {
      // Check if the subscription record exists
      const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (existingSubscription) {
        // Update existing subscription
        await supabase
          .from('subscriptions')
          .update({
            stripe_subscription_id: stripeSubscriptionId,
            status: status,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
      } else {
        // Create new subscription record
        await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            stripe_subscription_id: stripeSubscriptionId,
            status: status,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
      }
    } catch (error) {
      console.error('Error updating subscription status:', error);
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
      const { data: userData } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();
      
      if (!userData || !userData.email) {
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
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single();
      
      if (!subscription || !subscription.stripe_customer_id) {
        throw new Error('No subscription found for user');
      }
      
      // Create a portal session
      const session = await stripe.billingPortal.sessions.create({
        customer: subscription.stripe_customer_id,
        return_url: returnUrl,
      });
      
      return session;
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw error;
    }
  }
} 