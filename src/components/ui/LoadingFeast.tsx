import React from 'react';
import { motion } from 'motion/react';
import { Utensils, Soup, Salad, Coffee, User } from 'lucide-react';

export function LoadingFeast() {
  const icons = [Utensils, Soup, Salad, Coffee];

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Table Surface */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute bottom-4 w-48 h-2 bg-brand-gold/20 rounded-full blur-sm"
      />

      {/* The "Eater" - More literal representation */}
      <div className="relative flex flex-col items-center">
        {/* Head and Torso */}
        <div className="relative">
          <motion.div 
            animate={{ 
              y: [0, -4, 0],
              rotate: [-2, 2, -2]
            }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="flex flex-col items-center"
          >
            <User className="w-20 h-20 text-brand-stone" strokeWidth={1.5} />
            
            {/* Mouth Animation - Overlaying the User icon head area */}
            <motion.div 
              animate={{ 
                height: ['4px', '12px', '4px'],
                width: ['8px', '12px', '8px'] 
              }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="absolute top-6 w-3 h-1 bg-brand-gold rounded-full opacity-60"
            />
          </motion.div>

          {/* Arms/Hands with Utensils */}
          <motion.div
            animate={{
              rotate: [-10, 10, -10],
              y: [0, -5, 0]
            }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            className="absolute -right-4 top-10"
          >
            <div className="bg-white p-2 rounded-full border border-brand-sepia shadow-sm">
              <Utensils className="text-brand-gold w-6 h-6" />
            </div>
          </motion.div>
        </div>

        {/* Floating food items being "eaten" */}
        <div className="absolute -left-16 top-4 space-y-6">
           {icons.map((Icon, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, x: -20 }}
               animate={{ 
                 opacity: [0, 1, 1, 0],
                 x: [0, 40, 50, 60],
                 y: [0, -10, -15, -20],
                 scale: [1, 1.2, 0.8, 0]
               }}
               transition={{ 
                 repeat: Infinity, 
                 duration: 2.5, 
                 delay: i * 0.6,
                 ease: "easeOut"
               }}
               className="text-brand-gold bg-white p-2 rounded-lg border border-brand-sepia/20 shadow-sm"
             >
               <Icon size={16} />
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
}
