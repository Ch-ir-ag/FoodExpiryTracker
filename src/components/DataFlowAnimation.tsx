import React from 'react';
import { Receipt, Calendar, Brain } from 'lucide-react';

/**
 * A component that displays a data flow visualization
 * to illustrate how the AI processes food data.
 */
export default function DataFlowAnimation() {
  return (
    <div className="relative w-full h-[200px] bg-white/50 rounded-xl p-4 overflow-hidden">
      {/* Flow diagram */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center space-x-8 md:space-x-16">
          {/* Receipt */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <Receipt className="w-8 h-8 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Receipt Data</span>
          </div>
          
          {/* Arrow */}
          <div className="w-8 md:w-12 h-0.5 bg-blue-300 relative">
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 border-t border-r border-blue-300 rotate-45" />
          </div>
          
          {/* AI Processing */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2 relative">
              <Brain className="w-8 h-8 text-blue-600" />
              <div className="absolute inset-0 rounded-full border-2 border-blue-400 opacity-50 animate-ping" />
            </div>
            <span className="text-sm font-medium text-gray-700">AI Processing</span>
          </div>
          
          {/* Arrow */}
          <div className="w-8 md:w-12 h-0.5 bg-blue-300 relative">
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 border-t border-r border-blue-300 rotate-45" />
          </div>
          
          {/* Expiry Prediction */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Expiry Prediction</span>
          </div>
        </div>
      </div>
    </div>
  );
} 