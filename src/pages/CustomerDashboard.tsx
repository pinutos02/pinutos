import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  Users, 
  ChevronRight, 
  LogOut, 
  LayoutDashboard,
  Timer,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import { useSocket } from '../context/SocketContext';
import { cn } from '../lib/utils';

interface Reservation {
  id: string;
  customerName: string;
  email: string;
  phoneNumber: string;
  guestCount: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  specialRequests?: string;
}

export function CustomerDashboard() {
  const { profile, logout } = useAuth();
  const { setIsLoading } = useLoading();
  const { occupancy } = useSocket();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.uid) return;

    const q = query(
      collection(db, 'reservations'),
      where('userId', '==', profile.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReservations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.uid]);

  const cancelReservation = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    setIsLoading(true, "Cancelling Reservation");
    try {
      await updateDoc(doc(db, 'reservations', id), {
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error cancelling reservation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      case 'completed': return 'text-stone-400 bg-stone-50';
      default: return 'text-amber-600 bg-amber-50';
    }
  };

  return (
    <div className="pt-32 pb-24 px-12 min-h-screen bg-warm-cream">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-gold block">Customer Area</span>
            <h1 className="font-serif text-5xl font-bold text-brand-stone italic italic">
              Welcome back, <span className="text-brand-gold">{profile?.displayName?.split(' ')[0]}</span>
            </h1>
            <p className="text-stone-500 text-sm italic">Manage your heritage dining experiences and future bookings.</p>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-8 py-4 bg-white border border-brand-sepia text-[10px] uppercase font-black tracking-[0.3em] text-stone-500 hover:text-brand-gold transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Stats Summary */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-10 border border-brand-sepia shadow-sm space-y-8 animate-in fade-in slide-in-from-left duration-700">
               <h3 className="text-[10px] uppercase tracking-[0.4em] font-black text-stone-400">Activity Summary</h3>
               <div className="space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-brand-sepia">
                     <span className="text-sm font-medium text-stone-600 italic font-serif">Total Bookings</span>
                     <span className="font-serif text-2xl italic text-brand-stone">{reservations.length}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-brand-sepia">
                     <span className="text-sm font-medium text-stone-600 italic font-serif">Confirmed Seats</span>
                     <span className="font-serif text-2xl italic text-green-600">
                       {reservations.filter(r => r.status === 'confirmed').reduce((acc, r) => acc + r.guestCount, 0)}
                     </span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-sm font-medium text-stone-600 italic font-serif">Pending Requests</span>
                     <span className="font-serif text-2xl italic text-amber-600">
                       {reservations.filter(r => r.status === 'pending').length}
                     </span>
                  </div>
               </div>
            </div>

            <div className="bg-brand-stone p-10 text-white space-y-6 shadow-xl">
               <h3 className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-gold">Live Occupancy</h3>
               <div className="space-y-2">
                  <div className="flex justify-between items-end">
                     <span className="text-2xl font-serif italic">{occupancy.count}</span>
                     <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{occupancy.max} Capacity</span>
                  </div>
                  <div className="h-1 bg-stone-800 w-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(occupancy.count / occupancy.max) * 100}%` }}
                        className="h-full bg-brand-gold"
                     />
                  </div>
                  <p className="text-[9px] text-stone-500 uppercase tracking-widest leading-relaxed italic pt-2">
                    {occupancy.count > occupancy.max * 0.8 ? "Heavy traffic: Expect longer wait times." : "Stable flow: Perfect time to visit."}
                  </p>
               </div>
            </div>

            <div className="bg-white p-10 border border-brand-sepia space-y-6 shadow-sm">
               <h3 className="text-[10px] uppercase tracking-[0.4em] font-black text-stone-400">Member Benefits</h3>
               <p className="text-xs text-stone-500 leading-relaxed italic">As a registered guest, your reservation history is preserved for priority seating during peak season and festivals.</p>
               <div className="pt-4">
                  <button className="text-[10px] font-black uppercase tracking-[0.3em] border-b border-brand-sepia pb-1 hover:border-brand-gold transition-all">Loyalty Status</button>
               </div>
            </div>
          </div>

          {/* Reservations List */}
          <div className="lg:col-span-2 space-y-8">
             <div className="flex items-center justify-between">
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-black text-stone-400">Navigation: My Bookings</h3>
                <div className="flex gap-2">
                   {['All', 'Active', 'Past'].map(tab => (
                     <button key={tab} className="px-4 py-1.5 text-[9px] uppercase tracking-widest font-black border border-brand-sepia hover:border-brand-gold transition-colors">{tab}</button>
                   ))}
                </div>
             </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center bg-white border border-brand-sepia">
                <Timer className="w-8 h-8 text-brand-sepia animate-spin" />
              </div>
            ) : reservations.length === 0 ? (
              <div className="bg-white p-20 text-center border border-brand-sepia shadow-sm">
                <Calendar className="w-12 h-12 text-brand-sepia mx-auto mb-6" />
                <h4 className="font-serif text-2xl font-bold text-brand-stone mb-4 italic">No Bookings Yet</h4>
                <p className="text-stone-500 mb-10 text-sm max-w-xs mx-auto italic">Ready to experience our heritage buffet? Your journey begins with a single reservation.</p>
                <button className="px-10 py-4 bg-brand-stone text-white text-[10px] uppercase font-black tracking-[0.3em] hover:bg-black transition-all">Start your first booking</button>
              </div>
            ) : (
              <div className="grid gap-6">
                {reservations.map((res) => (
                  <motion.div 
                    layout
                    key={res.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 border border-brand-sepia shadow-sm flex flex-col md:flex-row gap-8 items-stretch md:items-center group hover:border-brand-gold transition-all duration-500"
                  >
                    <div className="w-16 h-16 flex-shrink-0 border border-brand-sepia flex flex-col items-center justify-center bg-warm-cream">
                       <span className="text-[10px] font-black uppercase text-stone-400 leading-none mb-1">{res.date.split('-')[1]}</span>
                       <span className="font-serif text-2xl font-bold italic leading-none">{res.date.split('-')[2]}</span>
                    </div>

                    <div className="flex-grow space-y-2">
                      <div className="flex items-center gap-3">
                         <span className={cn("px-4 py-1 text-[9px] font-black uppercase tracking-widest", getStatusColor(res.status))}>
                           {res.status}
                         </span>
                         <span className="text-[10px] text-stone-300 font-mono">ID: {res.id.slice(-6)}</span>
                      </div>
                      <h4 className="font-serif text-xl font-bold text-brand-stone italic">{res.customerName} Party</h4>
                      <div className="flex flex-wrap gap-6 mt-4">
                        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-stone-500 tracking-widest">
                          <Users className="w-3 h-3 text-brand-gold" />
                          {res.guestCount} Guests
                        </div>
                        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-stone-500 tracking-widest">
                          <Clock className="w-3 h-3 text-brand-gold" />
                          {res.time}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 justify-center">
                      {(res.status === 'pending' || res.status === 'confirmed') && (
                        <button 
                          onClick={() => cancelReservation(res.id)}
                          className="px-6 py-2 border border-red-100 text-red-500 text-[9px] uppercase font-black tracking-widest hover:bg-red-50 transition-colors"
                        >
                          Request Cancellation
                        </button>
                      )}
                      <button className="px-6 py-2 border border-brand-sepia text-stone-400 text-[9px] uppercase font-black tracking-widest hover:border-brand-gold hover:text-brand-gold transition-colors">
                        View Summary
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
