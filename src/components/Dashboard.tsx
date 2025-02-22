'use client';

import { useEffect, useState } from 'react';
import { Receipt } from '@/types';
import { SupabaseService } from '@/services/supabaseService';
import { differenceInDays } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDateForDisplay } from '@/utils/dateUtils';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
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
        receiptId: receipt.id,
        store: receipt.store,
        receiptDate: receipt.date
      }))
    );
    
    return allItems.sort((a, b) => 
      differenceInDays(new Date(a.estimatedExpiryDate), new Date()) -
      differenceInDays(new Date(b.estimatedExpiryDate), new Date())
    );
  };

  const handleClearExpiredItems = async () => {
    try {
      const expiredItems = getExpiringItems().filter(item => 
        differenceInDays(new Date(item.estimatedExpiryDate), new Date()) < 0
      );
      
      if (expiredItems.length === 0) {
        toast.error('No expired items to clear');
        return;
      }

      setIsClearing(true);

      console.log('Clearing expired items:', expiredItems);

      for (const item of expiredItems) {
        await SupabaseService.deleteReceiptItem(item.id);
        console.log(`Deleted item: ${item.id}`);
      }

      await loadReceipts();
      
      toast.success(`Cleared ${expiredItems.length} expired items`);
    } catch (error) {
      console.error('Error clearing expired items:', error);
      toast.error('Failed to clear expired items');
    } finally {
      setIsClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.email?.split('@')[0]}
          </h2>
          <p className="text-gray-600 mt-1">
            Track and manage your food expiry dates
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-orange-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-orange-900 mb-2">
              Expiring Soon
            </h3>
            <p className="text-orange-600">
              {getExpiringItems().filter(item => 
                differenceInDays(new Date(item.estimatedExpiryDate), new Date()) <= 3
              ).length} items
            </p>
          </div>
          
          <div className="bg-green-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Fresh Items
            </h3>
            <p className="text-green-600">
              {getExpiringItems().filter(item => 
                differenceInDays(new Date(item.estimatedExpiryDate), new Date()) > 3
              ).length} items
            </p>
          </div>

          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Total Receipts
            </h3>
            <p className="text-blue-600">{receipts.length} receipts</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Items Expiring Soon</h3>
          <button
            onClick={handleClearExpiredItems}
            disabled={isClearing || loading}
            className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              isClearing || loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'text-red-700 bg-red-50 border border-red-200 hover:bg-red-100'
            }`}
          >
            <Trash2 className={`w-4 h-4 mr-1.5 ${isClearing ? 'animate-pulse' : ''}`} />
            {isClearing ? 'Clearing...' : 'Clear Expired'}
          </button>
        </div>
        <div className="space-y-4">
          {getExpiringItems().map(item => (
            <div
              key={item.id}
              className="border-b border-gray-100 pb-4 last:border-0"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    From {item.store}
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 