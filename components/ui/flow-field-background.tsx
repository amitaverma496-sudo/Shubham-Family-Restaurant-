import React, { useEffect, useRef } from "react";
import { cn } from "@/src/lib/utils";

interface NeuralBackgroundProps {
  className?: string;
  /**
   * Color of the particles. 
   * Defaults to a cyan/indigo mix if not specified.
   */
  color?: string;
  /**
   * The opacity of the trails (0.0 to 1.0).
   * Note: In transparent mode, this controls trail longevity.
   * Default: 0.15
   */
  trailOpacity?: number;
  /**
   * Number of particles. Default: 600
   */
  particleCount?: number;
  /**
   * Speed multiplier. Default: 1
   */
  speed?: number;
  /**
   * Scale size multiplier. Default: 1
   */
  scale?: number;
}

export default function NeuralBackground({
  className,
  color = "#D4AF37", // Fallback color
  trailOpacity = 0.15,
  particleCount = 200,
  speed = 1,
  scale = 1,
}: NeuralBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef(color);

  // Sync color ref on state change smoothly
  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // --- CONFIGURATION ---
    let width = container.clientWidth;
    let height = container.clientHeight;
    let particles: Particle[] = [];
    let animationFrameId: number;
    let mouse = { x: -1000, y: -1000 }; // Start off-screen
    let time = 0; // For undulating 3D sine-wave movements
    let hue = 45; // Start at 45 (Gold-Yellow 3D effect)

    // Maximum trail history length based on trail opacity
    const maxTrailLength = Math.max(3, Math.min(30, Math.round(1.5 / (trailOpacity || 0.15))));

    // --- PARTICLE CLASS ---
    class Particle {
      x: number;
      y: number;
      z: number; // Depth coordinate for real 3D space representation
      vx: number;
      vy: number;
      age: number;
      life: number;
      history: { px: number; py: number; scaleZ: number }[];

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.z = Math.random() * 200 - 100; // Simulated z depth from -100 to 100
        this.vx = 0;
        this.vy = 0;
        this.age = 0;
        this.life = Math.random() * 180 + 80;
        this.history = [];
      }

      // Project 3D coordinate (x, y, z) into 2D view space using perspective formulas
      getProjected(t: number) {
        // Undulate the z depth coordinate continuously based on spatial coordinates and time
        const wave = Math.sin(this.x * 0.0035 + t * 1.8) * Math.cos(this.y * 0.0035 + t * 1.8);
        const currentZ = wave * 160; // depth range of -160 to 160

        const centerX = width / 2;
        const centerY = height / 2;
        
        // Standard perspective camera distance
        const cameraDistance = 380;
        const scaleZ = cameraDistance / (cameraDistance + currentZ);

        // Map 3D points relative to screen center with scale factor
        const px = centerX + (this.x - centerX) * scaleZ;
        const py = centerY + (this.y - centerY) * scaleZ;

        return { px, py, scaleZ };
      }

      update(t: number) {
        const proj = this.getProjected(t);

        // Store history of projected perspective coordinates
        this.history.unshift({ px: proj.px, py: proj.py, scaleZ: proj.scaleZ });
        if (this.history.length > maxTrailLength) {
          this.history.pop();
        }

        // 1. Flow Field Math (Simplex-ish noise angle vector based on 3D flow)
        const angle = (Math.cos(this.x * 0.004) + Math.sin(this.y * 0.004)) * Math.PI;
         
        // 2. Add force from flow field
        this.vx += Math.cos(angle) * 0.16 * speed;
        this.vy += Math.sin(angle) * 0.16 * speed;

        // 3. Mouse Interactives
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const interactionRadius = 180;

        if (distance < interactionRadius) {
          const force = (interactionRadius - distance) / interactionRadius;
          // Fluid pushing away behavior
          this.vx -= dx * force * 0.08;
          this.vy -= dy * force * 0.08;
        }

        // 4. Apply velocity coordinates & friction damping
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.94;
        this.vy *= 0.94;

        // 5. Aging
        this.age++;
        if (this.age > this.life) {
          this.reset();
        }

        // 6. Wrap around screen parameters smoothly
        if (this.x < 0) { this.x = width; this.history = []; }
        if (this.x > width) { this.x = 0; this.history = []; }
        if (this.y < 0) { this.y = height; this.history = []; }
        if (this.y > height) { this.y = 0; this.history = []; }
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = 0;
        this.vy = 0;
        this.age = 0;
        this.life = Math.random() * 180 + 80;
        this.history = [];
      }

      draw(context: CanvasRenderingContext2D, activeColor: string) {
        if (this.history.length < 2) return;

        const ageAlpha = 1 - Math.abs((this.age / this.life) - 0.5) * 2;
        const head = this.history[0];
         
        // Draw elegant connecting trail lines in 3D perspective depth space in a single contiguous stroke!
        context.beginPath();
        let first = true;
        
        for (let i = 0; i < this.history.length; i++) {
          const pt = this.history[i];
          if (first) {
            context.moveTo(pt.px, pt.py);
            first = false;
          } else {
            const prev = this.history[i - 1];
            // Skip drawing if wraparound triggered a boundary gap
            if (Math.abs(pt.px - prev.px) > width * 0.5 || Math.abs(pt.py - prev.py) > height * 0.5) {
              context.stroke();
              context.beginPath();
              context.moveTo(pt.px, pt.py);
            } else {
              context.lineTo(pt.px, pt.py);
            }
          }
        }

        const alpha = 0.3 * ageAlpha * head.scaleZ;
        context.strokeStyle = activeColor;
        context.globalAlpha = Math.max(0, Math.min(1, alpha));
        context.lineWidth = 1.1 * scale * head.scaleZ;
        context.stroke();

        // Highlight head particle in projected space using flat rectangle instead of costly arc
        if (head) {
          const hSize = Math.max(1, 2.2 * scale * head.scaleZ);
          context.fillStyle = activeColor;
          context.globalAlpha = Math.max(0, Math.min(1, ageAlpha * 0.95 * head.scaleZ));
          context.fillRect(head.px - hSize / 2, head.py - hSize / 2, hSize, hSize);
        }
      }
    }

    // --- INITIALIZATION ---
    const init = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    // --- ANIMATION LOOP ---
    const animate = () => {
      // Clear the canvas fully each frame
      ctx.clearRect(0, 0, width, height);

      time += 0.0035; // Increment time wave multiplier
      
      // Rotate hue smoothly over time. Cycles across the spectrum of super-light colors!
      hue = (hue + 0.05) % 360;
      // High lightness of 84% + High saturation of 95% makes the colors super light, glowing, listless, ultra premium neon
      const activeColor = `hsl(${hue}, 95%, 83%)`;

      particles.forEach((p) => {
        p.update(time);
        p.draw(ctx, activeColor);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    // --- EVENT LISTENERS ---
    const handleResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    // Start
    init();
    animate();

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [trailOpacity, particleCount, speed, scale]);

  return (
    <div ref={containerRef} className={cn("relative w-full h-full bg-transparent overflow-hidden", className)}>
      <canvas ref={canvasRef} className="block w-full h-full pointer-events-none" />
    </div>
  );
}
