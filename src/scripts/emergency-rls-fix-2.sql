-- EMERGENCY RLS FIX (VERSION 2)
-- Simple script to disable RLS entirely for testing and handle unique constraint issues

-- First check if tables exist
DO $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  -- Check if subscriptions table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'subscriptions'
  ) INTO table_exists;
  
  -- If table doesn't exist, create it with proper constraints
  IF NOT table_exists THEN
    CREATE TABLE public.subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id),
      stripe_customer_id TEXT NOT NULL,
      stripe_subscription_id TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id)
    );
  ELSE
    -- If table exists but doesn't have the unique constraint, add it
    BEGIN
      ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);
    EXCEPTION WHEN duplicate_table THEN
      -- Constraint already exists, do nothing
    END;
  END IF;
  
  -- Check if user_trials table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_trials'
  ) INTO table_exists;
  
  -- If table doesn't exist, create it with proper constraints
  IF NOT table_exists THEN
    CREATE TABLE public.user_trials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id),
      is_trial_used BOOLEAN DEFAULT FALSE,
      trial_start_time TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id)
    );
  ELSE
    -- If table exists but doesn't have the unique constraint, add it
    BEGIN
      ALTER TABLE public.user_trials ADD CONSTRAINT user_trials_user_id_key UNIQUE (user_id);
    EXCEPTION WHEN duplicate_table THEN
      -- Constraint already exists, do nothing
    END;
  END IF;
END $$;

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
DROP POLICY IF EXISTS "Allow all operations for everyone" ON subscriptions;

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
DROP POLICY IF EXISTS "Allow all operations for everyone" ON user_trials;

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

-- Insert a test subscription for your user by checking first if user exists
DO $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  -- Check if user exists in auth.users
  SELECT EXISTS (
    SELECT FROM auth.users 
    WHERE id = '0ea1dfda-ce6b-4956-bc1b-d1ce51c7b6fa'
  ) INTO user_exists;
  
  IF user_exists THEN
    -- Delete any existing subscriptions for this user first to avoid conflicts
    DELETE FROM public.subscriptions 
    WHERE user_id = '0ea1dfda-ce6b-4956-bc1b-d1ce51c7b6fa';
    
    -- Insert fresh subscription
    INSERT INTO public.subscriptions (
      user_id,
      stripe_customer_id,
      stripe_subscription_id,
      status,
      created_at,
      updated_at
    )
    VALUES (
      '0ea1dfda-ce6b-4956-bc1b-d1ce51c7b6fa',
      'cus_test_' || extract(epoch from now()),
      'sub_test_' || extract(epoch from now()),
      'active',
      NOW(),
      NOW()
    );
    
    -- Delete any existing trial records for this user
    DELETE FROM public.user_trials 
    WHERE user_id = '0ea1dfda-ce6b-4956-bc1b-d1ce51c7b6fa';
    
    -- Insert fresh trial record
    INSERT INTO public.user_trials (
      user_id,
      is_trial_used,
      trial_start_time,
      created_at,
      updated_at
    )
    VALUES (
      '0ea1dfda-ce6b-4956-bc1b-d1ce51c7b6fa',
      TRUE,
      NOW(),
      NOW(),
      NOW()
    );
  END IF;
END $$; 