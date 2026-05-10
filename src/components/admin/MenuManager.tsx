import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, Trash2, Edit2, Check, X, Plus, Search, Tag, DollarSign, UtensilsCrossed } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLoading } from '../../context/LoadingContext';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  imageURL: string;
  isAvailable: boolean;
  isSpecial: boolean;
  updatedAt: any;
}

const CATEGORIES = ['Seafood', 'Meat & Poultry', 'Vegetables', 'Desserts', 'Beverages', 'Starters'];

export function MenuManager() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { setIsLoading } = useLoading();

  useEffect(() => {
    const q = query(collection(db, 'menu'), orderBy('category', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'menu'));
    return () => unsubscribe();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800000) {
      alert("Image is too large. Please use a smaller image (< 800kb)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditingItem(prev => ({ ...prev, imageURL: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const saveItem = async () => {
    if (!editingItem?.name || !editingItem?.category || !editingItem?.imageURL) {
      alert("Please fill in Name, Category, and provide an Image.");
      return;
    }

    setIsLoading(true, "Updating Menu");
    try {
      const data = {
        ...editingItem,
        price: Number(editingItem.price) || 399,
        isAvailable: editingItem.isAvailable ?? true,
        isSpecial: editingItem.isSpecial ?? false,
        updatedAt: serverTimestamp()
      };

      if (editingItem.id) {
        const { id, ...saveData } = editingItem;
        await updateDoc(doc(db, 'menu', id as string), {
          ...saveData,
          price: Number(saveData.price) || 399,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'menu'), data);
      }
      setEditingItem(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'menu');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!window.confirm("Permanently remove this dish from the menu?")) return;
    try {
      await deleteDoc(doc(db, 'menu', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `menu/${id}`);
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-stone-50 p-8 border-b border-brand-sepia gap-6">
        <div>
          <h3 className="text-2xl font-serif font-bold text-brand-stone italic flex items-center gap-3">
             <UtensilsCrossed className="text-brand-gold" />
             Buffet Architecture
          </h3>
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-stone-400 mt-1">
            Manage your revolving buffet offerings
          </p>
        </div>
        <div className="flex w-full md:w-auto gap-4">
          <div className="relative flex-grow md:w-64">
             <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
             <input 
               type="text" 
               placeholder="SEARCH DISHES..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-10 pr-4 py-3 bg-white border border-brand-sepia/30 text-[10px] font-black uppercase tracking-widest focus:ring-1 focus:ring-brand-gold outline-none"
             />
          </div>
          <button
            onClick={() => setEditingItem({ category: 'Seafood', isAvailable: true, price: 399 })}
            className="shrink-0 bg-brand-stone text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg"
          >
            <Plus size={14} />
            New Dish
          </button>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        <AnimatePresence>
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "group bg-white border border-brand-sepia p-0 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col",
                !item.isAvailable && "opacity-60"
              )}
            >
              <div className="aspect-square relative overflow-hidden bg-stone-100">
                <img 
                  src={item.imageURL} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                   <span className="bg-brand-stone/90 backdrop-blur-md text-white text-[8px] px-3 py-1 font-black uppercase tracking-widest">
                     {item.category}
                   </span>
                   {item.isSpecial && (
                     <span className="bg-brand-gold text-brand-stone text-[8px] px-3 py-1 font-black uppercase tracking-widest flex items-center gap-1">
                       Heritage Select
                     </span>
                   )}
                </div>
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="text-white text-[10px] font-black uppercase tracking-[0.4em] border border-white/30 px-6 py-2">Offline</span>
                  </div>
                )}
              </div>

              <div className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                   <h4 className="font-serif font-bold text-xl text-brand-stone leading-tight italic">{item.name}</h4>
                   <p className="font-mono text-sm font-black text-brand-gold">₱{item.price}</p>
                </div>
                <p className="text-xs text-stone-500 line-clamp-2 italic mb-6">
                  {item.description || "The story of this dish remains in the kitchen..."}
                </p>

                <div className="mt-auto pt-4 border-t border-brand-sepia flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-2 text-stone-400 hover:text-brand-stone transition-all hover:bg-stone-50"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2 text-stone-400 hover:text-red-500 transition-all hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                     <span className={cn(
                       "w-2 h-2 rounded-full",
                       item.isAvailable ? "bg-green-500 animate-pulse" : "bg-stone-300"
                     )} />
                     <span className="text-[8px] font-black uppercase tracking-widest text-stone-400">
                       {item.isAvailable ? "Serving" : "Unavailable"}
                     </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 bg-stone-900/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-2xl overflow-hidden shadow-2xl border border-brand-sepia rounded-sm"
          >
            <div className="p-6 md:p-8 border-b border-brand-sepia bg-stone-50 flex justify-between items-start">
              <div>
                <h4 className="text-xl md:text-2xl font-serif font-bold text-brand-stone italic">
                  {editingItem.id ? 'Refine Heritage Dish' : 'Compose New Offering'}
                </h4>
                <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-black text-stone-400 mt-1">
                  Detail your buffet selections
                </p>
              </div>
              <button 
                onClick={() => setEditingItem(null)} 
                className="text-stone-400 hover:text-brand-stone transition-colors p-1"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Dish Identity</label>
                  <input
                    type="text"
                    value={editingItem.name || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full bg-stone-50 border border-brand-sepia/30 p-4 text-sm font-medium focus:ring-1 focus:ring-brand-gold outline-none"
                    placeholder="e.g. Garlic Baked Scallops"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Category</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full bg-stone-50 border border-brand-sepia/30 p-4 text-sm font-medium focus:ring-1 focus:ring-brand-gold outline-none appearance-none cursor-pointer"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Price Point (₱)</label>
                    <div className="relative">
                       <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 w-4 h-4" />
                       <input
                        type="number"
                        value={editingItem.price || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                        className="w-full bg-stone-50 border border-brand-sepia/30 p-4 pl-10 text-sm font-medium focus:ring-1 focus:ring-brand-gold outline-none"
                        placeholder="399"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pt-4 md:pt-0">
                     <label className="flex items-center gap-3 cursor-pointer group flex-1 bg-stone-50 p-4 border border-brand-sepia/30">
                        <input 
                          type="checkbox"
                          checked={editingItem.isAvailable}
                          onChange={(e) => setEditingItem({...editingItem, isAvailable: e.target.checked})}
                          className="hidden" 
                        />
                        <div className={cn(
                          "w-5 h-5 border-2 flex items-center justify-center transition-all",
                          editingItem.isAvailable ? "bg-brand-stone border-brand-stone" : "border-stone-300"
                        )}>
                          {editingItem.isAvailable && <Check size={12} className="text-white" />}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-stone opacity-70 group-hover:opacity-100 transition-opacity">Active in Buffet</span>
                     </label>
                     <label className="flex items-center gap-3 cursor-pointer group flex-1 bg-stone-50 p-4 border border-brand-sepia/30">
                        <input 
                          type="checkbox"
                          checked={editingItem.isSpecial}
                          onChange={(e) => setEditingItem({...editingItem, isSpecial: e.target.checked})}
                          className="hidden" 
                        />
                        <div className={cn(
                          "w-5 h-5 border-2 flex items-center justify-center transition-all",
                          editingItem.isSpecial ? "bg-brand-gold border-brand-gold" : "border-stone-300"
                        )}>
                          {editingItem.isSpecial && <Check size={12} className="text-white" />}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-stone opacity-70 group-hover:opacity-100 transition-opacity">Heritage Select</span>
                     </label>
                  </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Culinary Description</label>
                <textarea
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full bg-stone-50 border border-brand-sepia/30 p-4 text-sm font-medium focus:ring-1 focus:ring-brand-gold outline-none min-h-[80px] resize-none"
                  placeholder="The secrets of the recipe..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Dish Visual</label>
                <div className="flex flex-col gap-4">
                  {editingItem.imageURL ? (
                    <div className="relative group aspect-video overflow-hidden border border-brand-sepia">
                      <img src={editingItem.imageURL} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setEditingItem({...editingItem, imageURL: ''})}
                        className="absolute inset-0 bg-brand-stone/60 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="text-white mb-2" size={24} />
                        <span className="text-white text-[10px] font-black uppercase tracking-widest">Remove Asset</span>
                      </button>
                    </div>
                  ) : (
                    <div className="relative aspect-video bg-stone-50 border-2 border-dashed border-brand-sepia/20 flex flex-col items-center justify-center cursor-pointer hover:bg-stone-100 transition-all group">
                       < ImageIcon className="text-brand-gold mb-3 opacity-40 group-hover:opacity-100 transition-opacity" size={40} />
                       <span className="text-[10px] font-black uppercase tracking-widest text-brand-stone">Capture the Flavor</span>
                       <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 border-t border-brand-sepia bg-stone-50 flex flex-col md:flex-row gap-4">
              <button
                onClick={saveItem}
                className="flex-1 bg-brand-stone text-white py-5 text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl"
              >
                Publish to Menu
              </button>
              <button
                onClick={() => setEditingItem(null)}
                className="md:px-12 border border-brand-sepia text-stone-400 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all order-first md:order-last"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
