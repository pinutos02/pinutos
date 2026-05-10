import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Fish, Flame, Coffee, Cake, Utensils, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { cn } from '../lib/utils';

const categories = [
  { id: 'all', label: 'All Dishes', icon: Utensils },
  { id: 'Seafood', label: 'Seafood', icon: Fish },
  { id: 'Meat & Poultry', label: 'Heritage Meat', icon: Flame },
  { id: 'Vegetables', label: 'Garden Fresh', icon: Coffee },
  { id: 'Desserts', label: 'Sweet Treats', icon: Cake },
  { id: 'Starters', label: 'Appetizers', icon: Utensils },
];

export function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'menu'), 
      where('isAvailable', '==', true),
      orderBy('category', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMenuItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-40 pb-24 px-6 min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 text-center">
          <span className="text-[10px] uppercase font-black tracking-[0.6em] text-brand-gold mb-4 block">The Culinary Heritage</span>
          <h1 className="font-serif text-6xl md:text-8xl font-bold text-brand-stone mb-8 italic leading-none drop-shadow-sm">The Heritage <span className="text-brand-gold italic font-normal">Spread</span></h1>
          <p className="text-stone-500 max-w-2xl mx-auto leading-relaxed text-sm italic">
            Celebrating the soul of Filipino cuisine. Every day is a new feast, featuring seasonal harvests and traditional Villanueva recipes.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 items-center justify-between mb-16 px-4 py-8 bg-white border border-brand-sepia shadow-sm">
          <div className="flex overflow-x-auto pb-4 lg:pb-0 gap-6 w-full lg:w-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex flex-col items-center gap-2 px-2 transition-all whitespace-nowrap group",
                  activeCategory === cat.id ? "text-brand-gold" : "text-stone-300 hover:text-brand-stone"
                )}
              >
                <cat.icon className={cn("w-5 h-5 transition-transform group-hover:-translate-y-1", activeCategory === cat.id ? "scale-110" : "")} />
                <span className="text-[10px] uppercase font-black tracking-widest">{cat.label}</span>
                {activeCategory === cat.id && <motion.div layoutId="cat-indicator" className="w-1 h-1 rounded-full bg-brand-gold mt-1" />}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-96 shadow-inner bg-stone-50 overflow-hidden">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
            <input 
              type="text" 
              placeholder="LOCATE A DISH..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-transparent border-none focus:outline-none text-[10px] font-black uppercase tracking-[0.2em] text-brand-stone"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
             <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
             <p className="text-[10px] uppercase font-black tracking-widest text-stone-400">Loading Heritage Flavors...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={item.id}
                  className="group"
                >
                  <div className="aspect-[3/4] overflow-hidden relative mb-6 border border-brand-sepia p-1 bg-white shadow-sm hover:shadow-2xl transition-all duration-500">
                    <img 
                      src={item.imageURL} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" 
                      referrerPolicy="no-referrer"
                    />
                    {item.isSpecial && (
                      <div className="absolute top-4 left-4 bg-brand-gold text-brand-stone px-4 py-1 flex items-center gap-2 shadow-lg">
                        <span className="text-[8px] font-black uppercase tracking-widest leading-none">Chef's Choice</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 px-2">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-serif text-2xl font-bold text-brand-stone group-hover:text-brand-gold transition-colors italic leading-none">
                        {item.name}
                      </h3>
                      <div className="h-px bg-brand-sepia/30 flex-grow mt-3" />
                      <span className="text-xs font-mono font-bold text-brand-gold px-2">₱{item.price}</span>
                    </div>
                    <p className="text-stone-500 text-xs italic leading-relaxed line-clamp-2 min-h-[2.5rem]">
                      {item.description || "A secret recipe passed down through generations, prepared with local Looc ingredients."}
                    </p>
                    <div className="flex items-center gap-4">
                       <span className="text-[8px] uppercase font-black tracking-widest text-brand-gold bg-brand-gold/5 px-3 py-1">
                         {item.category}
                       </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredItems.length === 0 && (
              <div className="col-span-full py-40 text-center bg-white border border-brand-sepia">
                 <Utensils className="w-12 h-12 text-stone-100 mx-auto mb-6" />
                 <h3 className="font-serif text-2xl font-bold text-brand-stone italic italic mb-2">Heritage Recipe Not Found</h3>
                 <p className="text-stone-400 text-[10px] uppercase font-black tracking-widest">Try another culinary search term.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
