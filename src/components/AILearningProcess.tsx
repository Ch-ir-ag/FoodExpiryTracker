import React from 'react';
import { Brain, RotateCw, Clock, CheckCircle } from 'lucide-react';

/**
 * A component that visualizes how the AI learns from user corrections to improve expiry date predictions.
 */
export default function AILearningProcess() {
  const steps = [
    {
      icon: <Brain className="h-8 w-8 text-blue-500" />,
      title: "Initial Prediction",
      description: "AI analyzes product data to make an initial expiry date prediction"
    },
    {
      icon: <RotateCw className="h-8 w-8 text-indigo-500" />,
      title: "User Correction",
      description: "Users can correct predictions based on their knowledge"
    },
    {
      icon: <Clock className="h-8 w-8 text-purple-500" />,
      title: "Model Adaptation",
      description: "AI learns from corrections to improve future predictions"
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-green-500" />,
      title: "Improved Accuracy",
      description: "System becomes more accurate over time for all users"
    }
  ];

  return (
    <div className="py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">How Our AI Learns & Improves</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Our system continuously improves through a feedback loop of predictions, corrections, and learning.
          </p>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-indigo-300 to-green-200 transform -translate-y-1/2 hidden md:block" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-xl shadow-md relative z-10 transform transition-transform duration-300 hover:-translate-y-2"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gray-50 rounded-full">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">{step.title}</h3>
                <p className="text-gray-600 text-center">{step.description}</p>
                
                {/* Step number */}
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                
                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-blue-400 md:hidden">
                    ↓
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-700 font-medium">
            The more users correct predictions, the smarter our system becomes for everyone!
          </p>
        </div>
      </div>
    </div>
  );
} 