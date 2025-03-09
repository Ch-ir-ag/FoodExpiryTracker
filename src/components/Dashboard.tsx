'use client';

import { useEffect, useState, useRef } from 'react';
import { Receipt } from '@/types';
import { SupabaseService } from '@/services/supabaseService';
import { differenceInDays } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { formatDateForDisplay } from '@/utils/dateUtils';
import toast from 'react-hot-toast';
import ReceiptUploader from './ReceiptUploader';

export default function Dashboard() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    loadReceipts();
    
    // Set up interval to refresh receipts periodically
    const intervalId = setInterval(loadReceipts, 5 * 60 * 1000); // Every 5 minutes
    
    return () => {
      isMounted.current = false;
      clearInterval(intervalId);
    };
  }, []);

  const loadReceipts = async () => {
    if (isMounted.current) {
      setLoading(true);
      try {
        console.log('Loading receipts...');
        const data = await SupabaseService.getReceipts(true); // Pass true for forceRefresh
        if (isMounted.current) {
          setReceipts(data);
        }
      } catch (error) {
        console.error('Error loading receipts:', error);
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    }
  };

  const getExpiryText = (expiryDate: string) => {
    const daysLeft = differenceInDays(new Date(expiryDate), new Date());
    
    if (daysLeft < 0) return 'Expired';
    if (daysLeft === 0) return 'Expires today';
    if (daysLeft === 1) return '1 day left';
    
    // Convert to months for longer periods
    if (daysLeft > 30) {
      const months = Math.floor(daysLeft / 30);
      const remainingDays = daysLeft % 30;
      
      if (months === 1) {
        return remainingDays > 0 
          ? `1 month, ${remainingDays} days left` 
          : '1 month left';
      }
      
      return remainingDays > 0 
        ? `${months} months, ${remainingDays} days left` 
        : `${months} months left`;
    }
    
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

  const handleDeleteItem = async (itemId: string) => {
    try {
      if (window.confirm('Are you sure you want to remove this item?')) {
        await SupabaseService.deleteReceiptItem(itemId);
        toast.success('Item removed successfully');
        // Refresh the receipts list
        loadReceipts();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to remove item');
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
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="relative">
          {/* Main content */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8">
            {/* Welcome Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Welcome back!
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Track and manage your food expiry dates
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Stats Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-orange-50 rounded-xl p-4 sm:p-6 transition-all hover:shadow-md">
                  <h3 className="text-base sm:text-lg font-semibold text-orange-900 mb-2">
                    Expiring Soon
                  </h3>
                  <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                    {getExpiringItems().filter(item => 
                      differenceInDays(new Date(item.estimatedExpiryDate), new Date()) <= 3 &&
                      differenceInDays(new Date(item.estimatedExpiryDate), new Date()) >= 0
                    ).length}
                  </p>
                  <p className="text-sm text-orange-600/75">items</p>
                </div>
                
                <div className="bg-green-50 rounded-xl p-4 sm:p-6 transition-all hover:shadow-md">
                  <h3 className="text-base sm:text-lg font-semibold text-green-900 mb-2">
                    Fresh Items
                  </h3>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">
                    {getExpiringItems().filter(item => 
                      differenceInDays(new Date(item.estimatedExpiryDate), new Date()) > 3
                    ).length}
                  </p>
                  <p className="text-sm text-green-600/75">items</p>
                </div>

                <div className="bg-red-50 rounded-xl p-4 sm:p-6 transition-all hover:shadow-md">
                  <h3 className="text-base sm:text-lg font-semibold text-red-900 mb-2">
                    Expired
                  </h3>
                  <p className="text-2xl sm:text-3xl font-bold text-red-600">
                    {getExpiringItems().filter(item => 
                      differenceInDays(new Date(item.estimatedExpiryDate), new Date()) < 0
                    ).length}
                  </p>
                  <p className="text-sm text-red-600/75">items</p>
                </div>
              </div>

              {/* Upload Section */}
              <div className="bg-white rounded-xl shadow p-4 sm:p-6 border border-gray-100">
                <div className="h-full flex flex-col">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                    Upload Receipt
                  </h3>
                  <div className="flex-grow">
                    <ReceiptUploader />
                  </div>
                </div>
              </div>

              {/* Expiring Items Section */}
              <div className="bg-white rounded-xl shadow p-4 sm:p-8 border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Items Expiring Soon
                  </h2>
                  <button
                    onClick={handleClearExpiredItems}
                    disabled={isClearing || loading}
                    className={`w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      isClearing || loading
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'text-red-700 bg-red-50 hover:bg-red-100'
                    }`}
                  >
                    <Trash2 className={`w-4 h-4 mr-2 ${isClearing ? 'animate-pulse' : ''}`} />
                    {isClearing ? 'Clearing...' : 'Clear Expired'}
                  </button>
                </div>

                <div className="space-y-3">
                  {getExpiringItems().length === 0 ? (
                    <p className="text-gray-500 text-center py-6">No items to display</p>
                  ) : (
                    getExpiringItems().map(item => (
                      <div
                        key={item.id}
                        className="bg-white rounded-lg border border-gray-100 p-3 sm:p-4 hover:shadow-sm transition-all"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                          <div className="flex-grow">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">
                              From {item.store} • {formatDateForDisplay(item.purchaseDate)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                differenceInDays(new Date(item.estimatedExpiryDate), new Date()) <= 3
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {getExpiryText(item.estimatedExpiryDate)}
                            </span>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                              aria-label="Delete item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          <span className="font-medium">Expiry date: </span>
                          <span>{formatDateForDisplay(item.estimatedExpiryDate)}</span>
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