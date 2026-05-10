import React from 'react';
import { Hero } from '../components/home/Hero';
import { BuffetHighlights } from '../components/home/BuffetHighlights';
import { Promotions } from '../components/home/Promotions';
import { Testimonials } from '../components/home/Testimonials';
import { MapSection } from '../components/home/MapSection';
import { motion } from 'motion/react';
import { DynamicAds, DynamicVideos, DynamicMoments, DynamicEvents } from '../components/home/LandingContent';
import { useSiteMedia } from '../hooks/useSiteMedia';

interface HomePageProps {
  onNavigate: (view: any) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { media } = useSiteMedia();

  return (
    <div className="space-y-0">
      <Hero onNavigate={onNavigate} />
      
      <section className="py-24 px-6 bg-warm-cream overflow-hidden border-t border-brand-sepia">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-brand-gold mb-4 block">The Selection</span>
            <h2 className="font-serif text-5xl md:text-6xl font-bold text-brand-stone italic">
              Savor the Filipino Soul
            </h2>
          </motion.div>
          <BuffetHighlights />
        </div>
      </section>

      <DynamicVideos />
      
      <DynamicAds onNavigate={onNavigate} />

      <Promotions onNavigate={onNavigate} />

      <DynamicEvents />
      
      <Testimonials />

      <DynamicMoments />

      <section className="py-24 px-12 bg-white border-t border-brand-sepia">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <span className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-gold block">Catering Services</span>
            <h2 className="font-serif text-5xl font-bold text-brand-stone mb-8 leading-tight italic">
              Let Us Host Your Next <br /> Heritage Celebration
            </h2>
            <p className="text-stone-500 mb-8 text-sm leading-relaxed max-w-md">
              We provide professional catering services for weddings, birthdays, corporate events, and family reunions. Our heritage recipes bring the soul of Villanueva to your special moments.
            </p>
            <div className="pt-4">
              <button 
                onClick={() => onNavigate('catering')}
                className="text-[10px] font-black uppercase tracking-[0.3em] border-b-2 border-brand-gold pb-1 hover:border-brand-stone transition-all"
              >
                Inquire for Events
              </button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/3] overflow-hidden shadow-2xl border border-brand-sepia group">
              <img 
                src={media.catering_promo} 
                alt="Catering Setup" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 bg-warm-cream border border-brand-sepia p-10 shadow-sm hidden lg:block">
              <p className="text-4xl font-serif font-bold text-brand-stone mb-1 italic">250+</p>
              <p className="text-[10px] uppercase tracking-[0.4em] font-black text-stone-400">Successful Events</p>
            </div>
          </motion.div>
        </div>
      </section>

      <MapSection />
    </div>
  );
}
