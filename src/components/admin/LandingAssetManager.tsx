import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, setDoc, deleteDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, Video, Calendar, ImagePlus, Trash2, Edit2, Check, X, MoveUp, MoveDown, Globe } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLoading } from '../../context/LoadingContext';

interface LandingAsset {
  id: string;
  title: string;
  subtitle?: string;
  type: 'image' | 'video' | 'event' | 'moment';
  mediaUrl: string;
  thumbnailUrl?: string;
  linkUrl?: string;
  order: number;
  isActive: boolean;
  updatedAt: any;
}

export function LandingAssetManager() {
  const [assets, setAssets] = useState<LandingAsset[]>([]);
  const [editingAsset, setEditingAsset] = useState<Partial<LandingAsset> | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const { setIsLoading } = useLoading();

  useEffect(() => {
    const q = query(collection(db, 'landing_assets'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LandingAsset));
      setAssets(data);
    });
    return () => unsubscribe();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'mediaUrl' | 'thumbnailUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit size to ~500kb for Firestore strings (not ideal for prod, but works for preview)
    if (file.size > 800000) {
      alert("Image is too large. Please use a smaller image (< 800kb)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setEditingAsset(prev => ({ ...prev, [field]: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const saveAsset = async () => {
    if (!editingAsset?.title || !editingAsset?.mediaUrl || !editingAsset?.type) {
      alert("Please fill in all required fields (Title, Type, and Media)");
      return;
    }

    setIsLoading(true, "Saving Content");
    try {
      const data = {
        ...editingAsset,
        isActive: editingAsset.isActive ?? true,
        order: editingAsset.order ?? assets.length,
        updatedAt: serverTimestamp()
      };

      if (editingAsset.id) {
        const { id, ...saveData } = editingAsset;
        await updateDoc(doc(db, 'landing_assets', id as string), {
          ...saveData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'landing_assets'), data);
      }
      setEditingAsset(null);
      setIsAdding(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'landing_assets');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAsset = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this content?")) return;
    try {
      await deleteDoc(doc(db, 'landing_assets', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `landing_assets/${id}`);
    }
  };

  const toggleActive = async (asset: LandingAsset) => {
    try {
      await updateDoc(doc(db, 'landing_assets', asset.id), {
        isActive: !asset.isActive
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `landing_assets/${asset.id}`);
    }
  };

  const moveAsset = async (asset: LandingAsset, direction: number) => {
    const currentIndex = assets.findIndex(a => a.id === asset.id);
    const targetIndex = currentIndex + direction;

    if (targetIndex < 0 || targetIndex >= assets.length) return;

    const targetAsset = assets[targetIndex];

    try {
      await updateDoc(doc(db, 'landing_assets', asset.id), { order: targetIndex });
      await updateDoc(doc(db, 'landing_assets', targetAsset.id), { order: currentIndex });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'landing_assets/reorder');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-stone-50 p-8 border-b border-brand-sepia">
        <div>
          <h3 className="text-2xl font-serif font-bold text-brand-stone italic">Display Management</h3>
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-stone-400 mt-1">
            Manage advertisements, events, and moments
          </p>
        </div>
        <button
          onClick={() => {
            setEditingAsset({ type: 'image', isActive: true, order: assets.length });
            setIsAdding(true);
          }}
          className="bg-brand-stone text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2"
        >
          <ImagePlus size={14} />
          Add Content
        </button>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {assets.map((asset) => (
            <motion.div
              key={asset.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "group relative bg-white border border-brand-sepia p-4 shadow-sm hover:shadow-xl transition-all",
                !asset.isActive && "opacity-60 grayscale"
              )}
            >
              <div className="aspect-video relative overflow-hidden bg-stone-100 border border-brand-sepia/20 mb-4">
                {asset.type === 'video' ? (
                  <div className="flex items-center justify-center h-full text-stone-400">
                    <Video size={48} className="opacity-20" />
                    <span className="absolute inset-0 flex items-center justify-center flex-col gap-2">
                       <Globe size={24} className="text-brand-gold animate-pulse" />
                       <span className="text-[8px] uppercase font-black tracking-widest">External Video</span>
                    </span>
                  </div>
                ) : (
                  <img src={asset.mediaUrl} alt={asset.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                )}
                
                <div className="absolute top-2 left-2 flex gap-2">
                  <span className="bg-brand-stone/80 backdrop-blur-md text-white text-[8px] px-3 py-1 font-black uppercase tracking-widest rounded-full">
                    {asset.type}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="font-serif font-bold text-lg text-brand-stone">{asset.title}</h4>
                <p className="text-xs text-stone-500 line-clamp-1">{asset.subtitle || "No subtitle"}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-brand-sepia flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingAsset(asset)}
                    className="p-2 text-stone-400 hover:text-brand-stone transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => deleteAsset(asset.id)}
                    className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="flex gap-1 ml-2 border-l border-brand-sepia pl-2">
                    <button
                      onClick={() => moveAsset(asset, -1)}
                      className="p-2 text-stone-400 hover:text-brand-gold transition-colors"
                      title="Move Up"
                    >
                      <MoveUp size={14} />
                    </button>
                    <button
                      onClick={() => moveAsset(asset, 1)}
                      className="p-2 text-stone-400 hover:text-brand-gold transition-colors"
                      title="Move Down"
                    >
                      <MoveDown size={14} />
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={() => toggleActive(asset)}
                  className={cn(
                    "px-4 py-2 text-[8px] font-black uppercase tracking-widest border transition-all",
                    asset.isActive 
                      ? "border-green-500 text-green-600 bg-green-50" 
                      : "border-stone-200 text-stone-400"
                  )}
                >
                  {asset.isActive ? "Active" : "Hidden"}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {editingAsset && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-stone-900/90 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-2xl overflow-hidden shadow-2xl border border-brand-sepia rounded-sm flex flex-col max-h-[90vh]"
          >
            <div className="p-6 md:p-8 border-b border-brand-sepia bg-stone-50 flex justify-between items-start shrink-0">
              <div>
                <h4 className="text-xl md:text-2xl font-serif font-bold text-brand-stone italic uppercase tracking-tighter">
                  {editingAsset.id ? 'Refine Display' : 'New Heritage Asset'}
                </h4>
                <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-black text-stone-400 mt-1">
                  Configure your landing page showcase
                </p>
              </div>
              <button 
                onClick={() => setEditingAsset(null)} 
                className="text-stone-400 hover:text-brand-stone transition-colors p-1 border border-transparent hover:border-brand-sepia rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-8 overflow-y-auto custom-scrollbar flex-grow">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Content Category</label>
                  <div className="relative">
                    <select
                      value={editingAsset.type}
                      onChange={(e) => setEditingAsset({ ...editingAsset, type: e.target.value as any })}
                      className="w-full bg-stone-50 border border-brand-sepia/30 p-4 text-sm font-medium focus:ring-1 focus:ring-brand-gold outline-none appearance-none rounded-none cursor-pointer pr-10"
                    >
                      <option value="image">Heritage Advertisement</option>
                      <option value="video">Cinematic Promotional</option>
                      <option value="event">Upcoming Festivity</option>
                      <option value="moment">Shared Memory (Gallery)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-300">
                      <MoveDown size={12} />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Showcase Title</label>
                  <input
                    type="text"
                    value={editingAsset.title || ''}
                    onChange={(e) => setEditingAsset({ ...editingAsset, title: e.target.value })}
                    className="w-full bg-stone-50 border border-brand-sepia/30 p-4 text-sm font-medium focus:ring-1 focus:ring-brand-gold outline-none rounded-none"
                    placeholder="e.g. Seafood Saturday Special"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">The Story (Subtitle)</label>
                <textarea
                  value={editingAsset.subtitle || ''}
                  onChange={(e) => setEditingAsset({ ...editingAsset, subtitle: e.target.value })}
                  className="w-full bg-stone-50 border border-brand-sepia/30 p-4 text-sm font-medium focus:ring-1 focus:ring-brand-gold outline-none min-h-[120px] rounded-none resize-none leading-relaxed"
                  placeholder="Describe the essence of this feature..."
                />
              </div>

              {editingAsset.type === 'video' ? (
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Video Source (Embed URL)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editingAsset.mediaUrl || ''}
                      onChange={(e) => setEditingAsset({ ...editingAsset, mediaUrl: e.target.value })}
                      className="w-full bg-stone-50 border border-brand-sepia/30 p-4 pl-12 text-sm font-medium focus:ring-1 focus:ring-brand-gold outline-none rounded-none"
                      placeholder="https://youtube.com/embed/..."
                    />
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                  </div>
                  <p className="text-[8px] text-brand-gold uppercase tracking-[0.2em] font-bold ml-1">Pro tip: Use YouTube 'Embed' links for best performance</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Visual Asset</label>
                  <div className="flex flex-col gap-4">
                    {editingAsset.mediaUrl ? (
                      <div className="relative group overflow-hidden border border-brand-sepia aspect-video bg-stone-100 bg-checkered">
                        <img 
                          src={editingAsset.mediaUrl} 
                          alt="Preview" 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <button 
                          onClick={() => setEditingAsset({...editingAsset, mediaUrl: ''})}
                          className="absolute inset-0 bg-brand-stone/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        >
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center">
                              <Trash2 className="text-white" size={20} />
                            </div>
                            <span className="text-white text-[10px] font-black uppercase tracking-widest">Replace Heritage Image</span>
                          </div>
                        </button>
                      </div>
                    ) : (
                      <div className="relative aspect-video bg-stone-50 border-2 border-dashed border-brand-sepia/20 flex flex-col items-center justify-center cursor-pointer hover:bg-stone-100 hover:border-brand-sepia/40 transition-all group overflow-hidden">
                        <div className="flex flex-col items-center gap-5 p-12">
                           <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center border border-brand-sepia/10 group-hover:scale-110 group-hover:border-brand-gold transition-all duration-500">
                              <ImagePlus className="text-brand-gold" size={32} />
                           </div>
                           <div className="text-center space-y-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-brand-stone block">Select Heritage Asset</span>
                              <span className="text-[8px] text-stone-400 uppercase tracking-widest bg-stone-100 px-3 py-1 rounded-full">JPG, PNG up to 800kb</span>
                           </div>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'mediaUrl')}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Action Link (Optional)</label>
                    <input
                      type="text"
                      value={editingAsset.linkUrl || ''}
                      onChange={(e) => setEditingAsset({ ...editingAsset, linkUrl: e.target.value })}
                      className="w-full bg-stone-50 border border-brand-sepia/30 p-4 text-sm font-medium focus:ring-1 focus:ring-brand-gold outline-none rounded-none"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex items-end pb-1">
                     <label className="flex items-center gap-4 cursor-pointer group w-full bg-stone-50/50 p-4 border border-brand-sepia/20 hover:bg-white hover:border-brand-sepia/50 transition-all rounded-sm">
                        <div className="relative">
                          <input 
                            type="checkbox"
                            checked={editingAsset.isActive}
                            onChange={(e) => setEditingAsset({...editingAsset, isActive: e.target.checked})}
                            className="peer hidden" 
                          />
                          <div className={cn(
                            "w-6 h-6 border-2 flex items-center justify-center transition-all peer-checked:bg-brand-stone peer-checked:border-brand-stone border-stone-300"
                          )}>
                            <AnimatePresence>
                              {editingAsset.isActive && (
                                <motion.div
                                  initial={{ scale: 0, rotate: -45 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  exit={{ scale: 0 }}
                                >
                                  <Check size={14} className="text-white" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-brand-stone block">Publicly Visible</span>
                          <span className="text-[8px] text-stone-400 uppercase tracking-widest">Publish to live site</span>
                        </div>
                     </label>
                  </div>
              </div>
            </div>

            <div className="p-6 md:p-8 border-t border-brand-sepia bg-stone-50 flex flex-col md:flex-row gap-4 shrink-0">
              <button
                onClick={saveAsset}
                className="flex-1 bg-brand-stone text-white py-5 text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-[0.98] font-black"
              >
                Commit Showcase Asset
              </button>
              <button
                onClick={() => setEditingAsset(null)}
                className="md:px-12 border border-brand-sepia text-stone-500 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all order-first md:order-last font-bold"
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
