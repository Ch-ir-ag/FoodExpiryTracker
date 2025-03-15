'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import WaitlistForm from './WaitlistForm';
import toast from 'react-hot-toast';

type AuthTab = 'waitlist' | 'pilotSignup' | 'pilotSignin';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pilotCode, setPilotCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AuthTab>('waitlist');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!supabase) {
        throw new Error('Unable to connect to authentication service');
      }

      if (activeTab === 'pilotSignup') {
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
        
        // Add notification to check email for verification link
        toast.success('Signup successful! Please check your email inbox for a verification link.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('waitlist')}
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === 'waitlist'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Join Waitlist
        </button>
        <button
          onClick={() => setActiveTab('pilotSignup')}
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === 'pilotSignup'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Pilot Sign Up
        </button>
        <button
          onClick={() => setActiveTab('pilotSignin')}
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === 'pilotSignin'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Pilot Sign In
        </button>
      </div>

      {/* Auth Form Container */}
      <div className="w-full max-w-md mx-auto px-4 py-6 bg-white/90 backdrop-blur-md rounded-xl shadow-lg">
        {/* Waitlist Form */}
        {activeTab === 'waitlist' && (
          <WaitlistForm onSwitchToPilot={() => setActiveTab('pilotSignup')} />
        )}

        {/* Pilot Sign Up Form */}
        {activeTab === 'pilotSignup' && (
          <div>
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">
              Pilot Sign Up
            </h2>
            <p className="text-gray-600 mb-8">
              Create an account to access our pilot program.
            </p>
            
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
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : null}
                Sign Up
              </button>
            </form>
          </div>
        )}

        {/* Pilot Sign In Form */}
        {activeTab === 'pilotSignin' && (
          <div>
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">
              Pilot Sign In
            </h2>
            <p className="text-gray-600 mb-8">
              Sign in to access your pilot account.
            </p>
            
            <form onSubmit={handleAuth} className="space-y-6">
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
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : null}
                Sign In
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
} 