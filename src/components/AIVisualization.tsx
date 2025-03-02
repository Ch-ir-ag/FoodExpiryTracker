import React, { useEffect, useRef } from 'react';

/**
 * A component that renders an animated visualization of AI/ML processing
 * to showcase the intelligence behind the food expiry tracking system.
 */
export default function AIVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const setCanvasDimensions = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    
    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);
    
    // Create nodes for the neural network visualization
    const nodes: Node[] = [];
    const connections: Connection[] = [];
    
    // Define node structure
    interface Node {
      x: number;
      y: number;
      radius: number;
      color: string;
      pulseRadius: number;
      pulseOpacity: number;
      isPulsing: boolean;
      pulseDelay: number;
      layer: number;
    }
    
    // Define connection structure
    interface Connection {
      from: Node;
      to: Node;
      width: number;
      color: string;
      active: boolean;
      progress: number;
      speed: number;
    }
    
    // Create neural network structure
    const createNeuralNetwork = () => {
      const layers = [4, 8, 6, 2]; // Number of nodes in each layer
      const layerSpacing = canvas.width / (layers.length + 1);
      const colors = ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];
      
      // Create nodes for each layer
      for (let l = 0; l < layers.length; l++) {
        const nodeCount = layers[l];
        const layerX = (l + 1) * layerSpacing;
        const nodeSpacing = canvas.height / (nodeCount + 1);
        
        for (let n = 0; n < nodeCount; n++) {
          const node: Node = {
            x: layerX,
            y: (n + 1) * nodeSpacing,
            radius: 4 + Math.random() * 2,
            color: colors[l % colors.length],
            pulseRadius: 0,
            pulseOpacity: 0,
            isPulsing: false,
            pulseDelay: Math.random() * 5000,
            layer: l
          };
          
          nodes.push(node);
          
          // Connect to previous layer
          if (l > 0) {
            const prevLayer = nodes.filter(n => n.layer === l - 1);
            for (const prevNode of prevLayer) {
              connections.push({
                from: prevNode,
                to: node,
                width: 0.5 + Math.random() * 0.5,
                color: `rgba(59, 130, 246, ${0.1 + Math.random() * 0.2})`,
                active: false,
                progress: 0,
                speed: 0.005 + Math.random() * 0.01
              });
            }
          }
        }
      }
    };
    
    createNeuralNetwork();
    
    // Animation variables
    let animationFrame: number;
    let lastTime = 0;
    
    // Trigger random node activations
    const triggerRandomActivations = () => {
      // Activate a random input node
      const inputNodes = nodes.filter(n => n.layer === 0);
      const randomNode = inputNodes[Math.floor(Math.random() * inputNodes.length)];
      
      if (randomNode && !randomNode.isPulsing) {
        randomNode.isPulsing = true;
        randomNode.pulseRadius = 0;
        randomNode.pulseOpacity = 0.8;
        
        // Activate connections from this node
        connections
          .filter(c => c.from === randomNode)
          .forEach(conn => {
            conn.active = true;
            conn.progress = 0;
          });
      }
      
      // Schedule next activation
      setTimeout(triggerRandomActivations, 1000 + Math.random() * 2000);
    };
    
    // Start random activations
    setTimeout(triggerRandomActivations, 1000);
    
    // Animation loop
    const animate = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connections
      for (const conn of connections) {
        if (conn.active) {
          conn.progress += conn.speed * (deltaTime / 16);
          
          if (conn.progress >= 1) {
            conn.progress = 0;
            conn.active = false;
            
            // Activate the target node
            conn.to.isPulsing = true;
            conn.to.pulseRadius = 0;
            conn.to.pulseOpacity = 0.8;
            
            // Activate connections from this node
            connections
              .filter(c => c.from === conn.to)
              .forEach(nextConn => {
                nextConn.active = true;
                nextConn.progress = 0;
              });
          }
          
          // Draw active connection with gradient
          const gradient = ctx.createLinearGradient(
            conn.from.x, conn.from.y, 
            conn.to.x, conn.to.y
          );
          
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
          gradient.addColorStop(conn.progress, 'rgba(59, 130, 246, 0.8)');
          gradient.addColorStop(Math.min(conn.progress + 0.1, 1), 'rgba(59, 130, 246, 0.1)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
          
          ctx.beginPath();
          ctx.moveTo(conn.from.x, conn.from.y);
          ctx.lineTo(conn.to.x, conn.to.y);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = conn.width;
          ctx.stroke();
        } else {
          // Draw inactive connection
          ctx.beginPath();
          ctx.moveTo(conn.from.x, conn.from.y);
          ctx.lineTo(conn.to.x, conn.to.y);
          ctx.strokeStyle = conn.color;
          ctx.lineWidth = conn.width;
          ctx.stroke();
        }
      }
      
      // Draw nodes and pulses
      for (const node of nodes) {
        // Draw pulse effect
        if (node.isPulsing) {
          node.pulseRadius += 0.5 * (deltaTime / 16);
          node.pulseOpacity -= 0.02 * (deltaTime / 16);
          
          if (node.pulseOpacity <= 0) {
            node.isPulsing = false;
          } else {
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.pulseRadius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(59, 130, 246, ${node.pulseOpacity})`;
            ctx.fill();
          }
        }
        
        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
      }
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    // Start animation
    animationFrame = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
      cancelAnimationFrame(animationFrame);
    };
  }, []);
  
  return (
    <div className="relative w-full h-full min-h-[300px]">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-blue-600">AI-Powered Expiry Prediction</h3>
          <p className="text-sm text-gray-600">Our neural network learns from your shopping habits</p>
        </div>
      </div>
    </div>
  );
} 