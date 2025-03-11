'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

interface Props {
  onSwitchToPilot: () => void;
}

export default function WaitlistForm({ onSwitchToPilot }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Save email to Supabase waitlist table
      const { error } = await supabase
        .from('waitlist')
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation - email already exists
          toast.success('You\'re already on our waitlist! We\'ll be in touch soon.');
        } else {
          console.error('Error saving to waitlist:', error);
          throw error;
        }
      } else {
        toast.success('Added to waitlist! We\'ll notify you when spots open up.');
      }
      
      setEmail('');
    } catch (error) {
      console.error('Failed to join waitlist:', error);
      toast.error('Failed to join waitlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-2">
        Join Our Waitlist
      </h2>
      <p className="text-gray-600 mb-6">
        Be the first to know when we launch!
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4 w-full">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
        
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Join Waitlist'
            )}
          </button>
        </div>
        
        <div className="text-center text-sm text-gray-500 mt-4">
          <p>Already have a pilot code? {' '}
            <button 
              type="button"
              onClick={onSwitchToPilot}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign up for pilot
            </button>
          </p>
        </div>
      </form>
    </div>
  );
} 