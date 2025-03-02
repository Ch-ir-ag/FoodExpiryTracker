import React, { useState, useEffect, useRef } from 'react';
import { Brain, BarChart, Clock, Zap } from 'lucide-react';

/**
 * A component that visualizes the AI learning process with animated steps.
 */
export default function AILearningProcess() {
  const [activeStep, setActiveStep] = useState(0);
  const componentRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const steps = [
    {
      icon: <Clock className="h-8 w-8 text-blue-500" />,
      title: "Data Collection",
      description: "The system collects data about your food items, including purchase dates, expiry dates, and consumption patterns."
    },
    {
      icon: <BarChart className="h-8 w-8 text-indigo-500" />,
      title: "Pattern Analysis",
      description: "AI algorithms analyze your household's unique consumption patterns and identify trends in food usage."
    },
    {
      icon: <Brain className="h-8 w-8 text-purple-500" />,
      title: "Model Training",
      description: "Machine learning models are trained on your data to predict optimal consumption windows for different food categories."
    },
    {
      icon: <Zap className="h-8 w-8 text-pink-500" />,
      title: "Smart Predictions",
      description: "The system provides personalized expiry predictions and consumption recommendations to minimize waste."
    }
  ];

  useEffect(() => {
    // Prevent running in SSR
    if (typeof window === 'undefined') return;
    
    try {
      // Set up intersection observer to start animation when component is in view
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            startStepAnimation();
            observer.disconnect();
          }
        },
        { threshold: 0.2 }
      );
      
      if (componentRef.current) {
        observer.observe(componentRef.current);
      }
      
      return () => {
        observer.disconnect();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } catch (error) {
      console.error('Error setting up intersection observer:', error);
      // Fallback: just start animation without intersection observer
      startStepAnimation();
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, []);
  
  const startStepAnimation = () => {
    try {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Reset to first step
      setActiveStep(0);
      
      // Set up interval to cycle through steps
      intervalRef.current = setInterval(() => {
        setActiveStep(prev => {
          const nextStep = (prev + 1) % steps.length;
          return nextStep;
        });
      }, 3000);
    } catch (error) {
      console.error('Error starting step animation:', error);
    }
  };

  return (
    <div ref={componentRef} className="py-12">
      <h2 className="text-3xl font-bold text-center mb-12">How Our AI Learns</h2>
      
      <div className="max-w-4xl mx-auto">
        {/* Progress bar */}
        <div className="relative mb-12">
          <div className="absolute h-1 w-full bg-gray-200 rounded"></div>
          <div 
            className="absolute h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded transition-all duration-500 ease-in-out"
            style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
          ></div>
          
          {/* Step indicators */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 transition-all duration-300 ${
                  index <= activeStep 
                    ? 'border-purple-500 text-purple-500' 
                    : 'border-gray-300 text-gray-400'
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>
        
        {/* Active step content */}
        <div className="bg-white rounded-xl shadow-lg p-8 transition-all duration-500">
          <div className="flex items-start space-x-6">
            <div className="p-3 bg-purple-50 rounded-lg">
              {steps[activeStep]?.icon || <Brain className="h-8 w-8 text-purple-500" />}
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">{steps[activeStep]?.title || "AI Learning Process"}</h3>
              <p className="text-gray-600">{steps[activeStep]?.description || "Our AI system learns from your data to provide personalized recommendations."}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 