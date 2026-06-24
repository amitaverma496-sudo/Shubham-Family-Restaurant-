import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface LiquidButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export default function LiquidButton({
  children,
  onClick,
  variant = 'primary',
  className = '',
}: LiquidButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for magnetic pull effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Springs for luxury organic damping (Apple style)
  const springConfig = { damping: 15, stiffness: 150, mass: 0.6 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  // Mouse coords relative to button for interactive glowing/radial reflection
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const buttonRectRef = useRef<DOMRect | null>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (buttonRef.current) {
      buttonRectRef.current = buttonRef.current.getBoundingClientRect();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRectRef.current && buttonRef.current) {
      buttonRectRef.current = buttonRef.current.getBoundingClientRect();
    }
    const rect = buttonRectRef.current;
    if (!rect) return;

    const width = rect.width;
    const height = rect.height;

    // Relative mouse position
    const relativeX = e.clientX - rect.left;
    const relativeY = e.clientY - rect.top;

    // Map coordinates for dynamic visual reflection
    setCoords({ x: relativeX, y: relativeY });

    // Calculate magnetic pull deflection (limited shift)
    const pullStrength = 12; // Max px to pull
    const dx = (relativeX - width / 2) / (width / 2);
    const dy = (relativeY - height / 2) / (height / 2);

    x.set(dx * pullStrength);
    y.set(dy * pullStrength);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    buttonRectRef.current = null;
    x.set(0);
    y.set(0);
  };

  // Unique gooey filter ID to prevent conflicts when multiple buttons render
  const gooeyFilterId = React.useId().replace(/:/g, '');

  return (
    <div className="relative group inline-block w-full sm:w-auto">
      {/* SVG Gooey Filter definitions for liquid metaballs fusion effect */}
      <svg className="absolute w-0 h-0 pointer-events-none" xmlns="http://www.w3.org/2000/svg" version="1.1">
        <defs>
          <filter id={`gooey-${gooeyFilterId}`}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <motion.button
        ref={buttonRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          x: springX,
          y: springY,
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        className={`
          relative w-full sm:w-auto h-[52px] rounded-full font-sans font-extrabold text-[11px] uppercase tracking-[0.22em]
          flex items-center justify-center overflow-hidden transition-all duration-300 pointer-events-auto
          cursor-pointer select-none border shadow-[0_4px_15px_rgba(0,0,0,0.3)]
          ${variant === 'primary' 
            ? 'bg-gold border-gold text-black shadow-gold/10 hover:shadow-gold/25' 
            : 'bg-black/40 backdrop-blur-md border-white/20 text-white hover:border-gold hover:text-gold shadow-black/40 hover:shadow-gold/15'
          }
          ${className}
        `}
      >
        {/* Dynamic Liquid Metaballs Layer */}
        <div 
          className="absolute inset-0 overflow-hidden rounded-full pointer-events-none"
          style={{ filter: `url(#gooey-${gooeyFilterId})` }}
        >
          {/* Base Background Overlay */}
          <div 
            className={`absolute inset-0 transition-opacity duration-300 ${
              variant === 'primary' ? 'bg-gold' : 'bg-transparent'
            }`} 
          />

          {/* Liquid Meta-Particles that swell and merge on hover */}
          <motion.div
            animate={{
              scale: isHovered ? 1.6 : 0,
              x: coords.x - 30,
              y: coords.y - 30,
            }}
            transition={{ type: 'spring', damping: 10, stiffness: 80, mass: 0.5 }}
            className={`absolute w-[60px] h-[60px] rounded-full blur-[4px] pointer-events-none ${
              variant === 'primary' 
                ? 'bg-white' // Liquid mercury shine merge for primary
                : 'bg-gold/40' // Warm gold droplet merge for secondary
            }`}
            style={{
              left: 0,
              top: 0,
            }}
          />

          {/* Secondary helper metaball for dynamic asymmetry */}
          <motion.div
            animate={{
              scale: isHovered ? 1.2 : 0,
              x: coords.y - 15,
              y: coords.x - 15,
            }}
            transition={{ type: 'spring', damping: 12, stiffness: 60, mass: 0.7 }}
            className={`absolute w-[40px] h-[40px] rounded-full blur-[4px] pointer-events-none ${
              variant === 'primary' 
                ? 'bg-white/80' 
                : 'bg-gold/30'
            }`}
            style={{
              left: '10%',
              top: '10%',
            }}
          />
        </div>

        {/* Dynamic glossy reflection highlight layer */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle 80px at ${coords.x}px ${coords.y}px, ${
              variant === 'primary' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(212, 175, 55, 0.25)'
            }, transparent)`,
          }}
        />

        {/* Dynamic shimmering sweeping sheen */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-full">
          <motion.div
            animate={isHovered ? {
              x: ['-100%', '200%'],
            } : { x: '-100%' }}
            transition={{
              repeat: Infinity,
              repeatType: 'loop',
              duration: 2.5,
              ease: 'linear',
            }}
            className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[35deg]"
          />
        </div>

        {/* Clean, high-contrast crisp text or icon label with subtle text translation */}
        <motion.span 
          animate={{
            y: isHovered ? -1 : 0,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="relative z-10 select-none px-8 font-sans"
        >
          {children}
        </motion.span>
      </motion.button>
    </div>
  );
}
