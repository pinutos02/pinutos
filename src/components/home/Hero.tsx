import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, ArrowDown } from 'lucide-react';
import { useSiteMedia } from '../../hooks/useSiteMedia';

interface HeroProps {
  onNavigate: (view: any) => void;
}

export function Hero({ onNavigate }: HeroProps) {
  const { media } = useSiteMedia();

  return (
    <section className="relative min-h-screen flex flex-col lg:flex-row bg-warm-cream overflow-hidden">
      {/* Editorial Left - Visual */}
      <div className="w-full lg:w-1/2 h-[60vh] lg:h-screen relative overflow-hidden group">
        <div className="absolute inset-0 bg-brand-stone/20 z-10"></div>
        <img 
          src={media.hero_bg} 
          alt="Filipino Buffet" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[20s] ease-linear"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-12 left-12 right-12 z-20 text-white">
          <p className="text-[10px] uppercase font-bold tracking-[0.4em] mb-4">The Master Experience</p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-5xl md:text-7xl leading-[0.9] mb-8 font-bold italic tracking-tighter"
          >
            We Serve Food <br /> Wrapped With Love.
          </motion.h2>
          <div className="flex flex-wrap gap-4">
             <div className="px-5 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] uppercase tracking-widest font-bold">Seafood Saturdays</div>
             <div className="px-5 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] uppercase tracking-widest font-bold">Sunday Lechon</div>
          </div>
        </div>
      </div>

      {/* Editorial Right - Info */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-12 lg:p-24 lg:pt-32 space-y-12 bg-warm-cream">
        <div className="space-y-6 max-w-lg">
          <span className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-gold block">Weekly Rotation</span>
          <h1 className="font-serif text-4xl md:text-5xl leading-tight text-brand-stone italic">
            A celebration of Misamis Oriental’s finest local flavors.
          </h1>
          <p className="text-stone-500 leading-relaxed text-sm md:text-base">
            Experience our curated eat-all-you-can spread featuring fresh-catch seafood and our signature heritage recipes from the heart of Looc.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-12 gap-y-10 border-t border-brand-sepia pt-12">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Operating Hours</p>
            <p className="text-sm font-medium">Mon — Sun<br /><span className="font-bold text-brand-stone">10:30 AM - 9:30 PM</span></p>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Buffet Access</p>
            <p className="text-sm font-medium">Adult: ₱399.00<br /><span className="font-bold italic text-brand-gold">Kids Eat Free*</span></p>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Location</p>
            <p className="text-sm font-medium text-stone-600">Purok 4, Looc<br /><span className="font-bold text-brand-stone">Villanueva</span></p>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Availability</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
              <span className="text-sm font-bold text-brand-stone">Table Open</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 pt-8">
          <button 
            onClick={() => onNavigate('reservation')}
            className="bg-brand-stone text-white px-10 py-4 text-[10px] uppercase tracking-[0.3em] font-black hover:bg-black transition-all shadow-xl shadow-brand-stone/20"
          >
            Reserve Table
          </button>
          <button 
             onClick={() => onNavigate('menu')}
             className="text-brand-stone text-[10px] uppercase tracking-[0.3em] font-black border-b-2 border-brand-gold pb-1 hover:border-brand-stone transition-all"
          >
            Full Buffet Menu
          </button>
        </div>
      </div>
    </section>
  );
}
