import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface LogoProps {
  className?: string;
  size?: number;
  animated?: boolean;
}

export function Logo({ className, size = 120, animated = false }: LogoProps) {
  return (
    <div 
      className={cn("flex flex-col items-center justify-center bg-[#D9A426] p-10 rounded-2xl shadow-2xl overflow-visible", className)}
      style={{ width: size * 2.4, height: size * 3.4 }}
    >
      {/* circular emblem with a textured dark red interior and a thick white border */}
      <div className="relative w-full aspect-square flex items-center justify-center">
        <motion.div 
          initial={animated ? { scale: 0.9, opacity: 0 } : {}}
          animate={animated ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full aspect-square rounded-full border-[14px] border-white overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.4)] bg-[#800F0F]"
          style={{ 
            backgroundImage: `
              radial-gradient(circle at 35% 35%, rgba(255,255,255,0.2) 0%, transparent 60%),
              url("https://www.transparenttextures.com/patterns/carbon-fibre.png")
            `,
            backgroundBlendMode: 'overlay'
          }}
        >
          {/* Hand Holding Bag Animation */}
          <motion.div 
            initial={animated ? { y: -10, rotate: -1 } : {}}
            animate={animated ? { y: 15, rotate: 1 } : {}}
            transition={{ 
              repeat: animated ? Infinity : 0, 
              repeatType: 'reverse', 
              duration: 2.8,
              ease: "easeInOut"
            }}
            className="absolute inset-0 flex flex-col items-center justify-center pt-12"
          >
            {/* The Bag - Tapered Kraft Paper Style */}
            <div 
              className="relative w-40 h-52 bg-[#C19A6B] shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex flex-col items-center pt-12 overflow-visible"
              style={{ 
                clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)'
              }}
            >
              {/* Shading */}
              <div className="absolute inset-0 bg-black/10 opacity-20 pointer-events-none" style={{ clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)' }}></div>
              
              {/* EST. 2020 */}
              <div className="mt-auto mb-10 z-10">
                <span 
                  className="text-white font-black text-xl tracking-[0.25em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  EST. 2020
                </span>
              </div>
            </div>

            {/* Folded Flap - Separate element to be above/below clip-path logic */}
            <div className="absolute top-[48px] w-32 h-12 bg-[#A67B5B] shadow-lg z-20 flex flex-col border-b border-black/20">
               <div className="w-full h-1.5 bg-black/10"></div>
            </div>

            {/* The Hand - Layered specifically */}
            <div className="absolute inset-0 pointer-events-none z-40 transform translate-x-4">
               <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_15px_25px_rgba(0,0,0,0.5)]">
                  {/* Sleeve */}
                  <path d="M210 -10 L160 55 L125 30 L170 -40 Z" fill="#E5E7EB" />
                  
                  {/* Hand */}
                  <path d="M140 45 C130 35 110 35 100 45 C95 52 98 68 110 75 C125 85 145 80 150 70 C155 60 150 50 140 45Z" fill="#F5DEB3" />
                  
                  {/* Finger Overlap */}
                  <g stroke="#D2B48C" strokeWidth="0.5" fill="#F5DEB3">
                    <path d="M100 68 C95 65 85 68 82 75 C80 82 88 88 95 85" />
                    <path d="M110 78 C105 75 95 78 92 85 C90 92 98 98 105 95" />
                  </g>

                  {/* Thumb with White Nail */}
                  <path d="M130 75 C135 80 155 82 160 72 C165 62 145 55 135 60" fill="#F5DEB3" stroke="#D2B48C" strokeWidth="0.5" />
                  <ellipse cx="152" cy="73" rx="4" ry="2.5" fill="white" transform="rotate(-20 152 73)" />
               </svg>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* HERITAGE TEXT */}
      <div className="mt-12 relative text-center">
        <h2 
          className="text-white font-black text-5xl lg:text-7xl italic tracking-tighter uppercase leading-none"
          style={{ 
            textShadow: `
              6px 6px 0px #000, 
              -1px -1px 0px #000, 
              1px -1px 0px #000, 
              -1px 1px 0px #000, 
              1px 1px 0px #000,
              0px 10px 20px rgba(0,0,0,0.6)
            `,
            fontFamily: '"Playfair Display", serif',
            letterSpacing: '-0.02em'
          }}
        >
          THE HERITAGE
        </h2>
      </div>
    </div>
  );
}
