import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  Timestamp 
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Save, 
  Image as ImageIcon,
  Check,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Portal } from '../ui/Portal';

interface Promotion {
  id: string;
  title: string;
  description: string;
  imageURL: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

export function PromotionManager() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPromo, setEditingPromo] = useState<Partial<Promotion> | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'promotions'), (snapshot) => {
      setPromotions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Promotion)));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'promotions'));

    return () => unsubscribe();
  }, []);

  const savePromo = async () => {
    if (!editingPromo?.title || !editingPromo?.imageURL) return;

    try {
      if (editingPromo.id) {
        const { id, ...data } = editingPromo;
        await updateDoc(doc(db, 'promotions', id), {
          ...data,
          updatedAt: Timestamp.now()
        });
      } else {
        await addDoc(collection(db, 'promotions'), {
          ...editingPromo,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }
      setEditingPromo(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'promotions');
    }
  };

  const deletePromo = async (id: string) => {
    if (!confirm('Abandon this promotion record?')) return;
    try {
      await deleteDoc(doc(db, 'promotions', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `promotions/${id}`);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end border-b border-brand-sepia pb-8">
        <div>
          <h2 className="text-4xl font-serif font-bold text-brand-stone italic tracking-tight">Promotional Campaigns</h2>
          <p className="text-[10px] uppercase font-black tracking-[0.3em] text-stone-600 mt-2">Manage seasonal offers and marketing banners</p>
        </div>
        <button 
          onClick={() => setEditingPromo({ title: '', description: '', imageURL: '', isActive: true })}
          className="bg-brand-stone text-white px-8 py-4 text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center gap-3"
        >
          <Plus size={16} />
          Create Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {promotions.map((promo) => (
          <motion.div 
            key={promo.id}
            layout
            className="group bg-white border border-brand-sepia overflow-hidden shadow-sm flex flex-col"
          >
            <div className="aspect-video relative overflow-hidden bg-stone-100">
              <img 
                src={promo.imageURL} 
                alt={promo.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                referrerPolicy="no-referrer"
              />
              {!promo.isActive && (
                <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white border border-white/20 px-4 py-2">Dormant Campaign</span>
                </div>
              )}
            </div>
            <div className="p-8 flex-grow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-serif text-2xl font-bold text-brand-stone italic">{promo.title}</h3>
                <div className="flex gap-2">
                  <button onClick={() => setEditingPromo(promo)} className="p-2 text-stone-500 hover:text-brand-gold transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => deletePromo(promo.id)} className="p-2 text-stone-500 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
              <p className="text-stone-700 text-sm italic line-clamp-2 mb-6">{promo.description}</p>
              <div className="flex items-center gap-4 border-t border-stone-50 pt-6">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  promo.isActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-stone-300"
                )} />
                <span className="text-[9px] font-black uppercase tracking-widest text-stone-600">
                  {promo.isActive ? 'Active and Visible' : 'Hidden from Guests'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {editingPromo && (
        <Portal>
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-stone-900/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white w-full max-w-xl shadow-2xl border border-brand-sepia p-10 space-y-8"
            >
              <header className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-serif font-bold text-brand-stone italic uppercase tracking-tighter">
                    {editingPromo.id ? 'Modify Campaign' : 'Initiate New Offer'}
                  </h3>
                  <p className="text-[9px] uppercase tracking-widest text-stone-600 font-black mt-1">Design your seasonal showcase</p>
                </div>
                <button onClick={() => setEditingPromo(null)} className="text-stone-300 hover:text-brand-stone transition-colors"><X size={24} /></button>
              </header>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-700">Banner Title</label>
                  <input 
                    type="text" 
                    value={editingPromo.title}
                    onChange={(e) => setEditingPromo({ ...editingPromo, title: e.target.value })}
                    className="w-full bg-stone-50 border border-brand-sepia/30 p-4 text-sm font-medium outline-none focus:ring-1 focus:ring-brand-gold transition-all"
                    placeholder="e.g. Seafood Saturday 20% Off"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-700">Description</label>
                  <textarea 
                    value={editingPromo.description}
                    onChange={(e) => setEditingPromo({ ...editingPromo, description: e.target.value })}
                    className="w-full bg-stone-50 border border-brand-sepia/30 p-4 text-sm font-medium outline-none focus:ring-1 focus:ring-brand-gold transition-all h-24 resize-none"
                    placeholder="Describe the offer details..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-700">Visual URL</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 w-4 h-4" />
                    <input 
                      type="text" 
                      value={editingPromo.imageURL}
                      onChange={(e) => setEditingPromo({ ...editingPromo, imageURL: e.target.value })}
                      className="w-full bg-stone-50 border border-brand-sepia/30 p-4 pl-12 text-sm font-medium outline-none focus:ring-1 focus:ring-brand-gold transition-all"
                      placeholder="https://images.unsplash.com/promo-image"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-stone-50 p-4 border border-brand-sepia/20">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox"
                      checked={editingPromo.isActive}
                      onChange={(e) => setEditingPromo({ ...editingPromo, isActive: e.target.checked })}
                      className="hidden" 
                    />
                    <div className={cn(
                      "w-5 h-5 border-2 flex items-center justify-center transition-all",
                      editingPromo.isActive ? "bg-brand-stone border-brand-stone" : "border-stone-300"
                    )}>
                      {editingPromo.isActive && <Check size={12} className="text-white" />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-stone opacity-70 group-hover:opacity-100">Live for Guests</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={savePromo}
                  className="flex-1 py-5 bg-brand-stone text-white text-[10px] uppercase font-black tracking-widest hover:bg-black transition-all shadow-xl"
                >
                  Confirm Publication
                </button>
                <button 
                  onClick={() => setEditingPromo(null)}
                  className="px-12 py-5 border border-brand-sepia text-stone-600 text-[10px] uppercase font-black tracking-widest hover:bg-stone-50 transition-all font-bold"
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
