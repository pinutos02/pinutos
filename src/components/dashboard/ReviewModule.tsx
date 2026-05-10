import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquare, Send, Trash2, Edit2, X, Plus, Sparkles, MessageCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  suggestions?: string;
  isModerated: boolean;
  role: string;
  createdAt: any;
}

export function ReviewModule() {
  const { profile } = useAuth();
  const { setIsLoading } = useLoading();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    suggestions: '',
  });

  useEffect(() => {
    if (!profile?.uid) return;

    const q = query(
      collection(db, 'reviews'),
      where('userId', '==', profile.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'reviews'));

    return () => unsubscribe();
  }, [profile?.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid) return;

    setIsLoading(true, editingId ? "Updating Review" : "Submitting Review");
    try {
      const data = {
        userId: profile.uid,
        userName: profile.displayName || 'Guest',
        role: profile.role === 'customer' ? 'Heritage Guest' : 'Heritage Partner',
        rating: formData.rating,
        comment: formData.comment,
        suggestions: formData.suggestions,
        isModerated: false,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, 'reviews', editingId), data);
      } else {
        await addDoc(collection(db, 'reviews'), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }

      setFormData({ rating: 5, comment: '', suggestions: '' });
      setIsAdding(false);
      setEditingId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReview = async (id: string) => {
    if (!window.confirm("Remove this review?")) return;
    try {
      await deleteDoc(doc(db, 'reviews', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `reviews/${id}`);
    }
  };

  const startEdit = (review: Review) => {
    setFormData({
      rating: review.rating,
      comment: review.comment,
      suggestions: review.suggestions || '',
    });
    setEditingId(review.id);
    setIsAdding(true);
  };

  return (
    <div className="space-y-6 md:space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 md:p-8 border border-brand-sepia shadow-sm gap-6">
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-gold mb-1">Feedback Protocol</h3>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-brand-stone italic leading-none">Guest Voices & Testimonies</h2>
          <p className="text-stone-500 text-[10px] uppercase font-black tracking-widest mt-3 flex items-center gap-2">
             <Sparkles className="w-3 h-3 text-brand-gold" />
             Share your heritage experience
          </p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full sm:w-auto px-8 py-3 bg-brand-stone text-white text-[10px] uppercase font-black tracking-[0.3em] hover:bg-black transition-all shadow-xl flex items-center justify-center gap-2"
          >
            <Plus size={14} />
            Write Review
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            className="bg-white border-2 border-brand-gold shadow-2xl p-6 md:p-10 space-y-8 md:space-y-10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 -rotate-45 translate-x-16 -translate-y-16" />
            
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-1">
                <h4 className="font-serif text-xl md:text-2xl font-bold text-brand-stone italic">{editingId ? 'Refine your Statement' : 'Pen your Heritage Story'}</h4>
                <p className="text-[10px] uppercase tracking-widest text-stone-400 font-black">Testimony Submission Channel</p>
              </div>
              <button 
                onClick={() => { setIsAdding(false); setEditingId(null); }}
                className="p-2 text-stone-300 hover:text-stone-600 transition-colors border border-stone-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-stone">Experience Rating</label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: lvl })}
                        className={cn(
                          "w-10 h-10 md:w-12 md:h-12 border-2 flex items-center justify-center transition-all",
                          formData.rating >= lvl 
                            ? "bg-brand-gold border-brand-gold text-white shadow-lg" 
                            : "bg-white border-brand-sepia text-stone-300 hover:border-brand-stone hover:text-brand-stone"
                        )}
                      >
                        <Star className={cn("w-4 h-4 md:w-5 md:h-5", formData.rating >= lvl && "fill-current")} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-stone">Display Identity</label>
                  <div className="bg-stone-50 border border-brand-sepia p-4 flex items-center gap-4">
                     <img src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.displayName}`} className="w-8 h-8 md:w-10 md:h-10 grayscale border border-brand-sepia" alt="AV" />
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-stone leading-none">{profile?.displayName}</p>
                        <p className="text-[8px] text-stone-400 uppercase tracking-widest font-bold mt-1">Verified Guest</p>
                     </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-stone">Your Statement (Feedback)</label>
                <textarea
                  required
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Share the flavors of your experience..."
                  className="w-full bg-stone-50 border border-brand-sepia p-4 md:p-6 font-serif italic text-base md:text-lg leading-relaxed focus:ring-1 focus:ring-brand-gold outline-none min-h-[140px] md:min-h-[160px] resize-none"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-stone">Suggestions (For Management)</label>
                <textarea
                  value={formData.suggestions}
                  onChange={(e) => setFormData({ ...formData, suggestions: e.target.value })}
                  placeholder="What could be elevated..."
                  className="w-full bg-stone-50 border border-brand-sepia p-4 md:p-6 text-xs md:text-sm font-medium leading-relaxed focus:ring-1 focus:ring-brand-gold outline-none min-h-[80px] md:min-h-[100px] resize-none"
                />
              </div>

              <div className="pt-4 md:pt-6">
                <button
                  type="submit"
                  className="w-full md:w-auto px-10 md:px-16 py-4 md:py-5 bg-brand-stone text-white text-[10px] uppercase font-black tracking-[0.4em] hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-3"
                >
                  <Send className="w-4 h-4" />
                  {editingId ? 'Update Testimony' : 'Broadcast Testimony'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {reviews.length === 0 ? (
          <div className="md:col-span-2 py-16 md:py-24 text-center bg-white border border-brand-sepia border-dashed">
             <MessageCircle className="w-10 h-10 md:w-12 md:h-12 text-stone-100 mx-auto mb-6" />
             <h4 className="font-serif text-lg md:text-xl font-bold text-stone-400 italic">No Testimonies Provided Yet</h4>
             <p className="text-stone-300 text-[10px] uppercase font-black tracking-widest mt-2 px-6 md:px-12">Your voice matters to the legacy of our heritage buffet.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <motion.div
              layout
              key={review.id}
              className="bg-white border border-brand-sepia p-6 md:p-8 shadow-sm group hover:shadow-xl transition-all flex flex-col relative"
            >
              <div className="flex justify-between items-start mb-4 md:mb-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={cn("w-3 h-3", i < review.rating ? "text-brand-gold fill-brand-gold" : "text-stone-100")} 
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                   <div className={cn(
                     "w-1.5 h-1.5 rounded-full",
                     review.isModerated ? "bg-green-500" : "bg-brand-gold animate-pulse"
                   )} />
                   <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-stone-400">
                     {review.isModerated ? "Verified" : "Pending"}
                   </span>
                </div>
              </div>

              <div className="flex-grow">
                 <p className="font-serif text-lg md:text-xl text-brand-stone italic leading-relaxed mb-4 md:mb-6">
                   "{review.comment}"
                 </p>
                 {review.suggestions && (
                    <div className="bg-stone-50 p-4 border border-brand-sepia border-dashed mb-6">
                       <p className="text-[9px] md:text-[10px] uppercase font-black text-stone-400 tracking-widest mb-1 mt-0">Personal Improvement:</p>
                       <p className="text-[11px] md:text-xs text-stone-500 italic leading-relaxed">{review.suggestions}</p>
                    </div>
                 )}
              </div>

              <div className="mt-auto pt-4 md:pt-6 border-t border-brand-sepia flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-brand-stone">{review.userName}</p>
                   <p className="text-[8px] font-bold uppercase tracking-widest text-brand-gold italic">{review.role}</p>
                </div>
                
                <div className="flex gap-1 md:gap-2">
                   <button 
                     onClick={() => startEdit(review)}
                     className="p-2 text-stone-400 hover:text-brand-stone transition-all border border-transparent hover:border-brand-sepia"
                   >
                     <Edit2 size={13} />
                   </button>
                   <button 
                     onClick={() => deleteReview(review.id)}
                     className="p-2 text-stone-400 hover:text-red-500 transition-all border border-transparent hover:border-red-100 hover:bg-red-50"
                   >
                     <Trash2 size={13} />
                   </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
