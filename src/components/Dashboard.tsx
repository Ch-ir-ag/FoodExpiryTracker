'use client';

import { useEffect, useState } from 'react';
import { Receipt } from '@/types';
import { SupabaseService } from '@/services/supabaseService';
import { differenceInDays } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDateForDisplay } from '@/utils/dateUtils';

export default function Dashboard() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    setLoading(true);
    const receipts = await SupabaseService.getReceipts();
    setReceipts(receipts);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const getExpiryText = (expiryDate: string) => {
    const daysLeft = differenceInDays(new Date(expiryDate), new Date());
    if (daysLeft < 0) return 'Expired';
    if (daysLeft === 0) return 'Expires today';
    if (daysLeft === 1) return '1 day left before it expires';
    return `${daysLeft} days left before it expires`;
  };

  const getExpiringItems = () => {
    const allItems = receipts.flatMap(receipt => 
      receipt.items.map(item => ({
        ...item,
        store: receipt.store,
        receiptDate: receipt.date
      }))
    );
    
    return allItems.sort((a, b) => 
      differenceInDays(new Date(a.estimatedExpiryDate), new Date()) -
      differenceInDays(new Date(b.estimatedExpiryDate), new Date())
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome, {user?.email}</h2>
          <p className="text-gray-600">Track your food expiry dates</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Items Expiring Soon</h3>
        <div className="space-y-4">
          {getExpiringItems().map(item => (
            <div
              key={item.id}
              className="border-b border-gray-200 pb-4 flex justify-between items-center"
            >
              <div>
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">
                  Purchased from {item.store} on {formatDateForDisplay(item.receiptDate)}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  differenceInDays(new Date(item.estimatedExpiryDate), new Date()) <= 3
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {getExpiryText(item.estimatedExpiryDate)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Receipts</h3>
        <div className="space-y-6">
          {receipts.map(receipt => (
            <div key={receipt.id} className="border-b border-gray-200 pb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">{receipt.store}</h4>
                  <p className="text-sm text-gray-500">Date: {receipt.date}</p>
                </div>
                <p className="font-medium text-gray-900">€{receipt.total.toFixed(2)}</p>
              </div>
              <div className="space-y-2">
                {receipt.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <p className="text-gray-700">{item.name}</p>
                    <div className="flex items-center space-x-4">
                      <p className="text-gray-600">€{item.price.toFixed(2)}</p>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          differenceInDays(new Date(item.estimatedExpiryDate), new Date()) <= 3
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {getExpiryText(item.estimatedExpiryDate)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 