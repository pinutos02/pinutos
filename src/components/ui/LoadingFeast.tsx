import React from 'react';
import { motion } from 'motion/react';
import { Utensils, Soup, Salad, Coffee } from 'lucide-react';

export function LoadingFeast() {
  const icons = [Utensils, Soup, Salad, Coffee];

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* Table Surface */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute bottom-0 w-40 h-2 bg-brand-gold/20 rounded-full blur-sm"
      />

      {/* The "Eater" - Stylized representation */}
      <div className="relative flex flex-col items-center">
        {/* Head/Mouth area */}
        <motion.div 
          animate={{ 
            scaleY: [1, 1.2, 1],
            y: [0, -2, 0]
          }}
          transition={{ repeat: Infinity, duration: 0.6 }}
          className="w-12 h-12 rounded-full border-4 border-brand-gold flex items-center justify-center overflow-hidden bg-stone-900"
        >
          {/* Mouth */}
          <motion.div 
            animate={{ height: ['10%', '60%', '10%'] }}
            transition={{ repeat: Infinity, duration: 0.6 }}
            className="w-8 bg-brand-gold rounded-full opacity-80"
          />
        </motion.div>

        {/* Fork/Hand animation */}
        <motion.div
          animate={{
            y: [20, -15, 20],
            rotate: [15, 0, 15],
            x: [-10, 0, -10]
          }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
          className="absolute -right-8 top-8"
        >
          <Utensils className="text-brand-gold w-8 h-8" />
        </motion.div>

        {/* Floating food items being "eaten" */}
        <div className="absolute -left-12 top-0 space-y-4">
           {icons.map((Icon, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, x: -20 }}
               animate={{ 
                 opacity: [0, 1, 0],
                 x: [0, 40, 50],
                 y: [0, -10, -20],
                 scale: [1, 0.5, 0]
               }}
               transition={{ 
                 repeat: Infinity, 
                 duration: 2, 
                 delay: i * 0.5,
                 ease: "linear"
               }}
               className="text-brand-sepia opacity-50"
             >
               <Icon size={16} />
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
}
