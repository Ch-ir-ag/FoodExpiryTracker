'use client';

import { useState, useRef } from 'react';
import { ReceiptProcessor } from '@/services/receiptProcessor';
import { Receipt } from '@/types';
import { Upload, Camera, X } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { SupabaseService } from '@/services/supabaseService';
import toast from 'react-hot-toast';

export default function ReceiptUploader() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  const startCamera = async () => {
    setIsCameraOpen(true);
    
    try {
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast.error('Could not access camera');
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the video frame to the canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to file
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
            stopCamera();
            await processImage(file);
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  return (
    <div className="w-full">
      {!isCameraOpen ? (
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <div 
            className="flex-1 bg-white rounded-xl shadow-sm border border-blue-100 p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
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
              {isProcessing ? 'Processing...' : 'Upload Receipt'}
            </span>
            <span className="text-xs text-gray-500 block">
              Select a file from your device
            </span>
          </div>
          
          <div 
            className="flex-1 bg-white rounded-xl shadow-sm border border-blue-100 p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
            onClick={startCamera}
          >
            <Camera className="h-8 w-8 text-blue-500 mb-2 mx-auto" />
            <span className="text-sm font-medium text-gray-700 block mb-1">
              Take Photo
            </span>
            <span className="text-xs text-gray-500 block">
              Use your camera to capture receipt
            </span>
          </div>
        </div>
      ) : (
        <div className="relative bg-black rounded-xl overflow-hidden">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline
            className="w-full h-auto"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
            <button
              onClick={captureImage}
              className="bg-white rounded-full p-4 shadow-lg"
              aria-label="Take photo"
            >
              <div className="w-6 h-6 bg-blue-600 rounded-full" />
            </button>
            
            <button
              onClick={stopCamera}
              className="bg-red-500 rounded-full p-4 shadow-lg"
              aria-label="Cancel"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      )}

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