import React from 'react';
import { motion } from 'motion/react';
import { Tag, Sparkles } from 'lucide-react';
import { useSiteMedia } from '../../hooks/useSiteMedia';

interface PromotionsProps {
  onNavigate: (view: any) => void;
}

export function Promotions({ onNavigate }: PromotionsProps) {
  const { media } = useSiteMedia();

  return (
    <section className="py-24 px-6 relative bg-white border-y border-brand-sepia">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row bg-warm-cream border border-brand-sepia overflow-hidden shadow-sm">
          <div className="p-12 lg:p-20 lg:w-1/2 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-brand-gold font-bold tracking-[0.3em] text-[10px] uppercase mb-6">
              <Sparkles className="w-3 h-3" />
              Limited Season Offer
            </div>
            <h2 className="font-serif text-5xl md:text-6xl font-bold text-brand-stone mb-8 italic leading-[1.1]">
              Weekend <br />
              <span className="text-brand-gold">Lechon Feast</span>
            </h2>
            <p className="text-stone-500 mb-10 leading-relaxed max-w-md text-sm">
              Enjoy our signature slow-roasted lechon every Saturday and Sunday. Unlimited servings included in our standard buffet prize.
            </p>
            <div className="flex flex-wrap gap-6 mb-10">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">Pricing</p>
                <p className="font-serif text-xl text-brand-stone italic">₱399.00 Nett</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">Eligibility</p>
                <p className="font-serif text-xl text-brand-stone italic">All Ages Welcome</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('reservation')}
              className="w-fit px-12 py-4 bg-brand-stone text-white text-[10px] uppercase tracking-[0.3em] font-black hover:bg-black transition-all"
            >
              Book for Next Weekend
            </button>
          </div>
          
          <div className="lg:w-1/2 min-h-[500px] relative">
            <img 
              src={media.lechon_promo} 
              alt="Delicious Lechon" 
              className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-0 right-0 bg-brand-gold text-white p-8 font-serif italic text-2xl">
              Freshly <br /> Roasted
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
