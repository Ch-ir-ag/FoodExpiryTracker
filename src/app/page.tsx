'use client';

import { useAuth } from '@/contexts/AuthContext';
import Auth from '@/components/Auth';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome to Food Tracker
            </h1>
            <Link 
              href="/dashboard"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg font-medium transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-blue-100 to-transparent -z-10" />
        <div className="absolute top-20 left-0 w-72 h-72 bg-blue-200 rounded-full filter blur-3xl opacity-20 -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200 rounded-full filter blur-3xl opacity-20 -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 relative">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            <div className="flex-1 text-center lg:text-left">
 
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Never Let Your Food
                <span className="text-blue-600"> Go to Waste </span>
                Again
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Track expiry dates, get timely reminders, and make the most of your groceries. 
                Join thousands of users saving money and reducing waste.
              </p>
              
              {/* Feature List */}
              <div className="grid grid-cols-2 gap-4 mb-8 max-w-lg mx-auto lg:mx-0">
                {[
                  'Smart Expiry Tracking',
                  'Receipt Scanning',
                  'Timely Reminders',
                  'Waste Analytics'
                ].map((feature) => (
                  <div key={feature} className="flex items-center">
                    <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 w-full max-w-md">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/80 rounded-3xl" />
                <Auth />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update the social proof section background */}
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Trusted by Conscious Consumers
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center opacity-70">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-center">
                  <div className="h-12 w-32 bg-gray-300 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
