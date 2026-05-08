import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  History, 
  Trash2, 
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Filter
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  lastRestockedAt: string;
}

export function InventoryModule() {
  const { profile } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');

  useEffect(() => {
    if (!profile) return;

    const q = query(collection(db, 'inventory'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem)));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'inventory'));
    
    return () => unsubscribe();
  }, [profile]);

  const categories = ['All', 'Raw Ingredients', 'Meat', 'Seafood', 'Beverages', 'Dry Goods'];

  return (
    <div className="space-y-12">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 border border-brand-sepia shadow-sm">
           <p className="text-[10px] uppercase tracking-[0.3em] font-black text-stone-400 mb-2">Active SKUs</p>
           <p className="text-3xl font-serif font-black italic text-brand-stone">{items.length}</p>
        </div>
        <div className="bg-white p-8 border border-red-100 shadow-sm">
           <p className="text-[10px] uppercase tracking-[0.3em] font-black text-red-400 mb-2">Critical Stock</p>
           <p className="text-3xl font-serif font-black italic text-red-600">
             {items.filter(i => i.quantity <= i.minThreshold).length}
           </p>
        </div>
        <div className="bg-brand-stone p-8 text-white shadow-xl">
           <p className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-gold mb-2">Stock Turnover</p>
           <p className="text-3xl font-serif font-black italic">84%</p>
        </div>
        <div className="bg-white p-8 border border-brand-sepia shadow-sm flex items-center justify-center">
            <button className="flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.3em] text-brand-gold border-b border-brand-gold pb-1">
              <Plus className="w-4 h-4" /> Add Item
            </button>
        </div>
      </div>

      {/* Main Inventory List */}
      <div className="bg-white border border-brand-sepia shadow-sm">
        <div className="p-8 border-b border-brand-sepia flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div className="flex items-center gap-6 overflow-x-auto w-full md:w-auto scrollbar-hide">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={cn(
                    "text-[10px] uppercase font-black tracking-[0.3em] whitespace-nowrap transition-colors",
                    filter === cat ? "text-brand-gold" : "text-stone-400 hover:text-brand-stone"
                  )}
                >
                  {cat}
                </button>
              ))}
           </div>
           <div className="relative w-full md:w-64">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-400" />
              <input 
                type="text" 
                placeholder="SEARCH STOCK..." 
                className="w-full bg-stone-50 border-none px-10 py-3 text-[10px] uppercase font-bold tracking-widest focus:ring-1 focus:ring-brand-gold"
              />
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-stone-50 border-b border-brand-sepia">
                    <th className="px-8 py-4 text-[9px] uppercase font-black tracking-widest text-stone-400">Inventory Item</th>
                    <th className="px-8 py-4 text-[9px] uppercase font-black tracking-widest text-stone-400">Category</th>
                    <th className="px-8 py-4 text-[9px] uppercase font-black tracking-widest text-stone-400">On Hand</th>
                    <th className="px-8 py-4 text-[9px] uppercase font-black tracking-widest text-stone-400">Status</th>
                    <th className="px-8 py-4 text-[9px] uppercase font-black tracking-widest text-stone-400">Last Restock</th>
                    <th className="px-8 py-4"></th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-brand-sepia">
                 {items.filter(i => filter === 'All' || i.category === filter).map((item) => {
                    const isLow = item.quantity <= item.minThreshold;
                    return (
                       <tr key={item.id} className="group hover:bg-warm-cream/30 transition-colors">
                          <td className="px-8 py-6">
                             <p className="font-serif text-lg font-bold italic text-brand-stone">{item.name}</p>
                             <p className="text-[10px] text-stone-400 font-mono">SKU-{item.id.slice(-6).toUpperCase()}</p>
                          </td>
                          <td className="px-8 py-6">
                             <span className="px-3 py-1 bg-brand-sepia/10 text-[9px] uppercase font-black tracking-widest text-stone-500">
                                {item.category}
                             </span>
                          </td>
                          <td className="px-8 py-6">
                             <p className="font-mono text-sm font-bold text-brand-stone">
                                {item.quantity} <span className="text-stone-400 text-[10px] ml-1">{item.unit}</span>
                             </p>
                          </td>
                          <td className="px-8 py-6">
                             {isLow ? (
                                <div className="flex items-center gap-2 text-red-500">
                                   <AlertTriangle className="w-3 h-3" />
                                   <span className="text-[9px] uppercase font-black tracking-widest">Critically Low</span>
                                </div>
                             ) : (
                                <div className="flex items-center gap-2 text-green-600">
                                   <Package className="w-3 h-3 opacity-30" />
                                   <span className="text-[9px] uppercase font-black tracking-widest">Sufficient</span>
                                </div>
                             )}
                          </td>
                          <td className="px-8 py-6 text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                             {item.lastRestockedAt ? new Date(item.lastRestockedAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 border border-brand-sepia text-stone-400 hover:text-brand-gold hover:border-brand-gold transition-all">
                                   <History className="w-3 h-3" />
                                </button>
                                <button className="p-2 border border-brand-sepia text-stone-400 hover:text-brand-stone hover:border-brand-stone transition-all">
                                   <Plus className="w-3 h-3" />
                                </button>
                             </div>
                          </td>
                       </tr>
                    );
                 })}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}
