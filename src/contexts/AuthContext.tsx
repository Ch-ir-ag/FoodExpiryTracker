'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isPremium: boolean;
  premiumLoading: boolean;
  checkSubscriptionStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isPremium: false,
  premiumLoading: true,
  checkSubscriptionStatus: async () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumLoading, setPremiumLoading] = useState(true);
  const [lastCheckTime, setLastCheckTime] = useState(0);
  const RETRY_COOLDOWN_MS = 10000; // 10 seconds between retry attempts
  const MAX_RETRIES = 3; // Maximum number of consecutive retries
  const [retryCount, setRetryCount] = useState(0);

  // Function to check subscription status
  const checkSubscriptionStatus = async (): Promise<boolean> => {
    // Check if we've made a request too recently
    const currentTime = Date.now();
    if (currentTime - lastCheckTime < RETRY_COOLDOWN_MS) {
      console.log('Skipping subscription check - too soon since last check');
      return isPremium; // Return current state
    }
    
    setLastCheckTime(currentTime);
    
    if (!user) {
      setIsPremium(false);
      setPremiumLoading(false);
      setRetryCount(0); // Reset retry count
      return false;
    }

    if (!supabase) {
      console.error('Supabase client is not available');
      setIsPremium(false);
      setPremiumLoading(false);
      return false;
    }

    try {
      setPremiumLoading(true);
      console.log('Checking subscription status for user:', user.id);

      // First try to get subscription from direct table query
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // PGRST116 is the error code for "no rows returned"
      if (subError && subError.code === 'PGRST116') {
        console.log('No subscription found for user:', user.id);
        
        // If we've already retried several times, stop trying the API fallback
        if (retryCount >= MAX_RETRIES) {
          console.log(`Max retries (${MAX_RETRIES}) reached, giving up on API fallback`);
          setIsPremium(false);
          setRetryCount(0); // Reset for next time
          return false;
        }
        
        // As a fallback, try fetching from API
        try {
          console.log('Trying API fallback to check subscription');
          const response = await fetch('/api/stripe/check-subscription', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('API subscription check result:', data);
            setIsPremium(data.isPremium || false);
            
            if (data.isPremium) {
              setRetryCount(0); // Reset retry count on success
            } else {
              // Increment retry count only for non-premium responses
              setRetryCount(prev => prev + 1);
            }
            
            return data.isPremium || false;
          } else {
            // Increment retry count for failed requests
            setRetryCount(prev => prev + 1);
          }
        } catch (apiError) {
          console.error('API fallback subscription check failed:', apiError);
          setRetryCount(prev => prev + 1);
        }
        
        setIsPremium(false);
        return false;
      }
      
      if (subError) {
        console.error('Error fetching subscription:', subError);
        setIsPremium(false);
        return false;
      }

      // Check if user has an active subscription
      const hasActiveSubscription = subscription && 
        ['active', 'trialing'].includes(subscription.status);
      
      console.log('Subscription status:', subscription?.status || 'no subscription');
      setIsPremium(hasActiveSubscription);
      setRetryCount(0); // Reset retry count on successful DB query
      return hasActiveSubscription;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      setIsPremium(false);
      return false;
    } finally {
      setPremiumLoading(false);
    }
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      // Show welcome message if user is logged in
      if (session?.user && typeof window !== 'undefined') {
        const storedUid = localStorage.getItem('lastSignInUid');
        if (storedUid !== session.user.id) {
          // Only show welcome message on first sign-in or when a different user signs in
          toast.success('Welcome to Expiroo!');
          localStorage.setItem('lastSignInUid', session.user.id);
        }
      }
      
      setLoading(false);
    });

    // Listen for changes on auth state (signed in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check subscription status whenever user changes
  useEffect(() => {
    checkSubscriptionStatus();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, isPremium, premiumLoading, checkSubscriptionStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
}; 