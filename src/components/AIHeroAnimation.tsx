import React, { useEffect, useRef, useState } from 'react';

/**
 * A component that displays an animated hero background with AI-themed particles.
 */
export default function AIHeroAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Prevent running in SSR
    if (typeof window === 'undefined') return;
    
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas dimensions
      const setCanvasDimensions = () => {
        try {
          if (!canvas) return;
          
          canvas.width = window.innerWidth;
          canvas.height = 400; // Fixed height for hero section
          
          // Clear canvas when resizing
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
          
          // Recreate particles when resizing
          if (isInitialized) {
            particles = createParticles();
          }
        } catch (error) {
          console.error('Error setting canvas dimensions:', error);
        }
      };
      
      // Set initial dimensions
      setCanvasDimensions();
      setIsInitialized(true);
      
      // Update dimensions on resize
      window.addEventListener('resize', setCanvasDimensions);
      
      // Particle class
      class Particle {
        x: number;
        y: number;
        size: number;
        speedX: number;
        speedY: number;
        color: string;
        
        constructor(x: number, y: number, size: number, speedX: number, speedY: number, color: string) {
          this.x = x;
          this.y = y;
          this.size = size;
          this.speedX = speedX;
          this.speedY = speedY;
          this.color = color;
        }
        
        update() {
          this.x += this.speedX;
          this.y += this.speedY;
          
          // Bounce off edges
          if (this.x < 0 || this.x > (canvas?.width || 0)) this.speedX *= -1;
          if (this.y < 0 || this.y > (canvas?.height || 0)) this.speedY *= -1;
        }
        
        draw() {
          if (!ctx) return;
          
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
        }
      }
      
      // Create particles
      const createParticles = () => {
        try {
          const particleCount = Math.min(50, Math.floor((canvas.width * canvas.height) / 10000));
          const particles: Particle[] = [];
          
          const colors = [
            'rgba(59, 130, 246, 0.5)', // blue
            'rgba(139, 92, 246, 0.5)',  // purple
            'rgba(236, 72, 153, 0.5)',  // pink
          ];
          
          for (let i = 0; i < particleCount; i++) {
            const size = Math.random() * 5 + 1;
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const speedX = (Math.random() - 0.5) * 0.5;
            const speedY = (Math.random() - 0.5) * 0.5;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            particles.push(new Particle(x, y, size, speedX, speedY, color));
          }
          
          return particles;
        } catch (error) {
          console.error('Error creating particles:', error);
          return [];
        }
      };
      
      // Create initial particles
      let particles = createParticles();
      
      // Connection lines
      const drawConnections = () => {
        try {
          if (!ctx) return;
          
          for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
              const dx = particles[i].x - particles[j].x;
              const dy = particles[i].y - particles[j].y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance < 100) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(147, 197, 253, ${1 - distance / 100})`; // blue with opacity based on distance
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
              }
            }
          }
        } catch (error) {
          console.error('Error drawing connections:', error);
        }
      };
      
      // Animation loop
      const animate = () => {
        try {
          if (!ctx || !canvas) return;
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Update and draw particles
          particles.forEach(particle => {
            particle.update();
            particle.draw();
          });
          
          // Draw connections
          drawConnections();
          
          // Continue animation
          animationFrameRef.current = requestAnimationFrame(animate);
        } catch (error) {
          console.error('Error in animation loop:', error);
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
        }
      };
      
      // Start animation
      animationFrameRef.current = requestAnimationFrame(animate);
      
      // Cleanup
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        window.removeEventListener('resize', setCanvasDimensions);
      };
    } catch (error) {
      console.error('Error initializing AIHeroAnimation:', error);
      return () => {};
    }
  }, [isInitialized]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full -z-10 opacity-70"
      aria-hidden="true"
    />
  );
} 