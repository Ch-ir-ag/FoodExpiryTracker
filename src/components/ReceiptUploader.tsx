'use client';

import { useState } from 'react';
import { ReceiptProcessor } from '@/services/receiptProcessor';
import { Receipt } from '@/types';
import { Upload } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { SupabaseService } from '@/services/supabaseService';

export default function ReceiptUploader() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const getExpiryText = (expiryDate: string) => {
    const daysLeft = differenceInDays(new Date(expiryDate), new Date());
    if (daysLeft < 0) return 'Expired';
    if (daysLeft === 0) return 'Expires today';
    if (daysLeft === 1) return '1 day left before it expires';
    return `${daysLeft} days left before it expires`;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      setSaveError(null);
      
      // Process the receipt
      const processedReceipt = await ReceiptProcessor.processImage(file);
      
      // Save to Supabase
      try {
        await SupabaseService.saveReceipt(processedReceipt);
        setReceipt(processedReceipt);
      } catch (saveError: any) {
        console.error('Save error:', saveError);
        setSaveError(saveError.message || 'Failed to save receipt');
        // Still show the processed receipt even if save failed
        setReceipt(processedReceipt);
      }
    } catch (error: any) {
      console.error('Processing error:', error);
      setSaveError(error.message || 'Error processing receipt');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 transition-all hover:shadow-xl">
        <div className="border-2 border-dashed border-blue-200 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="receipt-upload"
          />
          <label
            htmlFor="receipt-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="h-12 w-12 text-blue-500 mb-3" />
            <span className="text-sm font-medium text-gray-700 mb-1">
              {isProcessing ? 'Processing...' : 'Upload receipt'}
            </span>
            <span className="text-xs text-gray-500">
              Click or drag and drop your receipt image
            </span>
          </label>
        </div>
      </div>

      {receipt && (
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 transition-all">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-4">
            Processed Receipt
          </h2>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Store</p>
                <p className="font-medium text-gray-900">{receipt.store}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Date</p>
                <p className="font-medium text-gray-900">{receipt.date}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Total</p>
                <p className="font-medium text-gray-900">€{receipt.total.toFixed(2)}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-4">Items</h3>
              <div className="space-y-3">
                {receipt.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900 mb-1">{item.name}</p>
                        <p className="text-gray-700">€{item.price.toFixed(2)}</p>
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
        </div>
      )}

      {saveError && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {saveError}
        </div>
      )}
    </div>
  );
} 