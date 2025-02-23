'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

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
      // Here you would typically save the email to your waitlist database
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Added to waitlist! We\'ll notify you when spots open up.');
      setEmail('');
    } catch {
      toast.error('Failed to join waitlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10">
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

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onSwitchToPilot}
          className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Have a pilot code? Sign up here
        </button>
      </form>
    </div>
  );
} 