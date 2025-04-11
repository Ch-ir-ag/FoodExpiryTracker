# Fixing Stripe Subscription Integration with Supabase

This document provides instructions for fixing the "406 Not Acceptable" error when trying to access subscription data from Supabase in the client-side code.

## The Problem

The main issue is related to Row Level Security (RLS) policies in Supabase that are preventing proper access to the subscription tables. The error "`406 Not Acceptable`" occurs when the client tries to access data it doesn't have permission to view due to restrictive RLS policies.

## Solution

1. **Run the SQL script** to fix RLS policies:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Create a new query
   - Copy and paste the contents of `src/scripts/fix-rls-policies-final.sql`
   - Run the query

2. **Update the API routes** to properly handle subscription checks:
   - Ensure the `admin-check-subscription` API route is properly implemented
   - This endpoint uses the admin client and SQL functions to bypass RLS restrictions

3. **Test the subscription system**:
   - Log in to the application
   - Check subscription status via the new endpoint
   - Try to subscribe to a plan
   - Monitor console logs for any remaining errors

## Understanding the Fix

The solution uses several complementary approaches:

### 1. Improved RLS Policies

The SQL script creates proper RLS policies that allow:
- Users to view their own subscription data
- Service role to manage all subscription data
- SQL functions with `SECURITY DEFINER` to bypass RLS completely

### 2. Reliable API Endpoints

Rather than relying on direct client-side database access, the solution uses server-side API endpoints with admin privileges to check and update subscription data.

### 3. Robust Error Handling

The client-side code is updated to handle failures gracefully, with multiple fallback mechanisms and retry logic.

## Troubleshooting

If you still experience issues after implementing these fixes:

1. Make sure all SQL scripts have run successfully
2. Check the browser console for specific error messages
3. Verify the RLS policies by running:
   ```sql
   SELECT 
     schemaname, 
     tablename, 
     policyname, 
     roles,
     cmd
   FROM 
     pg_policies 
   WHERE 
     tablename IN ('subscriptions', 'user_trials')
   ```
4. Ensure the service role key is correctly set in your environment variables
5. Test the admin API endpoint directly in the browser or with a tool like Postman

## Reverting Changes

If you need to revert to the previous state:
1. Run a query to remove all RLS policies
2. Create minimal RLS policies based on your requirements
3. Restore previous API endpoints if needed 