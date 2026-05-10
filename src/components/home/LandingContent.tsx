import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Calendar, ExternalLink, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface LandingAsset {
  id: string;
  title: string;
  subtitle?: string;
  type: 'image' | 'video' | 'event' | 'moment';
  mediaUrl: string;
  thumbnailUrl?: string;
  linkUrl?: string;
  order: number;
  isActive: boolean;
}

export function DynamicAds({ onNavigate }: { onNavigate: (view: any) => void }) {
  const [ads, setAds] = useState<LandingAsset[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'landing_assets'), 
      where('type', '==', 'image'),
      where('isActive', '==', true),
      orderBy('order', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LandingAsset)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'landing_assets'));
  }, []);

  if (ads.length === 0) return null;

  return (
    <section className="py-24 px-6 relative bg-white border-y border-brand-sepia">
      <div className="max-w-7xl mx-auto space-y-12">
        {ads.map((ad, idx) => (
          <motion.div 
            key={ad.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn(
              "flex flex-col border border-brand-sepia overflow-hidden shadow-sm",
              idx % 2 === 0 ? "lg:flex-row bg-warm-cream" : "lg:flex-row-reverse bg-white"
            )}
          >
            <div className="p-12 lg:p-20 lg:w-1/2 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-brand-gold font-bold tracking-[0.3em] text-[10px] uppercase mb-6">
                <Sparkles className="w-3 h-3" />
                Featured Highlight
              </div>
              <h2 className="font-serif text-5xl md:text-6xl font-bold text-brand-stone mb-8 italic leading-[1.1]">
                {ad.title}
              </h2>
              <p className="text-stone-500 mb-10 leading-relaxed max-w-md text-sm">
                {ad.subtitle}
              </p>
              {ad.linkUrl && (
                <button 
                  onClick={() => onNavigate('reservation')}
                  className="w-fit px-12 py-4 bg-brand-stone text-white text-[10px] uppercase tracking-[0.3em] font-black hover:bg-black transition-all"
                >
                  Book Your Table
                </button>
              )}
            </div>
            
            <div className="lg:w-1/2 min-h-[500px] relative">
              <img 
                src={ad.mediaUrl} 
                alt={ad.title} 
                className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function DynamicVideos() {
  const [videos, setVideos] = useState<LandingAsset[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'landing_assets'), 
      where('type', '==', 'video'),
      where('isActive', '==', true),
      orderBy('order', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      setVideos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LandingAsset)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'landing_assets/videos'));
  }, []);

  if (videos.length === 0) return null;

  return (
    <section className="py-24 px-6 bg-brand-stone text-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
           <span className="text-[10px] uppercase font-bold tracking-[0.5em] text-brand-gold mb-4 block">The Visual Heritage</span>
           <h2 className="font-serif text-5xl md:text-6xl font-bold italic">Cinematic Moments</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {videos.map((video) => (
            <motion.div 
              key={video.id}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="aspect-video relative bg-black border border-white/10 group cursor-pointer overflow-hidden">
                <iframe 
                  src={video.mediaUrl}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif font-bold italic">{video.title}</h3>
                <p className="text-stone-400 text-sm">{video.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DynamicMoments() {
  const [moments, setMoments] = useState<LandingAsset[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'landing_assets'), 
      where('type', '==', 'moment'),
      where('isActive', '==', true),
      orderBy('order', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      setMoments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LandingAsset)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'landing_assets/moments'));
  }, []);

  if (moments.length === 0) return null;

  return (
    <section className="py-24 px-6 bg-warm-cream border-t border-brand-sepia">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.5em] text-brand-gold mb-4 block">Shared Memories</span>
            <h2 className="font-serif text-5xl md:text-7xl font-bold text-brand-stone italic">Heritage Moments</h2>
          </div>
          <p className="text-stone-500 max-w-sm text-sm italic">
            Capturing the laughter, the flavors, and the soul of Filipino gatherings at The Heritage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {moments.map((moment, idx) => (
            <motion.div
              key={moment.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "relative group overflow-hidden bg-stone-200 border border-brand-sepia",
                idx % 4 === 0 ? "md:col-span-2 aspect-[16/9]" : "aspect-[3/4]"
              )}
            >
              <img 
                src={moment.mediaUrl} 
                alt={moment.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                <h3 className="text-white font-serif text-2xl font-bold italic">{moment.title}</h3>
                <p className="text-white/80 text-xs mt-2 uppercase tracking-widest">{moment.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DynamicEvents() {
  const [events, setEvents] = useState<LandingAsset[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'landing_assets'), 
      where('type', '==', 'event'),
      where('isActive', '==', true),
      orderBy('order', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LandingAsset)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'landing_assets/events'));
  }, []);

  if (events.length === 0) return null;

  return (
    <section className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
           <div className="lg:col-span-1 sticky top-32">
              <span className="text-[10px] uppercase font-black tracking-[0.4em] text-brand-gold mb-6 block">Save the Date</span>
              <h2 className="font-serif text-5xl font-bold text-brand-stone italic leading-[1.1]">Upcoming Festivities</h2>
              <p className="text-stone-500 mt-8 text-sm leading-relaxed">
                Join us for seasonal celebrations and heritage festivals hosted right here in our Looc sanctuary.
              </p>
           </div>
           
           <div className="lg:col-span-3 space-y-12">
              {events.map((event) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="group flex flex-col md:flex-row gap-8 items-center border-b border-brand-sepia pb-12"
                >
                  <div className="w-full md:w-64 aspect-square shrink-0 overflow-hidden border border-brand-sepia">
                    <img src={event.mediaUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-grow space-y-4">
                    <div className="flex items-center gap-4">
                       <Calendar className="w-4 h-4 text-brand-gold" />
                       <span className="text-[10px] uppercase font-black tracking-widest text-brand-gold">{event.subtitle}</span>
                    </div>
                    <h3 className="text-3xl font-serif font-bold text-brand-stone italic">{event.title}</h3>
                    <p className="text-stone-500 text-sm max-w-xl">
                      Experience authentic Villanueva hospitality at its finest during our special scheduled events.
                    </p>
                    {event.linkUrl && (
                      <a href={event.linkUrl} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-stone border-b border-brand-gold pb-1 hover:border-brand-stone transition-all">
                        Learn More <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
           </div>
        </div>
      </div>
    </section>
  );
}
