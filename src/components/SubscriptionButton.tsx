'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

// Load Stripe outside of component render to avoid recreating Stripe object on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface SubscriptionButtonProps {
  priceId: string;
  buttonText?: string;
  className?: string;
}

export default function SubscriptionButton({
  priceId,
  buttonText = 'Subscribe',
  className = '',
}: SubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      
      // Create a checkout session - no authentication check
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/subscription/success`,
          cancelUrl: `${window.location.origin}/subscription/cancel`,
          email: user?.email, // Will be undefined if not logged in, which is fine
        }),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }
      
      const { url, sessionId } = data;
      
      if (!url) {
        throw new Error('No checkout URL received from the server');
      }
      
      // Store the session ID in case we need it later
      localStorage.setItem('stripeCheckoutSessionId', sessionId);
      
      // Redirect to Stripe Checkout
      window.location.href = url;
      
    } catch (error: any) {
      console.error('Error initiating checkout:', error);
      toast.error(`Checkout failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading}
      className={`px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 ${className}`}
    >
      {isLoading ? 'Loading...' : buttonText}
    </button>
  );
} 