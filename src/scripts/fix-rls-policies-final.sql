-- FINAL FIX FOR RLS POLICIES
-- This script addresses the 406 Not Acceptable error by fixing the RLS policies once and for all

-- Ensure tables exist
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    stripe_customer_id TEXT NOT NULL,
    stripe_subscription_id TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.user_trials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    is_trial_used BOOLEAN DEFAULT FALSE,
    trial_start_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trials ENABLE ROW LEVEL SECURITY;

-- Remove all existing policies
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admin can do everything" ON subscriptions;
DROP POLICY IF EXISTS "Allow all for admin" ON subscriptions;
DROP POLICY IF EXISTS "Anyone can read subscriptions temporarily" ON subscriptions;
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Anon can read subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Anon can update subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Anon can insert subscriptions" ON subscriptions;

DROP POLICY IF EXISTS "Users can view their own trials" ON user_trials;
DROP POLICY IF EXISTS "Users can insert their own trials" ON user_trials;
DROP POLICY IF EXISTS "Users can update their own trials" ON user_trials;
DROP POLICY IF EXISTS "Service role can manage all trials" ON user_trials;
DROP POLICY IF EXISTS "Admin can do everything" ON user_trials;
DROP POLICY IF EXISTS "Allow all for admin" ON user_trials;
DROP POLICY IF EXISTS "Anyone can read trials temporarily" ON user_trials;
DROP POLICY IF EXISTS "Service role can manage trials" ON user_trials;
DROP POLICY IF EXISTS "Anon can read trials" ON user_trials;
DROP POLICY IF EXISTS "Anon can update trials" ON user_trials;
DROP POLICY IF EXISTS "Anon can insert trials" ON user_trials;

-- Create new policies that actually work correctly

-- 1. Basic user-specific select policy for subscriptions
CREATE POLICY "Users can select their own subscriptions"
ON subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- 2. Service role full access for subscriptions 
CREATE POLICY "Service role full access for subscriptions"
ON subscriptions
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 3. Authenticated users can select subscriptions belonging to themselves
CREATE POLICY "Authenticated users select their own subscriptions"
ON subscriptions FOR SELECT
USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- 4. Basic user-specific select policy for trials
CREATE POLICY "Users can select their own trials"
ON user_trials FOR SELECT
USING (auth.uid() = user_id);

-- 5. Service role full access for trials
CREATE POLICY "Service role full access for trials"
ON user_trials
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 6. Authenticated users can select trials belonging to themselves
CREATE POLICY "Authenticated users select their own trials"
ON user_trials FOR SELECT
USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Create or replace the admin function to create subscriptions
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
  -- Attempt to insert or update subscription
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
  
  -- Update trial record
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
    CASE WHEN p_status = 'trialing' THEN NOW() ELSE NULL END,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    is_trial_used = TRUE,
    trial_start_time = CASE WHEN p_status = 'trialing' THEN NOW() ELSE user_trials.trial_start_time END,
    updated_at = NOW();
  
  RETURN TRUE;
END;
$$;

-- Drop existing execute_sql function before recreating it
DROP FUNCTION IF EXISTS public.execute_sql(text);

-- Create a SQL execution function if needed
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query text)
RETURNS SETOF RECORD
LANGUAGE plpgsql
SECURITY DEFINER 
AS $$
BEGIN
    RETURN QUERY EXECUTE sql_query;
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error executing SQL: %', SQLERRM;
END;
$$;

-- Make sure everyone can execute the subscription function
GRANT EXECUTE ON FUNCTION public.admin_create_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_subscription TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_create_subscription TO anon;

-- Grant base read permissions to authenticated users
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO authenticated;

-- Grant all privileges to service_role
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role; 