-- Add Row Level Security Policies
-- Run this after the tables have been created successfully

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