-- EMERGENCY RLS FIX
-- Simple script to disable RLS entirely for testing

-- Create tables if they don't exist
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

-- First, drop all policies
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
DROP POLICY IF EXISTS "Users can select their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Service role full access for subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Authenticated users select their own subscriptions" ON subscriptions;

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
DROP POLICY IF EXISTS "Users can select their own trials" ON user_trials;
DROP POLICY IF EXISTS "Service role full access for trials" ON user_trials;
DROP POLICY IF EXISTS "Authenticated users select their own trials" ON user_trials;

-- Create a single policy that allows EVERYONE to do EVERYTHING (for testing)
CREATE POLICY "Allow all operations for everyone" 
ON subscriptions 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations for everyone" 
ON user_trials
USING (true) 
WITH CHECK (true);

-- Make sure RLS is enabled
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trials ENABLE ROW LEVEL SECURITY;

-- Insert a test subscription for your user if one doesn't exist
INSERT INTO public.subscriptions (
    user_id,
    stripe_customer_id,
    stripe_subscription_id,
    status
)
VALUES (
    '0ea1dfda-ce6b-4956-bc1b-d1ce51c7b6fa',  -- Your user ID
    'cus_test',                             -- Placeholder customer ID
    'sub_test',                             -- Placeholder subscription ID
    'active'                                -- Set as active
)
ON CONFLICT (user_id) 
DO UPDATE SET 
    status = 'active',
    updated_at = NOW();

-- Insert a trial record for your user
INSERT INTO public.user_trials (
    user_id,
    is_trial_used,
    trial_start_time
)
VALUES (
    '0ea1dfda-ce6b-4956-bc1b-d1ce51c7b6fa',  -- Your user ID
    TRUE,
    NOW()
)
ON CONFLICT (user_id)
DO UPDATE SET
    is_trial_used = TRUE,
    updated_at = NOW(); 