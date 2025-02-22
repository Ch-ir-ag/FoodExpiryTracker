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
    <div className="max-w-2xl mx-auto p-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-white">
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
          <Upload className="h-12 w-12 text-blue-500" />
          <span className="mt-2 text-sm text-gray-700 font-medium">
            {isProcessing ? 'Processing...' : 'Upload receipt'}
          </span>
        </label>
      </div>

      {receipt && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Processed Receipt</h2>
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="space-y-2 mb-6">
              <p className="text-gray-900 font-medium">Store: <span className="text-gray-700">{receipt.store}</span></p>
              <p className="text-gray-900 font-medium">Date: <span className="text-gray-700">{receipt.date}</span></p>
              <p className="text-gray-900 font-medium">Total: <span className="text-gray-700">€{receipt.total.toFixed(2)}</span></p>
            </div>
            
            <h3 className="font-bold text-lg text-gray-900 mb-4">Items:</h3>
            <ul className="space-y-4">
              {receipt.items.map((item) => (
                <li key={item.id} className="border-b border-gray-200 pb-4">
                  <p className="text-gray-900 font-medium mb-1">{item.name}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-700">€{item.price.toFixed(2)}</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium
                      ${differenceInDays(new Date(item.estimatedExpiryDate), new Date()) <= 3 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'}`}>
                      {getExpiryText(item.estimatedExpiryDate)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {saveError && (
        <div className="mt-8 text-red-500">
          {saveError}
        </div>
      )}
    </div>
  );
} 