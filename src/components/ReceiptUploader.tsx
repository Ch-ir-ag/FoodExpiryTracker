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
      
      // Process the receipt
      const processedReceipt = await ReceiptProcessor.processImage(file);
      
      // Save to Supabase
      try {
        await SupabaseService.saveReceipt(processedReceipt);
        setReceipt(processedReceipt);
        toast.success('Receipt processed successfully');
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
      <div className="flex justify-center">
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
      </div>

      {receipt && (
        <div className="mt-8 bg-white rounded-xl shadow-lg p-4 sm:p-6 transition-all">
          <h2 className="text-xl font-bold mb-4 text-gray-900 border-b pb-2">
            Processed Receipt
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
                        <p className="text-gray-700 text-xs">€{item.price.toFixed(2)}</p>
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