'use client';

import { useEffect, useState } from 'react';
import { Receipt } from '@/types';
import { SupabaseService } from '@/services/supabaseService';
import { differenceInDays } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2 } from 'lucide-react';
import { formatDateForDisplay } from '@/utils/dateUtils';
import toast from 'react-hot-toast';
import ReceiptUploader from './ReceiptUploader';

export default function Dashboard() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadReceipts();
    
    // Refresh receipts every 30 seconds
    const interval = setInterval(loadReceipts, 30000);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      const receipts = await SupabaseService.getReceipts();
      setReceipts(receipts);
    } catch (error) {
      console.error('Error loading receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getExpiryText = (expiryDate: string) => {
    const daysLeft = differenceInDays(new Date(expiryDate), new Date());
    if (daysLeft < 0) return 'Expired';
    if (daysLeft === 0) return 'Expires today';
    if (daysLeft === 1) return '1 day left';
    return `${daysLeft} days left`;
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 animate-gradient-slow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Add a subtle floating blob in the background */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
          
          {/* Main content with glassmorphism */}
          <div className="relative bg-white/60 backdrop-blur-lg rounded-3xl shadow-xl p-8">
            {/* Welcome Section */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user?.email?.split('@')[0]}
                </h1>
                <p className="text-gray-600 mt-1">
                  Track and manage your food expiry dates
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {/* Stats Section */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 transition-all hover:shadow-md hover:scale-[1.02]">
                  <h3 className="text-lg font-semibold text-orange-900 mb-2">
                    Expiring Soon
                  </h3>
                  <p className="text-3xl font-bold text-orange-600">
                    {getExpiringItems().filter(item => 
                      differenceInDays(new Date(item.estimatedExpiryDate), new Date()) <= 3 &&
                      differenceInDays(new Date(item.estimatedExpiryDate), new Date()) >= 0
                    ).length}
                  </p>
                  <p className="text-orange-600/75 text-sm">items</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 transition-all hover:shadow-md hover:scale-[1.02]">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    Fresh Items
                  </h3>
                  <p className="text-3xl font-bold text-green-600">
                    {getExpiringItems().filter(item => 
                      differenceInDays(new Date(item.estimatedExpiryDate), new Date()) > 3
                    ).length}
                  </p>
                  <p className="text-green-600/75 text-sm">items</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 transition-all hover:shadow-md hover:scale-[1.02]">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">
                    Expired
                  </h3>
                  <p className="text-3xl font-bold text-red-600">
                    {getExpiringItems().filter(item => 
                      differenceInDays(new Date(item.estimatedExpiryDate), new Date()) < 0
                    ).length}
                  </p>
                  <p className="text-red-600/75 text-sm">items</p>
                </div>
              </div>

              {/* Upload Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
                <div className="h-full flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Receipt</h3>
                  <div className="flex-grow">
                    <ReceiptUploader />
                  </div>
                </div>
              </div>

              {/* Expiring Items Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 transition-all hover:shadow-xl hover:bg-white/90">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Items Expiring Soon</h2>
                  <button
                    onClick={handleClearExpiredItems}
                    disabled={isClearing || loading}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      isClearing || loading
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'text-red-700 bg-red-50 hover:bg-red-100'
                    }`}
                  >
                    <Trash2 className={`w-4 h-4 mr-2 ${isClearing ? 'animate-pulse' : ''}`} />
                    {isClearing ? 'Clearing...' : 'Clear Expired'}
                  </button>
                </div>

                <div className="space-y-4">
                  {getExpiringItems().length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No items to display</p>
                  ) : (
                    getExpiringItems().map(item => (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl border border-gray-100 p-4 transition-all hover:shadow-md"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">
                              From {item.store} • {formatDateForDisplay(item.purchaseDate)}
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
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 