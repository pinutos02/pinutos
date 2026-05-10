import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  Users, 
  User, 
  Phone, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  MoreVertical,
  Search,
  Filter,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLoading } from '../../context/LoadingContext';

interface Reservation {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'seated' | 'completed';
  createdAt: any;
  occasion?: string;
  notes?: string;
}

export function ReservationManager() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'seated'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { setIsLoading } = useLoading();

  useEffect(() => {
    const q = query(collection(db, 'reservations'), orderBy('date', 'desc'), orderBy('time', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReservations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation)));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'reservations'));
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, newStatus: Reservation['status']) => {
    setIsLoading(true, `Updating to ${newStatus}`);
    try {
      await updateDoc(doc(db, 'reservations', id), { status: newStatus });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `reservations/${id}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReservation = async (id: string) => {
    if (!window.confirm("Permanently delete this reservation record?")) return;
    try {
      await deleteDoc(doc(db, 'reservations', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `reservations/${id}`);
    }
  };

  const filtered = reservations.filter(res => {
    const matchesFilter = filter === 'all' || res.status === filter;
    const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          res.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 border border-brand-sepia gap-6 shadow-sm">
        <div className="flex gap-4 overflow-x-auto w-full md:w-auto scrollbar-hide">
          {['all', 'pending', 'confirmed', 'seated'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={cn(
                "text-[10px] uppercase font-black tracking-widest px-6 py-2 border transition-all",
                filter === f 
                  ? "bg-brand-stone text-white border-brand-stone" 
                  : "bg-white text-stone-400 border-brand-sepia hover:border-brand-stone hover:text-brand-stone"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80 shadow-inner bg-stone-50 overflow-hidden">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
           <input 
             type="text" 
             placeholder="LOCATE RESERVATION..." 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full bg-transparent border-none px-12 py-4 text-[10px] font-black uppercase tracking-widest focus:ring-0 outline-none text-brand-stone"
           />
        </div>
      </div>

      {/* Grid of Reservations */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filtered.map((res) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={res.id}
              className={cn(
                "bg-white border p-0 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden",
                res.status === 'confirmed' ? "border-green-200" : "border-brand-sepia"
              )}
            >
              {/* Status Ribbon */}
              <div className={cn(
                "absolute top-0 right-0 px-4 py-1 text-[8px] font-black uppercase tracking-widest text-white z-10",
                res.status === 'confirmed' ? "bg-green-600" : 
                res.status === 'pending' ? "bg-amber-500" : 
                res.status === 'cancelled' ? "bg-red-500" : 
                "bg-stone-500"
              )}>
                {res.status}
              </div>

              <div className="p-8 space-y-6">
                <div>
                   <h4 className="font-serif text-2xl font-bold text-brand-stone italic leading-none mb-2">{res.name}</h4>
                   <div className="flex gap-4 text-stone-400">
                      <div className="flex items-center gap-1">
                         <Mail size={12} />
                         <span className="text-[10px] lowercase font-medium">{res.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                         <Phone size={12} />
                         <span className="text-[10px] font-medium">{res.phone}</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-y border-brand-sepia/20 py-4 bg-stone-50/50 px-4 -mx-8">
                   <div className="flex flex-col items-center gap-1 border-r border-brand-sepia/20">
                      <Calendar size={14} className="text-brand-gold" />
                      <span className="text-[10px] font-black text-brand-stone">{res.date}</span>
                   </div>
                   <div className="flex flex-col items-center gap-1 border-r border-brand-sepia/20">
                      <Clock size={14} className="text-brand-gold" />
                      <span className="text-[10px] font-black text-brand-stone">{res.time}</span>
                   </div>
                   <div className="flex flex-col items-center gap-1">
                      <Users size={14} className="text-brand-gold" />
                      <span className="text-[10px] font-black text-brand-stone">{res.guests} PPL</span>
                   </div>
                </div>

                {res.notes && (
                  <div className="bg-amber-50/50 p-4 border-l-2 border-brand-gold italic">
                    <p className="text-xs text-stone-600">"{res.notes}"</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {res.status === 'pending' && (
                    <button 
                      onClick={() => updateStatus(res.id, 'confirmed')}
                      className="flex-1 bg-green-600 text-white py-3 text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={14} />
                      Confirm
                    </button>
                  )}
                  {res.status === 'confirmed' && (
                    <button 
                      onClick={() => updateStatus(res.id, 'seated')}
                      className="flex-1 bg-brand-stone text-white py-3 text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowRight size={14} />
                      Seated
                    </button>
                  )}
                  {['pending', 'confirmed'].includes(res.status) && (
                    <button 
                      onClick={() => updateStatus(res.id, 'cancelled')}
                      className="px-4 border border-red-200 text-red-400 hover:bg-red-50 transition-all flex items-center justify-center"
                    >
                      <XCircle size={18} />
                    </button>
                  )}
                  {res.status === 'seated' && (
                    <button 
                      onClick={() => updateStatus(res.id, 'completed')}
                      className="flex-1 bg-blue-600 text-white py-3 text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
                    >
                      Complete
                    </button>
                  )}
                  <button 
                    onClick={() => deleteReservation(res.id)}
                    className="ml-auto p-3 text-stone-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
         <div className="py-32 text-center bg-white border border-brand-sepia shadow-sm">
            <Calendar className="w-12 h-12 text-stone-100 mx-auto mb-6" />
            <h3 className="font-serif text-2xl font-bold text-brand-stone italic mb-2">No Active Records</h3>
            <p className="text-stone-400 text-[10px] uppercase font-black tracking-widest">Awaiting new heritage bookings.</p>
         </div>
      )}
    </div>
  );
}
