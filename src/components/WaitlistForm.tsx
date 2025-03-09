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
    <div>
      <h2 className="text-3xl font-semibold text-gray-800 mb-4">
        Join the Waitlist
      </h2>
      <p className="text-gray-600 mb-8">
        Be the first to know when we launch and get early access to our food tracking platform.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="waitlist-email" className="block text-base text-gray-700 mb-2">
            Email
          </label>
          <input
            id="waitlist-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-gray-700"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Joining...' : 'Join Waitlist'}
        </button>
      </form>
    </div>
  );
} 