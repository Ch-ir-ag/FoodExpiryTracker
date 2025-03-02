import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TrendingUp, DollarSign, Leaf, ShoppingBag } from 'lucide-react';

/**
 * A component that displays AI-powered food waste reduction statistics with animated counters.
 */
export default function AIWasteReductionStats() {
  // Stats to display (these would come from your backend in a real app)
  const stats = useMemo(() => [
    {
      icon: <ShoppingBag className="h-8 w-8 text-blue-500" />,
      value: 1250,
      label: "Items Tracked",
      suffix: "+",
      color: "from-blue-400 to-blue-600"
    },
    {
      icon: <Leaf className="h-8 w-8 text-green-500" />,
      value: 320,
      label: "Kg Food Saved",
      suffix: "kg",
      color: "from-green-400 to-green-600"
    },
    {
      icon: <DollarSign className="h-8 w-8 text-indigo-500" />,
      value: 1840,
      label: "Money Saved",
      prefix: "€",
      color: "from-indigo-400 to-indigo-600"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-purple-500" />,
      value: 94,
      label: "Prediction Accuracy",
      suffix: "%",
      color: "from-purple-400 to-purple-600"
    }
  ], []);

  // Refs for intersection observer
  const statsRef = useRef<HTMLDivElement>(null);
  
  // State for counter values
  const [counters, setCounters] = useState<number[]>(stats.map(() => 0));
  
  // Animation duration in ms
  const animationDuration = 2000;
  
  useEffect(() => {
    // Function to animate counters
    const animateCounters = () => {
      const startTime = Date.now();
      
      const interval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / animationDuration, 1);
        
        // Easing function for smoother animation
        const easeOutQuad = (t: number) => t * (2 - t);
        const easedProgress = easeOutQuad(progress);
        
        setCounters(stats.map((stat) => Math.floor(stat.value * easedProgress)));
        
        if (progress >= 1) {
          clearInterval(interval);
        }
      }, 16); // ~60fps
      
      return () => clearInterval(interval);
    };
    
    // Set up intersection observer to trigger animation when component is in view
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animateCounters();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    
    return () => observer.disconnect();
  }, [stats]);
  
  return (
    <div ref={statsRef} className="py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="bg-white rounded-xl shadow-md overflow-hidden transform transition-transform duration-300 hover:-translate-y-1"
          >
            <div className={`h-2 bg-gradient-to-r ${stat.color}`} />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {stat.prefix}{counters[index].toLocaleString()}{stat.suffix}
                </div>
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 italic">
          * Statistics based on aggregated anonymous user data
        </p>
      </div>
    </div>
  );
} 