'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function TestSubscriptionPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM subscriptions LIMIT 10;');
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [tables, setTables] = useState<any>(null);
  const [formData, setFormData] = useState({
    stripeCustomerId: '',
    stripeSubscriptionId: '',
    status: 'active'
  });
  
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (user) {
          setUser(user);
          await checkSubscriptionStatus();
        }
      } catch (err) {
        console.error('Auth error:', err);
        setError(err instanceof Error ? err.message : 'Authentication error');
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();
  }, []);
  
  async function checkSubscriptionStatus() {
    try {
      setLoading(true);
      const response = await fetch('/api/stripe/check-subscription-status');
      const data = await response.json();
      
      if (response.ok) {
        setSubscriptionStatus(data);
        setError(null);
      } else {
        setError(data.error || 'Failed to check subscription status');
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
      setError(err instanceof Error ? err.message : 'Error checking subscription');
    } finally {
      setLoading(false);
    }
  }
  
  async function runSqlQuery() {
    try {
      setLoading(true);
      setSqlError(null);
      
      const response = await fetch('/api/admin/run-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sqlQuery })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setSqlResult(result);
      } else {
        setSqlError(result.error || 'Failed to run SQL query');
      }
    } catch (err) {
      console.error('Error running SQL:', err);
      setSqlError(err instanceof Error ? err.message : 'Error running SQL query');
    } finally {
      setLoading(false);
    }
  }
  
  async function checkTables() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/check-tables');
      const data = await response.json();
      
      if (response.ok) {
        setTables(data);
      } else {
        setError(data.error || 'Failed to check tables');
      }
    } catch (err) {
      console.error('Error checking tables:', err);
      setError(err instanceof Error ? err.message : 'Error checking tables');
    } finally {
      setLoading(false);
    }
  }
  
  async function createSubscription() {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stripeCustomerId: formData.stripeCustomerId,
          stripeSubscriptionId: formData.stripeSubscriptionId,
          status: formData.status || 'active'
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        await checkSubscriptionStatus();
        alert('Subscription created successfully!');
      } else {
        setError(result.error || 'Failed to create subscription');
      }
    } catch (err) {
      console.error('Error creating subscription:', err);
      setError(err instanceof Error ? err.message : 'Error creating subscription');
    } finally {
      setLoading(false);
    }
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  if (loading && !user) {
    return <div className="min-h-screen bg-gray-900 text-white p-8">Loading...</div>;
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Not authenticated</h1>
        <p>Please sign in to access this page</p>
        <button 
          onClick={() => router.push('/login')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Go to Login
        </button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6">Subscription Test Tool</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">User Info</h2>
          <pre className="bg-gray-700 p-4 rounded-md overflow-auto text-green-400">
            {JSON.stringify(user, null, 2)}
          </pre>
          
          <h2 className="text-xl font-semibold mt-6 mb-4 text-blue-400">Subscription Status</h2>
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <button 
            onClick={checkSubscriptionStatus}
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Check Subscription Status'}
          </button>
          
          {subscriptionStatus && (
            <pre className="bg-gray-700 p-4 rounded-md mt-4 overflow-auto text-green-400">
              {JSON.stringify(subscriptionStatus, null, 2)}
            </pre>
          )}
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Create Subscription Manually</h2>
          <form onSubmit={(e) => { e.preventDefault(); createSubscription(); }} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-1">Stripe Customer ID</label>
              <input
                type="text"
                name="stripeCustomerId"
                value={formData.stripeCustomerId}
                onChange={handleInputChange}
                className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600"
                placeholder="cus_..."
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-1">Stripe Subscription ID</label>
              <input
                type="text"
                name="stripeSubscriptionId"
                value={formData.stripeSubscriptionId}
                onChange={handleInputChange}
                className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600"
                placeholder="sub_..."
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600"
              >
                <option value="active">active</option>
                <option value="trialing">trialing</option>
                <option value="canceled">canceled</option>
                <option value="incomplete">incomplete</option>
                <option value="incomplete_expired">incomplete_expired</option>
                <option value="past_due">past_due</option>
                <option value="unpaid">unpaid</option>
              </select>
            </div>
            
            <button 
              type="submit"
              className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Subscription'}
            </button>
          </form>
        </div>
      </div>
      
      <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-blue-400">Run SQL Query</h2>
        <textarea
          value={sqlQuery}
          onChange={(e) => setSqlQuery(e.target.value)}
          className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 font-mono text-sm h-32"
        />
        
        <div className="flex space-x-4 mt-4">
          <button 
            onClick={runSqlQuery}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition flex-1"
            disabled={loading}
          >
            Run Query
          </button>
          
          <button 
            onClick={checkTables}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex-1"
            disabled={loading}
          >
            Check Database Tables
          </button>
        </div>
        
        {sqlError && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-md mt-4">
            {sqlError}
          </div>
        )}
        
        {sqlResult && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2 text-blue-400">SQL Result:</h3>
            <pre className="bg-gray-700 p-4 rounded-md overflow-auto text-green-400">
              {JSON.stringify(sqlResult, null, 2)}
            </pre>
          </div>
        )}
        
        {tables && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2 text-blue-400">Database Tables:</h3>
            <pre className="bg-gray-700 p-4 rounded-md overflow-auto text-green-400">
              {JSON.stringify(tables, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-blue-400">Quick SQL Scripts</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => {
              setSqlQuery(`SELECT * FROM subscriptions;`);
              runSqlQuery();
            }}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition"
          >
            View All Subscriptions
          </button>
          
          <button
            onClick={() => {
              setSqlQuery(`SELECT * FROM user_trials;`);
              runSqlQuery();
            }}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition"
          >
            View All User Trials
          </button>
          
          <button
            onClick={() => {
              setSqlQuery(`
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
              `);
              runSqlQuery();
            }}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition"
          >
            View RLS Policies
          </button>
          
          <button
            onClick={() => {
              setSqlQuery(`
                SELECT 
                  pg_get_functiondef(p.oid) as definition
                FROM 
                  pg_proc p 
                  JOIN pg_namespace n ON p.pronamespace = n.oid 
                WHERE 
                  n.nspname = 'public' 
                  AND p.proname = 'admin_create_subscription'
              `);
              runSqlQuery();
            }}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition"
          >
            View Subscription Function
          </button>
        </div>
      </div>
    </div>
  );
} 