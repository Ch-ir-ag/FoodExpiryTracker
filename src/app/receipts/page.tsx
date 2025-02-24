'use client';

import { useEffect, useState } from 'react';
import { Receipt } from '@/types';
import { SupabaseService } from '@/services/supabaseService';
import { formatDateForDisplay } from '@/utils/dateUtils';
import { Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    setLoading(true);
    const receipts = await SupabaseService.getReceipts();
    setReceipts(receipts);
    setLoading(false);
  };

  const handleDeleteReceipt = async (receiptId: string) => {
    if (!confirm('Are you sure you want to delete this receipt?')) {
      return;
    }
    
    try {
      await SupabaseService.deleteReceipt(receiptId);
      setReceipts(receipts.filter(r => r.id !== receiptId));
      toast.success('Receipt deleted successfully');
    } catch (error) {
      console.error('Error deleting receipt:', error);
      toast.error('Failed to delete receipt');
    }
  };

  const handleClearAllReceipts = async () => {
    if (!confirm('Are you sure you want to clear all receipts? This cannot be undone.')) {
      return;
    }

    setIsClearing(true);
    try {
      // Create a copy of receipts for deletion
      const receiptsToDelete = [...receipts];
      
      // Delete each receipt and log the process
      for (const receipt of receiptsToDelete) {
        console.log('Deleting receipt:', receipt.id);
        await SupabaseService.deleteReceipt(receipt.id);
      }

      // Clear local state
      setReceipts([]);
      toast.success('All receipts cleared successfully');
    } catch (error) {
      console.error('Error clearing receipts:', error);
      // Refresh the list to ensure UI is in sync with database
      await loadReceipts();
      toast.error('Failed to clear receipts');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Receipt History</h1>
        <button
          onClick={handleClearAllReceipts}
          disabled={isClearing || receipts.length === 0}
          className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            isClearing || receipts.length === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'text-red-700 bg-red-50 hover:bg-red-100'
          }`}
        >
          <Trash2 className={`w-4 h-4 mr-2 ${isClearing ? 'animate-pulse' : ''}`} />
          {isClearing ? 'Clearing...' : 'Clear All Receipts'}
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="space-y-4">
          {receipts.map(receipt => (
            <div
              key={receipt.id}
              className="border-b border-gray-100 pb-4 last:border-0"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <h4 className="font-medium text-gray-900">{receipt.store}</h4>
                    <p className="text-sm text-gray-500">
                      {formatDateForDisplay(receipt.date)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {receipt.items.length} items · Total: €{receipt.total.toFixed(2)}
                  </p>
                  <div className="space-y-1">
                    {receipt.items.map(item => (
                      <p key={item.id} className="text-sm text-gray-600">
                        {item.name} - €{item.price.toFixed(2)}
                      </p>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteReceipt(receipt.id)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 