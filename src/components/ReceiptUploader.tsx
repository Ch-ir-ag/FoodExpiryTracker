'use client';

import { useState, useRef } from 'react';
import { ReceiptProcessor } from '@/services/receiptProcessor';
import { Receipt } from '@/types';
import { Upload } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { SupabaseService } from '@/services/supabaseService';
import toast from 'react-hot-toast';

export default function ReceiptUploader() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [useAI, setUseAI] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getExpiryText = (expiryDate: string) => {
    const daysLeft = differenceInDays(new Date(expiryDate), new Date());
    if (daysLeft < 0) return 'Expired';
    if (daysLeft === 0) return 'Expires today';
    if (daysLeft === 1) return '1 day left';
    return `${daysLeft} days left`;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processImage(file);
  };

  const processImage = async (file: File) => {
    try {
      setIsProcessing(true);
      setSaveError(null);
      
      // Show toast based on which method is being used
      if (useAI) {
        toast.loading('Using AI to identify items and predict expiry dates...', { duration: 3000 });
      }
      
      // Process the receipt with or without AI
      const processedReceipt = await ReceiptProcessor.processImage(file, useAI);
      
      // Save to Supabase
      try {
        await SupabaseService.saveReceipt(processedReceipt);
        setReceipt(processedReceipt);
        toast.success('Receipt processed successfully');
        
        // Fix the redirect to use the correct path - likely just '/' instead of '/dashboard'
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } catch (saveError: unknown) {
        console.error('Save error:', saveError);
        setSaveError(
          saveError instanceof Error ? saveError.message : 'Failed to save receipt'
        );
        setReceipt(processedReceipt);
        toast.error('Failed to save receipt');
      }
    } catch (error: unknown) {
      console.error('Processing error:', error);
      setSaveError(
        error instanceof Error ? error.message : 'Error processing receipt'
      );
      toast.error('Error processing receipt');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 cursor-pointer flex items-center">
              <input
                type="checkbox"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              Use AI Classification
              <span className="ml-1 text-xs text-blue-600">(Beta)</span>
            </label>
          </div>
        </div>
        
        <div 
          className="w-full bg-white rounded-xl shadow-sm border border-blue-100 p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="receipt-upload"
            ref={fileInputRef}
          />
          <Upload className="h-8 w-8 text-blue-500 mb-2 mx-auto" />
          <span className="text-sm font-medium text-gray-700 block mb-1">
            {isProcessing ? 'Processing...' : 'Upload Digital Receipt'}
          </span>
          <span className="text-xs text-gray-500 block">
            Select a file from your device
          </span>
        </div>
        
        {useAI && !isProcessing && (
          <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
            <p className="font-medium text-blue-700 mb-1">About AI Classification</p>
            <p>Using AI will provide more accurate food categorization and expiry predictions, but processing will take longer.</p>
          </div>
        )}
      </div>

      {receipt && (
        <div className="mt-8 bg-white rounded-xl shadow-lg p-4 sm:p-6 transition-all">
          <h2 className="text-xl font-bold mb-4 text-gray-900 border-b pb-2">
            Processed Receipt {useAI && <span className="text-sm text-blue-600">(AI Enhanced)</span>}
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Store</p>
                <p className="font-medium text-gray-900">{receipt.store}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Date</p>
                <p className="font-medium text-gray-900">{receipt.date}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Total</p>
                <p className="font-medium text-gray-900">€{receipt.total.toFixed(2)}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-md text-gray-900 mb-3">Items</h3>
              <div className="space-y-2">
                {receipt.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-100 rounded-lg p-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                        <div className="flex items-center">
                          <p className="text-gray-700 text-xs">€{item.price.toFixed(2)}</p>
                          {item.category && (
                            <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {item.category}
                            </span>
                          )}
                        </div>
                      </div>
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
          </div>
        </div>
      )}

      {saveError && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {saveError}
        </div>
      )}
    </div>
  );
} 