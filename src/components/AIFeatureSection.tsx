import React from 'react';
import AIVisualization from './AIVisualization';
import { Brain, Sparkles, TrendingUp, Zap } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';

/**
 * A component that showcases the AI/ML features of the food expiry tracking system
 */
export default function AIFeatureSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-blue-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-200 rounded-full filter blur-3xl opacity-20" />
        <div className="absolute top-40 right-10 w-48 h-48 bg-indigo-200 rounded-full filter blur-3xl opacity-20" />
        <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-cyan-200 rounded-full filter blur-3xl opacity-20" />
        
        {/* Binary code background effect */}
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div 
              key={i}
              className="absolute text-xs font-mono text-blue-900"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 90 - 45}deg)`,
                opacity: 0.3 + Math.random() * 0.7
              }}
            >
              {Array.from({ length: 20 }).map(() => Math.round(Math.random())).join('')}
            </div>
          ))}
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-4">
            <Brain className="w-8 h-8 text-blue-500 mr-2" />
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              Powered by AI
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Advanced AI Technology <span className="text-blue-600">Behind the Scenes</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our intelligent system uses machine learning to accurately predict expiry dates
            and help you reduce food waste with smart recommendations.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 items-center mb-16">
          {/* Visualization container with responsive height */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-[300px] sm:h-[350px] md:h-[400px] order-2 md:order-1">
            <ErrorBoundary fallback={
              <div className="w-full h-full flex flex-col items-center justify-center p-6">
                <Brain className="w-16 h-16 text-blue-300 mb-4" />
                <h3 className="text-lg font-semibold text-blue-600">AI-Powered Expiry Prediction</h3>
                <p className="text-sm text-gray-600 text-center mt-2">
                  Our neural network analyzes product data to predict optimal expiry dates
                </p>
              </div>
            }>
              <AIVisualization />
            </ErrorBoundary>
          </div>
          
          <div className="space-y-6 order-1 md:order-2">
            <div className="flex flex-col sm:flex-row">
              <div className="flex-shrink-0 mb-4 sm:mb-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Sparkles className="h-6 w-6" />
                </div>
              </div>
              <div className="sm:ml-4">
                <h3 className="text-lg font-medium text-gray-900">Smart Expiry Prediction</h3>
                <p className="mt-2 text-base text-gray-500">
                  Our AI analyzes thousands of food products to accurately predict when your items will expire,
                  even for products without explicit expiry dates.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row">
              <div className="flex-shrink-0 mb-4 sm:mb-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
              <div className="sm:ml-4">
                <h3 className="text-lg font-medium text-gray-900">Learning From Your Habits</h3>
                <p className="mt-2 text-base text-gray-500">
                  The system learns from your shopping patterns and consumption habits to continuously
                  improve its predictions and provide personalized recommendations.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row">
              <div className="flex-shrink-0 mb-4 sm:mb-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Zap className="h-6 w-6" />
                </div>
              </div>
              <div className="sm:ml-4">
                <h3 className="text-lg font-medium text-gray-900">Automated Receipt Processing</h3>
                <p className="mt-2 text-base text-gray-500">
                  Our advanced OCR and natural language processing algorithms automatically extract
                  and categorize items from your digital receipts with high accuracy.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* AI Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {[
            { value: '95%', label: 'Prediction Accuracy' },
            { value: '10K+', label: 'Food Products Database' },
            { value: '24/7', label: 'Continuous Learning' },
            { value: '30%', label: 'Average Waste Reduction' }
          ].map((stat, index) => (
            <div 
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-center shadow-sm border border-blue-100
                transform transition-all duration-300 hover:shadow-md hover:-translate-y-1"
            >
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">{stat.value}</div>
              <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 