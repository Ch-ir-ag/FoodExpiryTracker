-- ESSENTIAL DATABASE SETUP
-- This replaces all previous SQL migrations with a clean, minimal setup

-- 1. TABLE STRUCTURE (Only if you need to recreate tables)
-- Uncomment these if you need to recreate tables from scratch
/*
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  store TEXT NOT NULL,
  date DATE NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  raw_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  purchase_date DATE NOT NULL,
  estimated_expiry_date DATE,
  category TEXT,
  vat_rate DECIMAL(5, 2),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_trials ENABLE ROW LEVEL SECURITY;

-- 3. DROP ALL EXISTING POLICIES (Clean slate)
DROP POLICY IF EXISTS "Users can view their own receipts" ON receipts;
DROP POLICY IF EXISTS "Users can insert their own receipts" ON receipts;
DROP POLICY IF EXISTS "Users can update their own receipts" ON receipts;
DROP POLICY IF EXISTS "Users can delete their own receipts" ON receipts;

DROP POLICY IF EXISTS "Users can view their own receipt items" ON receipt_items;
DROP POLICY IF EXISTS "Users can insert their own receipt items" ON receipt_items;
DROP POLICY IF EXISTS "Users can update their own receipt items" ON receipt_items;
DROP POLICY IF EXISTS "Users can delete their own receipt items" ON receipt_items;

DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON subscriptions;

DROP POLICY IF EXISTS "Users can view their own trials" ON user_trials;
DROP POLICY IF EXISTS "Users can update their own trials" ON user_trials;
DROP POLICY IF EXISTS "Service role can manage all trials" ON user_trials;

-- 4. DROP ALL TRIGGERS AND FUNCTIONS RELATED TO MANUAL DATE ADJUSTMENT
DROP TRIGGER IF EXISTS handle_expiry_correction ON receipt_items;
DROP TRIGGER IF EXISTS handle_expiry_correction_simple ON receipt_items;
DROP TRIGGER IF EXISTS log_receipt_items_updates ON receipt_items;

DROP FUNCTION IF EXISTS handle_expiry_correction();
DROP FUNCTION IF EXISTS handle_expiry_correction_simple();
DROP FUNCTION IF EXISTS log_receipt_items_updates();
DROP FUNCTION IF EXISTS emergency_update_expiry();
DROP FUNCTION IF EXISTS update_item_expiry();
DROP FUNCTION IF EXISTS check_function_exists();
DROP FUNCTION IF EXISTS fix_expiry_date();

-- 5. CREATE BASIC RLS POLICIES FOR RECEIPTS
-- These allow users to only see and manage their own receipts
CREATE POLICY "Users can view their own receipts" 
ON receipts FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own receipts" 
ON receipts FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own receipts" 
ON receipts FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own receipts" 
ON receipts FOR DELETE USING (user_id = auth.uid());

-- 6. CREATE BASIC RLS POLICIES FOR RECEIPT ITEMS
-- These allow users to only see and manage items from their own receipts
CREATE POLICY "Users can view their own receipt items" 
ON receipt_items FOR SELECT USING (
  receipt_id IN (SELECT id FROM receipts WHERE user_id = auth.uid())
);

CREATE POLICY "Users can insert their own receipt items" 
ON receipt_items FOR INSERT WITH CHECK (
  receipt_id IN (SELECT id FROM receipts WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update their own receipt items" 
ON receipt_items FOR UPDATE USING (
  receipt_id IN (SELECT id FROM receipts WHERE user_id = auth.uid())
);

CREATE POLICY "Users can delete their own receipt items" 
ON receipt_items FOR DELETE USING (
  receipt_id IN (SELECT id FROM receipts WHERE user_id = auth.uid())
);

-- 7. CREATE RLS POLICIES FOR SUBSCRIPTIONS 
-- These allow users to view their own subscriptions and service role to manage all subscriptions
CREATE POLICY "Users can view their own subscriptions"
ON subscriptions FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all subscriptions"
ON subscriptions USING ((auth.jwt() ->> 'role') = 'service_role');

-- 8. CREATE RLS POLICIES FOR USER TRIALS
CREATE POLICY "Users can view their own trials"
ON user_trials FOR SELECT USING (user_id = auth.uid());  

CREATE POLICY "Service role can manage all trials"
ON user_trials USING ((auth.jwt() ->> 'role') = 'service_role');

-- 9. CLEAN UP ANY DEBUGGING TABLES
DROP TABLE IF EXISTS update_logs; 