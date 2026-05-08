import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Fish, Flame, Coffee, Cake, Utensils } from 'lucide-react';
import { cn } from '../lib/utils';

const categories = [
  { id: 'all', label: 'All Dishes', icon: Utensils },
  { id: 'seafood', label: 'Seafood', icon: Fish },
  { id: 'meat', label: 'Meat & Poultry', icon: Flame },
  { id: 'veggies', label: 'Vegetables', icon: Coffee },
  { id: 'desserts', label: 'Desserts', icon: Cake },
];

const menuItems = [
  { id: 1, name: 'Crabs in Garlic Sauce', category: 'seafood', price: 399, rating: 4.8, image: 'https://images.unsplash.com/photo-1559740064-0235612129be' },
  { id: 2, name: 'Roasted Whole Lechon', category: 'meat', price: 399, rating: 4.9, image: 'https://images.unsplash.com/photo-1544025162-d76694265947' },
  { id: 3, name: 'Steamed Prawns', category: 'seafood', price: 399, rating: 4.7, image: 'https://images.unsplash.com/photo-1625944525533-473f91391577' },
  { id: 4, name: 'Kare-KareNG Baka', category: 'meat', price: 399, rating: 4.6, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f' },
  { id: 5, name: 'Fresh Lumpia', category: 'veggies', price: 399, rating: 4.5, image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d' },
  { id: 6, name: 'Leche Flan', category: 'desserts', price: 399, rating: 4.9, image: 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c' },
  { id: 7, name: 'Humba Special', category: 'meat', price: 399, rating: 4.7, image: 'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c' },
  { id: 8, name: 'Adobong Pusit', category: 'seafood', price: 399, rating: 4.5, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d' },
];

export function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-32 pb-24 px-6 min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 text-center">
          <h1 className="font-serif text-6xl font-bold text-orange-950 mb-6 italic">Our Buffet Menu</h1>
          <p className="text-neutral-500 max-w-2xl mx-auto leading-relaxed">
            Every day is a new celebration. We rotate our menu to ensure you always find something fresh and exciting to enjoy.
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-8 items-center justify-between mb-12">
          <div className="flex overflow-x-auto pb-4 md:pb-0 gap-4 w-full md:w-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap",
                  activeCategory === cat.id 
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-200" 
                    : "bg-white text-neutral-600 hover:bg-orange-50 border border-neutral-200"
                )}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredItems.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -8 }}
              key={item.id}
              className="bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-neutral-100 group"
            >
              <div className="aspect-square overflow-hidden relative">
                <img 
                  src={`${item.image}?auto=format&fit=crop&q=80&w=600`} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-orange-600">★</span>
                    <span className="text-xs font-bold text-neutral-800">{item.rating}</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-orange-600 px-2 py-0.5 bg-orange-50 rounded-md">
                    {item.category}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-neutral-900 group-hover:text-orange-600 transition-colors uppercase tracking-tight">
                  {item.name}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
