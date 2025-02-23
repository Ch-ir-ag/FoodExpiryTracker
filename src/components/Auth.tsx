'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import WaitlistForm from './WaitlistForm';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pilotCode, setPilotCode] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPilotForm, setShowPilotForm] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        if (pilotCode !== 'PILOT') {
          throw new Error('Invalid pilot code. Please try again.');
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              is_pilot: true
            }
          }
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: Error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!showPilotForm) {
    return <WaitlistForm onSwitchToPilot={() => setShowPilotForm(true)} />;
  }

  return (
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-8">
        <button
          onClick={() => setShowPilotForm(false)}
          className="text-blue-600 hover:text-blue-700"
        >
          ← Back
        </button>
        <h2 className="text-3xl font-semibold text-gray-800">
          Pilot Access
        </h2>
      </div>
      
      <form onSubmit={handleAuth} className="space-y-6">
        <div>
          <label htmlFor="pilotCode" className="block text-base text-gray-700 mb-2">
            Pilot Code
          </label>
          <input
            id="pilotCode"
            type="text"
            value={pilotCode}
            onChange={(e) => setPilotCode(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-gray-700"
            placeholder="Enter your pilot code"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-base text-gray-700 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-gray-700"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-base text-gray-700 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-gray-700"
            required
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm py-2">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>

        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </form>
    </div>
  );
} 