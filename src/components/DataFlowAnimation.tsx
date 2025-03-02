import React, { useEffect, useRef } from 'react';
import { Receipt, Calendar, Brain } from 'lucide-react';

/**
 * A component that displays an animated data flow visualization
 * to illustrate how the AI processes food data.
 */
export default function DataFlowAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Prevent running in SSR
    if (typeof window === 'undefined') return;
    
    const container = containerRef.current;
    if (!container) return;
    
    // Create animated particles
    const createParticles = () => {
      try {
        // Remove existing particles
        const existingParticles = container.querySelectorAll('.data-particle');
        existingParticles.forEach(p => p.remove());
        
        // Create new particles
        for (let i = 0; i < 15; i++) {
          const particleTimeout = setTimeout(() => {
            if (!container) return;
            
            const particle = document.createElement('div');
            particle.className = 'data-particle absolute w-2 h-2 rounded-full bg-blue-500 opacity-70';
            
            // Random starting position at the Receipt icon
            const startX = 50; // Approximate x position of Receipt icon
            const startY = 100; // Approximate y position of Receipt icon
            
            particle.style.left = `${startX + (Math.random() * 10 - 5)}px`;
            particle.style.top = `${startY + (Math.random() * 10 - 5)}px`;
            
            container.appendChild(particle);
            
            // Animate to Brain
            const brainTimeout = setTimeout(() => {
              particle.style.transition = 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
              particle.style.left = `${180 + (Math.random() * 10 - 5)}px`; // Brain x position
              particle.style.top = `${100 + (Math.random() * 10 - 5)}px`; // Brain y position
            }, 100);
            
            // Animate to Calendar
            const calendarTimeout = setTimeout(() => {
              particle.style.left = `${310 + (Math.random() * 10 - 5)}px`; // Calendar x position
              particle.style.top = `${100 + (Math.random() * 10 - 5)}px`; // Calendar y position
            }, 1600);
            
            // Fade out and remove
            const fadeTimeout = setTimeout(() => {
              particle.style.opacity = '0';
              const removeTimeout = setTimeout(() => {
                if (particle.parentNode === container) {
                  particle.remove();
                }
              }, 500);
              
              return () => clearTimeout(removeTimeout);
            }, 3000);
            
            return () => {
              clearTimeout(brainTimeout);
              clearTimeout(calendarTimeout);
              clearTimeout(fadeTimeout);
            };
          }, i * 300); // Stagger particle creation
          
          return () => clearTimeout(particleTimeout);
        }
      } catch (error) {
        console.error('Error creating particles:', error);
      }
    };
    
    // Start animation and repeat
    createParticles();
    const interval = setInterval(createParticles, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  return (
    <div className="relative w-full h-[200px] bg-white/50 rounded-xl p-4 overflow-hidden" ref={containerRef}>
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
      
      {/* Add CSS for particles */}
      <style jsx>{`
        .data-particle {
          transition: opacity 0.5s ease-out;
        }
      `}</style>
    </div>
  );
} 