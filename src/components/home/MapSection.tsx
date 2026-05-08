import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Clock, Mail } from 'lucide-react';

export function MapSection() {
  return (
    <section className="py-24 px-12 bg-warm-cream border-t border-brand-sepia">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-20 items-stretch">
        <div className="lg:col-span-2 space-y-16">
          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-gold mb-4 block">Our Presence</span>
            <h2 className="font-serif text-5xl font-bold text-brand-stone mb-6 italic leading-none">Visit the <br /> Heritage House</h2>
            <p className="text-stone-500 leading-relaxed max-w-sm text-sm">
              We are conveniently located along the coastline of Villanueva, offering refreshing sea breezes and heritage hospitality.
            </p>
          </div>

          <div className="space-y-12">
            <div className="flex gap-8">
              <div className="w-12 h-12 flex items-center justify-center border border-brand-sepia shrink-0 text-brand-gold">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-brand-stone mb-2 uppercase tracking-[0.3em] text-[10px]">Territory</h4>
                <p className="text-stone-500 text-sm leading-relaxed italic">
                  Purok 4, Looc, Villanueva, Misamis Oriental. <br />
                  Beside Aquarius Beach.
                </p>
              </div>
            </div>

            <div className="flex gap-8">
              <div className="w-12 h-12 flex items-center justify-center border border-brand-sepia shrink-0 text-brand-gold">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-brand-stone mb-2 uppercase tracking-[0.3em] text-[10px]">Designation</h4>
                <p className="text-stone-500 text-sm italic">+63 9XX XXX XXXX</p>
              </div>
            </div>

            <div className="flex gap-8">
              <div className="w-12 h-12 flex items-center justify-center border border-brand-sepia shrink-0 text-brand-gold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-brand-stone mb-2 uppercase tracking-[0.3em] text-[10px]">Operations</h4>
                <p className="text-stone-500 text-sm italic">Mon - Sun: 10:30 AM - 9:30 PM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 min-h-[500px] bg-white overflow-hidden shadow-sm relative border border-brand-sepia">
          <div className="absolute inset-0 bg-brand-stone/5 z-0"></div>
          <div className="absolute inset-0 grayscale opacity-40 hover:opacity-20 transition-opacity duration-1000">
             <img 
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200" 
              className="w-full h-full object-cover" 
              alt="Map" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center p-12 bg-white/80 backdrop-blur-md border border-brand-sepia shadow-2xl">
              <MapPin className="w-10 h-10 text-brand-gold mx-auto mb-6" />
              <p className="text-brand-stone font-black uppercase tracking-[0.4em] text-[10px]">Heritage Eat All You Can</p>
              <p className="text-stone-400 text-[10px] mt-2 uppercase tracking-widest font-bold">Looc, Villanueva</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
