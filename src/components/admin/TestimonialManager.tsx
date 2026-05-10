import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, Trash2, Edit2, Check, X, Plus, Star, UserCircle, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLoading } from '../../context/LoadingContext';
import { Portal } from '../ui/Portal';

interface Testimonial {
  id: string;
  userName: string;
  role: string;
  comment: string;
  rating: number;
  avatar?: string;
  isModerated: boolean;
  createdAt: any;
}

export function TestimonialManager() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [editingItem, setEditingItem] = useState<Partial<Testimonial> | null>(null);
  const { setIsLoading } = useLoading();

  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'reviews'));
    return () => unsubscribe();
  }, []);

  const saveItem = async () => {
    if (!editingItem?.userName || !editingItem?.comment) {
      alert("Please fill in Name and Comment.");
      return;
    }

    setIsLoading(true, "Updating Testimonial");
    try {
      const data = {
        ...editingItem,
        rating: Number(editingItem.rating) || 5,
        isModerated: editingItem.isModerated ?? true,
        role: editingItem.role || 'Guest',
        createdAt: editingItem.createdAt || serverTimestamp()
      };

      if (editingItem.id) {
        const { id, ...saveData } = editingItem;
        await updateDoc(doc(db, 'reviews', id as string), {
          ...saveData,
          rating: Number(saveData.rating) || 5,
        });
      } else {
        await addDoc(collection(db, 'reviews'), {
          ...data,
          createdAt: serverTimestamp()
        });
      }
      setEditingItem(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!window.confirm("Delete this guest review?")) return;
    try {
      await deleteDoc(doc(db, 'reviews', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `reviews/${id}`);
    }
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-stone-50 p-8 border-b border-brand-sepia gap-6">
        <div>
          <h3 className="text-2xl font-serif font-bold text-brand-stone italic flex items-center gap-3">
             <Quote className="text-brand-gold" />
             Guest Testimonials
          </h3>
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-stone-600 mt-1">
            Curate and manage guest voices on your landing page
          </p>
        </div>
        <button
          onClick={() => setEditingItem({ rating: 5, isModerated: true, role: 'Local Guide' })}
          className="shrink-0 bg-brand-stone text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg"
        >
          <Plus size={14} />
          Add Testimonial
        </button>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "group bg-white border border-brand-sepia p-8 shadow-sm hover:shadow-xl transition-all flex flex-col min-h-[300px]",
                !item.isModerated && "opacity-60 bg-stone-50"
              )}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={cn("w-3 h-3", i < item.rating ? "text-brand-gold fill-brand-gold" : "text-stone-200")} 
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                   <span className={cn(
                     "w-1.5 h-1.5 rounded-full",
                     item.isModerated ? "bg-green-500" : "bg-brand-gold animate-pulse"
                   )} />
                   <span className="text-[7px] font-black uppercase tracking-widest text-stone-600">
                     {item.isModerated ? "Visible" : "Pending"}
                   </span>
                </div>
              </div>

              <div className="flex-grow">
                <MessageSquare className="w-10 h-10 text-brand-gold opacity-10 mb-4" />
                <p className="font-serif text-lg text-brand-stone italic leading-relaxed mb-8">
                  "{item.comment}"
                </p>
              </div>

              <div className="mt-auto pt-6 border-t border-brand-sepia flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-stone-100 border border-brand-sepia p-1">
                    <img 
                      src={item.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.userName}`} 
                      className="w-full h-full object-cover grayscale" 
                      alt="Avatar"
                    />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-stone">{item.userName}</h4>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-brand-gold">{item.role}</p>
                  </div>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="p-2 text-stone-600 hover:text-brand-stone transition-all hover:bg-stone-50 border border-brand-sepia/20"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-2 text-stone-600 hover:text-red-500 transition-all hover:bg-red-50 border border-brand-sepia/20"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
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
                    {editingItem.id ? 'Authenticate Voice' : 'New Guest Voice'}
                  </h4>
                  <p className="text-[9px] uppercase tracking-[0.3em] font-black text-stone-600 mt-1">
                    Testimonial curation protocol
                  </p>
                </div>
                <button 
                  onClick={() => setEditingItem(null)} 
                  className="text-stone-600 hover:text-brand-stone transition-all p-1 border border-transparent hover:border-brand-sepia rounded-full"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-8 overflow-y-auto custom-scrollbar flex-grow text-brand-stone">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-700 ml-1">Guest Identity</label>
                    <input
                      type="text"
                      value={editingItem.userName || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, userName: e.target.value })}
                      className="w-full bg-stone-50 border border-brand-sepia/30 p-4 text-sm font-medium focus:ring-1 focus:ring-brand-gold outline-none rounded-none"
                      placeholder="e.g. Maria Clara"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-700 ml-1">Designation / Role</label>
                    <input
                      type="text"
                      value={editingItem.role || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, role: e.target.value })}
                      className="w-full bg-stone-50 border border-brand-sepia/30 p-4 text-sm font-medium focus:ring-1 focus:ring-brand-gold outline-none rounded-none"
                      placeholder="e.g. Local Foodie"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-700 ml-1">Satisfaction Level (1-5)</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setEditingItem({ ...editingItem, rating: lvl })}
                          className={cn(
                            "w-10 h-10 border flex items-center justify-center transition-all font-black text-xs",
                            editingItem.rating === lvl ? "bg-brand-gold text-white border-brand-gold shadow-lg" : "bg-white text-stone-400 border-brand-sepia hover:border-brand-stone"
                          )}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-3 cursor-pointer group bg-stone-50 p-4 border border-brand-sepia/20 w-fit hover:bg-white transition-all">
                      <input 
                        type="checkbox"
                        checked={editingItem.isModerated}
                        onChange={(e) => setEditingItem({...editingItem, isModerated: e.target.checked})}
                        className="hidden" 
                      />
                      <div className={cn(
                        "w-5 h-5 border-2 flex items-center justify-center transition-all",
                        editingItem.isModerated ? "bg-green-600 border-green-600" : "border-stone-300"
                      )}>
                        {editingItem.isModerated && <Check size={12} className="text-white" />}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-stone opacity-70 group-hover:opacity-100 transition-opacity">Visible to Public</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-700 ml-1">Avatar Proxy URL</label>
                  <div className="flex gap-4 items-center">
                     <div className="w-16 h-16 bg-stone-50 border border-brand-sepia shrink-0 overflow-hidden">
                        <img 
                          src={editingItem.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${editingItem.userName || 'placeholder'}`} 
                          className="w-full h-full object-cover grayscale" 
                          alt="Avatar Preview" 
                        />
                     </div>
                     <input
                      type="text"
                      value={editingItem.avatar || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, avatar: e.target.value })}
                      className="flex-1 bg-stone-50 border border-brand-sepia/30 p-4 text-[11px] font-mono focus:ring-1 focus:ring-brand-gold outline-none rounded-none"
                      placeholder="https://api.dicebear.com/..."
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-700 ml-1">Guest Statement</label>
                  <textarea
                    value={editingItem.comment || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, comment: e.target.value })}
                    className="w-full bg-stone-50 border border-brand-sepia/30 p-4 text-sm font-medium focus:ring-1 focus:ring-brand-gold outline-none min-h-[120px] resize-none leading-relaxed"
                    placeholder="Their story of Heritage..."
                  />
                </div>
              </div>

              <div className="p-6 md:p-8 border-t border-brand-sepia bg-stone-50 flex flex-col md:flex-row gap-4 shrink-0 mt-auto">
                <button
                  onClick={saveItem}
                  className="flex-1 bg-brand-stone text-white py-5 text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl font-bold"
                >
                  Commit Testimony
                </button>
                <button
                  onClick={() => setEditingItem(null)}
                  className="md:px-12 border border-brand-sepia text-stone-600 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all order-first md:order-last font-bold"
                >
                  Discard
                </button>
              </div>
            </motion.div>
          </div>
        </Portal>
      )}
    </div>
  );
}
