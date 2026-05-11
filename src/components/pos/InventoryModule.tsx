import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  History, 
  Trash2, 
  ChevronRight,
  Filter,
  X,
  Check,
  Tag,
  Boxes,
  Activity
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { useLoading } from '../../context/LoadingContext';
import { Portal } from '../ui/Portal';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  lastRestockedAt?: string;
  updatedAt?: any;
}

const CATEGORIES = ['Raw Ingredients', 'Meat', 'Seafood', 'Beverages', 'Dry Goods', 'Condiments'];

export function InventoryModule() {
  const { profile } = useAuth();
  const { setIsLoading } = useLoading();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');
  const [editingItem, setEditingItem] = useState<Partial<InventoryItem> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!profile) return;

    const q = query(collection(db, 'inventory'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem)));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'inventory'));
    
    return () => unsubscribe();
  }, [profile]);

  const saveItem = async () => {
    if (!editingItem?.name || !editingItem?.category || editingItem.quantity === undefined) {
      alert("Name, Category, and Initial Quantity are required.");
      return;
    }

    setIsLoading(true, "Updating Inventory");
    try {
      const data = {
        ...editingItem,
        quantity: Number(editingItem.quantity),
        minThreshold: Number(editingItem.minThreshold) || 10,
        updatedAt: serverTimestamp()
      };

      if (editingItem.id) {
        const { id, ...saveData } = editingItem;
        await updateDoc(doc(db, 'inventory', id as string), {
          ...saveData,
          quantity: Number(saveData.quantity),
          minThreshold: Number(saveData.minThreshold) || 10,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'inventory'), {
          ...data,
          lastRestockedAt: new Date().toISOString()
        });
      }
      setEditingItem(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'inventory');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!window.confirm("Remove this item from inventory records?")) return;
    try {
      await deleteDoc(doc(db, 'inventory', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `inventory/${id}`);
    }
  };

  const categories = ['All', ...CATEGORIES];

  const filteredItems = items.filter(i => {
    const matchesCat = filter === 'All' || i.category === filter;
    const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-12">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-stone-900 p-8 border border-stone-800 shadow-xl">
           <p className="text-[10px] uppercase tracking-[0.3em] font-black text-stone-500 mb-2">Active SKUs</p>
           <p className="text-3xl font-serif font-black italic text-white">{items.length}</p>
        </div>
        <div className="bg-stone-900 p-8 border border-red-900/50 shadow-xl">
           <p className="text-[10px] uppercase tracking-[0.3em] font-black text-red-500 mb-2">Critical Stock</p>
           <p className="text-3xl font-serif font-black italic text-red-500">
             {items.filter(i => i.quantity <= i.minThreshold).length}
           </p>
        </div>
        <div className="bg-brand-stone p-8 text-white shadow-2xl relative overflow-hidden group border border-stone-800">
           <Activity className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 group-hover:scale-110 transition-transform" />
           <p className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-gold mb-2">Health Rating</p>
           <p className="text-3xl font-serif font-black italic relative z-10">EXCELLENT</p>
        </div>
        <button 
          onClick={() => setEditingItem({ category: 'Raw Ingredients', quantity: 0, minThreshold: 10, unit: 'kg' })}
          className="bg-stone-900 p-8 border-2 border-stone-800 shadow-xl flex flex-col items-center justify-center hover:border-brand-gold transition-all border-dashed group"
        >
          <Plus className="w-6 h-6 text-brand-gold mb-2 group-hover:scale-125 transition-transform" />
          <span className="text-[10px] uppercase font-black tracking-[0.3em] text-stone-400 group-hover:text-white">Pioneer SKU</span>
        </button>
      </div>

      {/* Main Inventory List */}
      <div className="bg-stone-900 border border-stone-800 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-stone-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-stone-900/50">
           <div className="flex items-center gap-8 overflow-x-auto w-full md:w-auto scrollbar-hide">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={cn(
                    "text-[10px] uppercase font-black tracking-[0.4em] whitespace-nowrap transition-all relative focus:outline-none py-2",
                    filter === cat ? "text-brand-gold" : "text-stone-500 hover:text-white"
                  )}
                >
                  {cat}
                  {filter === cat && <motion.div layoutId="inv-cat" className="absolute -bottom-1 left-0 right-0 h-1 bg-brand-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]" />}
                </button>
              ))}
           </div>
           <div className="relative w-full md:w-80 shadow-2xl bg-stone-950 overflow-hidden border border-stone-800">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold" />
              <input 
                type="text" 
                placeholder="PROCURING SEARCH..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none px-12 py-4 text-[11px] font-black uppercase tracking-widest focus:ring-0 outline-none text-white placeholder:text-stone-700"
              />
           </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-stone-950/50 border-b border-stone-800">
                    <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-stone-500">Inventory Identity</th>
                    <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-stone-500">Category</th>
                    <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-stone-500">Volume</th>
                    <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-stone-500">Standing</th>
                    <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-stone-500">Recency</th>
                    <th className="px-8 py-5"></th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-stone-800 bg-stone-900/30">
                 {filteredItems.map((item) => {
                    const isLow = item.quantity <= item.minThreshold;
                    return (
                       <tr key={item.id} className="group hover:bg-stone-800 transition-colors">
                          <td className="px-8 py-7">
                             <p className="font-serif text-xl font-bold italic text-white group-hover:text-brand-gold transition-colors">{item.name}</p>
                             <p className="text-[10px] text-stone-600 font-mono font-bold mt-1">UUID: {item.id.slice(-6).toUpperCase()}</p>
                          </td>
                          <td className="px-8 py-7">
                             <span className="px-4 py-1.5 bg-stone-800 text-[9px] uppercase font-black tracking-widest text-white border border-stone-700 shadow-inner">
                                {item.category}
                             </span>
                          </td>
                          <td className="px-8 py-7">
                             <p className="font-mono text-base font-black text-brand-gold">
                                {item.quantity} <span className="text-stone-500 text-[10px] ml-1 uppercase">{item.unit}</span>
                             </p>
                          </td>
                          <td className="px-8 py-7">
                             {isLow ? (
                                <div className="flex items-center gap-2 text-red-500 bg-red-950/30 px-4 py-2 w-fit border border-red-900/30">
                                   <AlertTriangle className="w-3 h-3" />
                                   <span className="text-[9px] font-black uppercase tracking-widest animate-pulse">Low Stock</span>
                                </div>
                             ) : (
                                <div className="flex items-center gap-2 text-green-500 bg-green-950/30 px-4 py-2 w-fit border border-green-900/30">
                                   <Package className="w-3 h-3 opacity-50" />
                                   <span className="text-[9px] font-black uppercase tracking-widest">Optimal</span>
                                </div>
                             )}
                          </td>
                          <td className="px-8 py-7 text-[10px] text-stone-400 font-black uppercase tracking-widest">
                             {item.lastRestockedAt ? new Date(item.lastRestockedAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-8 py-7 text-right">
                             <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setEditingItem(item)}
                                  className="w-12 h-12 border border-stone-700 text-stone-400 hover:text-brand-gold hover:border-brand-gold hover:bg-stone-900 flex items-center justify-center transition-all bg-stone-950 shadow-xl"
                                >
                                   <History className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => deleteItem(item.id)}
                                  className="w-12 h-12 border border-stone-700 text-stone-400 hover:text-red-500 hover:border-red-500 hover:bg-red-950/30 flex items-center justify-center transition-all bg-stone-950 shadow-xl"
                                >
                                   <Trash2 className="w-4 h-4" />
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


      {editingItem && (
        <Portal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-stone-900/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white w-full max-w-xl overflow-hidden shadow-2xl border border-brand-sepia rounded-sm flex flex-col max-h-[90vh]"
            >
              <div className="p-6 md:p-8 border-b border-brand-sepia bg-stone-50 flex justify-between items-start shrink-0">
                <div>
                  <h4 className="text-xl md:text-2xl font-serif font-bold text-brand-stone italic uppercase tracking-tighter">
                    {editingItem.id ? 'Audit SKU' : 'New Inventory Record'}
                  </h4>
                  <p className="text-[9px] uppercase tracking-[0.3em] font-black text-stone-600 mt-1">
                    Master stock control protocol
                  </p>
                </div>
                <button 
                  onClick={() => setEditingItem(null)} 
                  className="text-stone-600 hover:text-brand-stone transition-all p-1 border border-transparent hover:border-brand-sepia rounded-full"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-8 overflow-y-auto custom-scrollbar flex-grow">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-700 ml-1">Asset Nomenclature</label>
                  <input
                    type="text"
                    value={editingItem.name || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full bg-stone-50 border border-brand-sepia/30 p-4 text-sm font-medium focus:ring-1 focus:ring-brand-gold outline-none rounded-none"
                    placeholder="e.g. Premium Angus Beef"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-700 ml-1">Sector</label>
                    <div className="relative">
                      <select
                        value={editingItem.category}
                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                        className="w-full bg-stone-50 border border-brand-sepia/30 p-4 text-sm font-medium focus:ring-1 focus:ring-brand-gold outline-none appearance-none cursor-pointer rounded-none pr-10"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-300">
                        <ChevronRight className="rotate-90" size={14} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-700 ml-1">Metric Unit</label>
                    <input
                      type="text"
                      value={editingItem.unit || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                      className="w-full bg-stone-50 border border-brand-sepia/30 p-4 text-sm font-medium focus:ring-1 focus:ring-brand-gold outline-none rounded-none"
                      placeholder="kg, liters, boxes"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-stone-700 ml-1">Current Volume</label>
                      <div className="relative">
                         <Boxes className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 w-4 h-4" />
                         <input
                          type="number"
                          value={editingItem.quantity ?? ''}
                          onChange={(e) => setEditingItem({ ...editingItem, quantity: Number(e.target.value) })}
                          className="w-full bg-stone-50 border border-brand-sepia/30 p-4 pl-10 text-sm font-medium focus:ring-1 focus:ring-brand-gold outline-none rounded-none"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-stone-700 ml-1">Critical Threshold</label>
                      <div className="relative">
                         <AlertTriangle className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 w-4 h-4" />
                         <input
                          type="number"
                          value={editingItem.minThreshold ?? ''}
                          onChange={(e) => setEditingItem({ ...editingItem, minThreshold: Number(e.target.value) })}
                          className="w-full bg-stone-50 border border-brand-sepia/30 p-4 pl-10 text-sm font-medium focus:ring-1 focus:ring-brand-gold outline-none rounded-none"
                          placeholder="10"
                        />
                      </div>
                    </div>
                </div>
              </div>

              <div className="p-6 md:p-8 border-t border-brand-sepia bg-stone-50 flex flex-col md:flex-row gap-4 shrink-0">
                <button
                  onClick={saveItem}
                  className="flex-1 bg-brand-stone text-white py-5 text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl font-bold"
                >
                  Commit to Ledger
                </button>
                <button
                  onClick={() => setEditingItem(null)}
                  className="md:px-12 border border-brand-sepia text-stone-500 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all order-first md:order-last font-bold"
                >
                  Abort
                </button>
              </div>
            </motion.div>
          </div>
        </Portal>
      )}
    </div>
  );
}
