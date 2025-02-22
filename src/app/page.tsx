'use client';

import { useAuth } from '@/contexts/AuthContext';
import Auth from '@/components/Auth';
import ReceiptUploader from '@/components/ReceiptUploader';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <Auth />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">
            Food Expiry Tracker
          </h1>
          <p className="mt-2 text-gray-600">
            Upload your receipt to track expiry dates
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
