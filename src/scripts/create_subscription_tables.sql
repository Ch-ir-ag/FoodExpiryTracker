-- Create subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    stripe_customer_id TEXT NOT NULL,
    stripe_subscription_id TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id), -- Each user can have only one subscription
    UNIQUE(stripe_customer_id) -- Each customer can have only one entry
);

-- Create user_trials table if it doesn't exist 
CREATE TABLE IF NOT EXISTS public.user_trials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    is_trial_used BOOLEAN DEFAULT FALSE,
    trial_start_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id) -- Each user can only have one trial record
);

-- Enable RLS but with more permissive policies
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Allow all for admin" ON subscriptions;

DROP POLICY IF EXISTS "Users can view their own trials" ON user_trials;
DROP POLICY IF EXISTS "Users can insert their own trials" ON user_trials;
DROP POLICY IF EXISTS "Users can update their own trials" ON user_trials;
DROP POLICY IF EXISTS "Service role can manage all trials" ON user_trials;
DROP POLICY IF EXISTS "Allow all for admin" ON user_trials;

-- More permissive policies for subscriptions
-- Allow users to view their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
ON subscriptions FOR SELECT USING (user_id = auth.uid());

-- Allow service role to do anything
CREATE POLICY "Allow all for admin" 
ON subscriptions USING (true)
WITH CHECK (true);

-- More permissive policies for user_trials
-- Allow users to view their own trials
CREATE POLICY "Users can view their own trials"
ON user_trials FOR SELECT USING (user_id = auth.uid());

-- Allow service role to do anything
CREATE POLICY "Allow all for admin" 
ON user_trials USING (true)
WITH CHECK (true);

-- Create an index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trials_user_id ON public.user_trials(user_id);

-- Create index on stripe_customer_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON public.subscriptions(stripe_customer_id);

-- Create admin function to force-insert subscription data
CREATE OR REPLACE FUNCTION public.admin_create_subscription(
  p_user_id UUID,
  p_stripe_customer_id TEXT,
  p_stripe_subscription_id TEXT,
  p_status TEXT
)
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = '$user, public'
AS $$
DECLARE
  success BOOLEAN;
BEGIN
  -- Attempt to insert, ignoring conflicts
  INSERT INTO public.subscriptions(
    user_id, 
    stripe_customer_id, 
    stripe_subscription_id, 
    status, 
    created_at, 
    updated_at
  )
  VALUES (
    p_user_id,
    p_stripe_customer_id,
    p_stripe_subscription_id,
    p_status,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    stripe_customer_id = p_stripe_customer_id,
    stripe_subscription_id = p_stripe_subscription_id,
    status = p_status,
    updated_at = NOW();
  
  -- Also mark trial as used
  INSERT INTO public.user_trials(
    user_id,
    is_trial_used,
    trial_start_time,
    created_at,
    updated_at
  )
  VALUES (
    p_user_id,
    TRUE,
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    is_trial_used = TRUE,
    trial_start_time = NOW(),
    updated_at = NOW();
  
  RETURN TRUE;
END;
$$; 