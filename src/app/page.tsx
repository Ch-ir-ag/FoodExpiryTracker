'use client';

import { useAuth } from '@/contexts/AuthContext';
import Auth from '@/components/Auth';
import ReceiptUploader from '@/components/ReceiptUploader';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
        <Auth />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Food Expiry Tracker
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your receipts to track expiry dates and reduce food waste
          </p>
        </div>
        <div className="grid gap-8">
          <ReceiptUploader />
          <Dashboard />
        </div>
      </div>
    </main>
  );
}
