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
        <div className="bg-brand-stone p-8 text-white shadow-xl relative overflow-hidden group border border-brand-sepia">
           <Activity className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 group-hover:scale-110 transition-transform" />
           <p className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-gold mb-2">Health Rating</p>
           <p className="text-3xl font-serif font-black italic relative z-10">EXCELLENT</p>
        </div>
        <button 
          onClick={() => setEditingItem({ category: 'Raw Ingredients', quantity: 0, minThreshold: 10, unit: 'kg' })}
          className="bg-white p-8 border border-brand-sepia shadow-sm flex flex-col items-center justify-center hover:bg-stone-50 transition-all border-dashed"
        >
          <Plus className="w-6 h-6 text-brand-gold mb-2" />
          <span className="text-[10px] uppercase font-black tracking-[0.3em] text-brand-stone">Pioneer SKU</span>
        </button>
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
                    "text-[10px] uppercase font-black tracking-[0.3em] whitespace-nowrap transition-colors relative focus:outline-none",
                    filter === cat ? "text-brand-gold" : "text-stone-400 hover:text-brand-stone"
                  )}
                >
                  {cat}
                  {filter === cat && <motion.div layoutId="inv-cat" className="absolute -bottom-2 left-0 right-0 h-0.5 bg-brand-gold" />}
                </button>
              ))}
           </div>
           <div className="relative w-full md:w-64 shadow-inner bg-stone-50 overflow-hidden">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
              <input 
                type="text" 
                placeholder="STOCK SEARCH..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none px-12 py-3 text-[10px] font-black uppercase tracking-widest focus:ring-0 outline-none text-brand-stone"
              />
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-stone-50 border-b border-brand-sepia">
                    <th className="px-8 py-4 text-[9px] uppercase font-black tracking-widest text-stone-400">Inventory Identity</th>
                    <th className="px-8 py-4 text-[9px] uppercase font-black tracking-widest text-stone-400">Category</th>
                    <th className="px-8 py-4 text-[9px] uppercase font-black tracking-widest text-stone-400">Volume</th>
                    <th className="px-8 py-4 text-[9px] uppercase font-black tracking-widest text-stone-400">Standing</th>
                    <th className="px-8 py-4 text-[9px] uppercase font-black tracking-widest text-stone-400">Recency</th>
                    <th className="px-8 py-4"></th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-brand-sepia">
                 {filteredItems.map((item) => {
                    const isLow = item.quantity <= item.minThreshold;
                    return (
                       <tr key={item.id} className="group hover:bg-warm-cream/30 transition-colors">
                          <td className="px-8 py-6">
                             <p className="font-serif text-lg font-bold italic text-brand-stone">{item.name}</p>
                             <p className="text-[10px] text-stone-400 font-mono text-xs italic">UUID: {item.id.slice(-6).toUpperCase()}</p>
                          </td>
                          <td className="px-8 py-6">
                             <span className="px-3 py-1 bg-brand-stone/5 text-[9px] uppercase font-black tracking-widest text-stone-500 border border-brand-sepia/20">
                                {item.category}
                             </span>
                          </td>
                          <td className="px-8 py-6">
                             <p className="font-mono text-sm font-black text-brand-stone">
                                {item.quantity} <span className="text-stone-400 text-[10px] ml-1">{item.unit}</span>
                             </p>
                          </td>
                          <td className="px-8 py-6">
                             {isLow ? (
                                <div className="flex items-center gap-2 text-red-500 bg-red-50 px-3 py-1 w-fit border border-red-100">
                                   <AlertTriangle className="w-3 h-3" />
                                   <span className="text-[9px] font-black uppercase tracking-widest">Low Stock</span>
                                </div>
                             ) : (
                                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 w-fit border border-green-100">
                                   <Package className="w-3 h-3 opacity-30" />
                                   <span className="text-[9px] font-black uppercase tracking-widest">Optimal</span>
                                </div>
                             )}
                          </td>
                          <td className="px-8 py-6 text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                             {item.lastRestockedAt ? new Date(item.lastRestockedAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setEditingItem(item)}
                                  className="w-10 h-10 border border-brand-sepia text-stone-400 hover:text-brand-stone hover:bg-white flex items-center justify-center transition-all"
                                >
                                   <History className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => deleteItem(item.id)}
                                  className="w-10 h-10 border border-brand-sepia text-stone-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all"
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
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6 bg-stone-900/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-xl overflow-hidden shadow-2xl border border-brand-sepia rounded-sm"
          >
            <div className="p-6 md:p-8 border-b border-brand-sepia bg-stone-50 flex justify-between items-start">
              <div>
                <h4 className="text-xl md:text-2xl font-serif font-bold text-brand-stone italic uppercase tracking-tighter">
                  {editingItem.id ? 'Audit SKU' : 'New Inventory Record'}
                </h4>
                <p className="text-[9px] uppercase tracking-[0.3em] font-black text-stone-400 mt-1">
                  Master stock control protocol
                </p>
              </div>
              <button 
                onClick={() => setEditingItem(null)} 
                className="text-stone-400 hover:text-brand-stone transition-colors p-1 border border-transparent hover:border-brand-sepia"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Asset Nomenclature</label>
                <input
                  type="text"
                  value={editingItem.name || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full bg-stone-50 border border-brand-sepia/30 p-4 text-sm font-medium focus:ring-1 focus:ring-brand-gold outline-none"
                  placeholder="e.g. Premium Angus Beef"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Sector</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full bg-stone-50 border border-brand-sepia/30 p-4 text-sm font-medium focus:ring-1 focus:ring-brand-gold outline-none appearance-none cursor-pointer"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Metric Unit</label>
                  <input
                    type="text"
                    value={editingItem.unit || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                    className="w-full bg-stone-50 border border-brand-sepia/30 p-4 text-sm font-medium focus:ring-1 focus:ring-brand-gold outline-none"
                    placeholder="kg, liters, boxes"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Current Volume</label>
                    <div className="relative">
                       <Boxes className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 w-4 h-4" />
                       <input
                        type="number"
                        value={editingItem.quantity ?? ''}
                        onChange={(e) => setEditingItem({ ...editingItem, quantity: Number(e.target.value) })}
                        className="w-full bg-stone-50 border border-brand-sepia/30 p-4 pl-10 text-sm font-medium focus:ring-1 focus:ring-brand-gold outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Critical Threshold</label>
                    <div className="relative">
                       <AlertTriangle className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 w-4 h-4" />
                       <input
                        type="number"
                        value={editingItem.minThreshold ?? ''}
                        onChange={(e) => setEditingItem({ ...editingItem, minThreshold: Number(e.target.value) })}
                        className="w-full bg-stone-50 border border-brand-sepia/30 p-4 pl-10 text-sm font-medium focus:ring-1 focus:ring-brand-gold outline-none"
                        placeholder="10"
                      />
                    </div>
                  </div>
              </div>
            </div>

            <div className="p-6 md:p-8 border-t border-brand-sepia bg-stone-50 flex flex-col md:flex-row gap-4">
              <button
                onClick={saveItem}
                className="flex-1 bg-brand-stone text-white py-5 text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl font-bold"
              >
                Commit to Ledger
              </button>
              <button
                onClick={() => setEditingItem(null)}
                className="md:px-12 border border-brand-sepia text-stone-400 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all order-first md:order-last"
              >
                Abort
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
