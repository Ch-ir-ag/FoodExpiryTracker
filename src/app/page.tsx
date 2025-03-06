'use client';

import { useAuth } from '@/contexts/AuthContext';
import Auth from '@/components/Auth';
import Dashboard from '@/components/Dashboard';
import { supabase } from '@/lib/supabase';
import { ArrowRight, Receipt, Upload, Sparkles } from 'lucide-react';
import AIFeatureSection from '@/components/AIFeatureSection';
import DataFlowAnimation from '@/components/DataFlowAnimation';
import AIHeroAnimation from '@/components/AIHeroAnimation';
import AILearningProcess from '@/components/AILearningProcess';
import AIWasteReductionStats from '@/components/AIWasteReductionStats';
import ErrorBoundary from '@/components/ErrorBoundary';

// Stats can be manually edited here
const STATS = {
  users: 350,  // Edit this number to update total users
  pilots: 20    // Edit this number to update active pilots
};

export default function Home() {
  const { user, loading } = useAuth();

  // Show a simple loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  // Handle case where Supabase isn't initialized
  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Unable to connect to service</h1>
          <p className="text-gray-600 mt-2">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section id="signup" className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-blue-100 to-transparent -z-10" />
        <div className="absolute top-20 left-0 w-72 h-72 bg-blue-200 rounded-full filter blur-3xl opacity-20 -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200 rounded-full filter blur-3xl opacity-20 -z-10" />
        
        {/* AI Animation */}
        <ErrorBoundary>
          <AIHeroAnimation />
        </ErrorBoundary>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            <div className="flex-1 text-center lg:text-left">

              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Never Let Your Food
                <span className="text-blue-600"> Go to Waste </span>
                Again
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Our AI-powered platform tracks expiry dates, provides smart predictions, and sends timely reminders to help you reduce food waste and save money.
              </p>
              
              {/* Stats Section */}
              <div className="grid grid-cols-2 gap-8 mb-12 max-w-lg mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {STATS.users.toLocaleString()}+
                  </div>
                  <div className="text-sm text-gray-600">
                    Waitlist Users
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {STATS.pilots.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    Active Pilots
                  </div>
                </div>
              </div>

              {/* Feature List */}
              <div className="grid grid-cols-2 gap-4 mb-8 max-w-lg mx-auto lg:mx-0">
                {[
                  'Smart Expiry Tracking',
                  'Digital Receipt Upload',
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
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Powerful Features for Food Management
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Our AI-powered platform makes tracking food expiry dates effortless
          </p>
          
          {/* Data Flow Animation */}
          <div className="mb-16">
            <ErrorBoundary>
              <DataFlowAnimation />
            </ErrorBoundary>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <Receipt className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Digital Receipt Upload</h3>
              <p className="text-gray-600">
                Upload your digital receipts and let our AI extract all the important details automatically
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <Upload className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Import</h3>
              <p className="text-gray-600">
                Quickly import your LIDL digital receipts with just a few clicks
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <Sparkles className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Predictions</h3>
              <p className="text-gray-600">
                Our AI predicts expiry dates with high accuracy, even for items without explicit dates
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Feature Section */}
      <ErrorBoundary>
        <AIFeatureSection />
      </ErrorBoundary>

      {/* AI Learning Process Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Continuous Learning System
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform gets smarter with every user interaction, improving expiry date predictions for everyone
            </p>
          </div>
          
          <ErrorBoundary>
            <AILearningProcess />
          </ErrorBoundary>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Get started with FoodTracker in three simple steps
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Account</h3>
                <p className="text-gray-600">
                  Sign up for free and set up your personal food tracking dashboard
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-10">
                <div className="bg-white rounded-full p-1 shadow-sm">
                  <ArrowRight className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Receipts</h3>
                <p className="text-gray-600">
                  Upload your digital LIDL receipts to automatically add items
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-10">
                <div className="bg-white rounded-full p-1 shadow-sm">
                  <ArrowRight className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Track & Manage</h3>
              <p className="text-gray-600">
                View your items and get notified before they expire
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stores Section */}
      <section className="relative bg-gradient-to-b from-gray-50/50 to-blue-50/50 py-16 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30" />
        <div className="absolute -top-40 right-0 w-72 h-72 bg-blue-200 rounded-full filter blur-3xl opacity-10" />
        <div className="absolute -bottom-24 left-0 w-96 h-96 bg-indigo-200 rounded-full filter blur-3xl opacity-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Exclusively for
              <span className="text-blue-600"> LIDL </span>
              Shoppers
            </h2>
            <p className="text-lg text-gray-600 mb-12">
              Optimized for LIDL digital receipts to provide the best experience
            </p>
            <div className="flex justify-center items-center max-w-4xl mx-auto">
              <div 
                className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 
                  transition-all duration-500 hover:shadow-xl hover:-translate-y-1
                  animate-fade-in"
              >
                <span className="block text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 
                  bg-clip-text text-transparent opacity-75 group-hover:opacity-100 
                  transform transition-all duration-500 group-hover:scale-110"
                >
                  LIDL
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Impact Stats Section */}
      <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              AI-Powered Impact
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our AI technology is helping users reduce food waste and save money through smart predictions and timely reminders
            </p>
          </div>
          
          <ErrorBoundary>
            <AIWasteReductionStats />
          </ErrorBoundary>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Tracking?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are reducing food waste and saving money
          </p>
          <button
            onClick={() => {
              document.getElementById('signup')?.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
              });
            }}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-blue-600 bg-white hover:bg-blue-50 transition-colors"
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </section>
    </main>
  );
}
