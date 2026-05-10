import React from 'react';
import { motion } from 'motion/react';
import { Fish, Flame, Coffee, Cake } from 'lucide-react';

const highlights = [
  {
    title: 'Seafood Sensation',
    description: 'Freshly caught crabs, shrimps, and mussels cooked in rich sauces.',
    icon: Fish,
    image: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&q=80&w=800',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    title: 'Signature Lechon',
    description: 'Crispy skin and tender meat, slow-roasted to perfection every weekend.',
    icon: Flame,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800',
    color: 'bg-orange-100 text-orange-600'
  },
  {
    title: 'Luzon to Mindanao',
    description: 'A culinary journey featuring classics like Kare-Kare and Humba.',
    icon: Coffee,
    image: 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?auto=format&fit=crop&q=80&w=800',
    color: 'bg-green-100 text-green-600'
  },
  {
    title: 'Sweet Ending',
    description: 'Traditional kakanin, halo-halo, and decadent desserts made daily.',
    icon: Cake,
    image: 'https://images.unsplash.com/photo-1551024506-0bccd038d33d?auto=format&fit=crop&q=80&w=800',
    color: 'bg-pink-100 text-pink-600'
  }
];

export function BuffetHighlights() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
      {highlights.map((item, index) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1, duration: 0.8 }}
          className="group cursor-pointer"
        >
          <div className="relative aspect-[3/4] overflow-hidden mb-8 border border-brand-sepia shadow-sm group-hover:shadow-xl transition-all duration-700">
            <img 
              src={item.image} 
              alt={item.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 grayscale-[0.2] group-hover:grayscale-0"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-brand-stone/10 group-hover:bg-transparent transition-colors duration-500"></div>
          </div>
          <div className="space-y-4 px-1">
            <div className="flex items-center gap-3">
               <item.icon className="w-4 h-4 text-brand-gold opacity-50" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Section 0{index + 1}</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-brand-stone group-hover:text-brand-gold transition-colors italic leading-tight">
              {item.title}
            </h3>
            <p className="text-stone-500 text-sm leading-relaxed font-medium">
              {item.description}
            </p>
            <div className="pt-2">
               <button className="text-[10px] font-black uppercase tracking-[0.3em] border-b border-brand-sepia pb-1 group-hover:border-brand-gold transition-all">View Detail</button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
