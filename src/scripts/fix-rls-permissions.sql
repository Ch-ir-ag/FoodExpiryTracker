-- Fix Row Level Security Permissions
-- This script fixes the "406 Not Acceptable" error by creating proper policies

-- Create the subscriptions table
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

-- Create user_trials table
CREATE TABLE IF NOT EXISTS public.user_trials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    is_trial_used BOOLEAN DEFAULT FALSE,
    trial_start_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trials ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies first to start clean
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admin can do everything" ON subscriptions;
DROP POLICY IF EXISTS "Allow all for admin" ON subscriptions;
DROP POLICY IF EXISTS "Anyone can read subscriptions temporarily" ON subscriptions;
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON subscriptions;

DROP POLICY IF EXISTS "Users can view their own trials" ON user_trials;
DROP POLICY IF EXISTS "Users can insert their own trials" ON user_trials;
DROP POLICY IF EXISTS "Users can update their own trials" ON user_trials;
DROP POLICY IF EXISTS "Service role can manage all trials" ON user_trials;
DROP POLICY IF EXISTS "Admin can do everything" ON user_trials;
DROP POLICY IF EXISTS "Allow all for admin" ON user_trials;
DROP POLICY IF EXISTS "Anyone can read trials temporarily" ON user_trials;
DROP POLICY IF EXISTS "Service role can manage trials" ON user_trials;

-- Create simplified policies for authenticated users
-- 1. Allow users to view their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
ON subscriptions FOR SELECT
USING (user_id = auth.uid());

-- 2. Allow users to read any subscription data (TEMPORARY FOR DEBUGGING)
CREATE POLICY "Anyone can read subscriptions temporarily"
ON subscriptions FOR SELECT
USING (auth.role() = 'authenticated');

-- 3. Allow service role to do anything with subscriptions
CREATE POLICY "Service role can manage subscriptions"
ON subscriptions
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 4. Allow authenticated users to read their own trial data
CREATE POLICY "Users can view their own trials"
ON user_trials FOR SELECT
USING (user_id = auth.uid());

-- 5. Allow service role to do anything with trials
CREATE POLICY "Service role can manage trials"
ON user_trials
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 6. Allow anyone to view all trials (TEMPORARY FOR DEBUGGING)
CREATE POLICY "Anyone can read trials temporarily"
ON user_trials FOR SELECT
USING (auth.role() = 'authenticated');

-- 7. Allow anon to select from subscriptions (for webhook processing)
CREATE POLICY "Anon can read subscriptions"
ON subscriptions FOR SELECT
USING (auth.role() = 'anon');

-- 8. Allow anon to update subscriptions (for webhook processing)
CREATE POLICY "Anon can update subscriptions"
ON subscriptions FOR UPDATE
USING (auth.role() = 'anon')
WITH CHECK (auth.role() = 'anon');

-- 9. Allow anon to insert into subscriptions (for webhook processing)
CREATE POLICY "Anon can insert subscriptions"
ON subscriptions FOR INSERT
WITH CHECK (auth.role() = 'anon');

-- Create execute_sql function if it doesn't exist
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query text)
RETURNS SETOF RECORD AS $$
BEGIN
    RETURN QUERY EXECUTE sql_query;
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error executing SQL: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '$user, public';

-- Create admin_create_subscription function
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