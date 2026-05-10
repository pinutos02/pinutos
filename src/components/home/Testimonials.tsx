import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';
import { cn } from '../../lib/utils';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, query, where, limit, onSnapshot, orderBy } from 'firebase/firestore';

interface Testimonial {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  role?: string;
  avatar?: string;
}

const FALLBACK_TESTIMONIALS = [
  {
    userName: "Maria Santos",
    role: "Local Guide",
    comment: "The seafood selection is amazing! Very fresh and the staff are incredibly welcoming. Definitely worth the trip to Villanueva.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria"
  },
  {
    userName: "John David",
    role: "Foodie Blogger",
    comment: "This place has the best lechon in town. The skin is consistently crispy and the meat is flavorful. Great family atmosphere!",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John"
  },
  {
    userName: "Elena Garcia",
    role: "Resident",
    comment: "We always celebrate our birthdays here. The buffet price is very reasonable for the quality and variety of food they serve.",
    rating: 4,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena"
  }
];

export function Testimonials() {
  const [items, setItems] = useState<any[]>(FALLBACK_TESTIMONIALS);

  useEffect(() => {
    const q = query(
      collection(db, 'reviews'),
      where('isModerated', '==', true),
      orderBy('createdAt', 'desc'),
      limit(3)
    );

    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setItems(snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          avatar: doc.data().avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.data().userName || doc.id}`
        })));
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'reviews'));
  }, []);

  return (
    <section className="py-24 px-12 bg-white border-y border-brand-sepia relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
        <Quote className="w-[800px] h-[800px] text-brand-gold" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24 space-y-4">
          <span className="text-[10px] uppercase font-black tracking-[0.4em] text-brand-gold block">Guest Reviews</span>
          <h2 className="font-serif text-5xl md:text-7xl font-bold italic text-brand-stone leading-none">Voices of the Guests</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-brand-sepia bg-warm-cream">
          {items.map((item, index) => (
            <motion.div
              key={item.id || item.userName}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 1 }}
              className={cn(
                "p-16 flex flex-col items-center text-center space-y-10",
                index === 1 ? "bg-white border-x border-brand-sepia" : "bg-transparent"
              )}
            >
              <div className="flex gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3 h-3 ${i < item.rating ? 'text-brand-gold fill-brand-gold' : 'text-stone-300'}`} 
                  />
                ))}
              </div>
              
              <p className="text-stone-600 italic leading-[1.8] font-serif text-xl">"{item.comment}"</p>
              
              <div className="mt-auto flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 border border-brand-sepia translate-x-1 translate-y-1"></div>
                  <img src={item.avatar} alt={item.userName} className="relative w-16 h-16 grayscale bg-stone-100 border border-brand-sepia" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black uppercase tracking-[0.3em] text-xs text-brand-stone">{item.userName}</h4>
                  <p className="text-[10px] text-brand-gold uppercase tracking-[0.2em] font-bold">{item.role || 'Guest Collector'}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
