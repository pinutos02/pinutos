import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  Package, 
  Settings, 
  CheckCircle2, 
  XCircle, 
  Clock,
  MoreVertical,
  Plus,
  Monitor,
  Truck,
  History,
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { cn } from '../lib/utils';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { POSModule } from '../components/pos/POSModule';
import { InventoryModule } from '../components/pos/InventoryModule';

export function AdminDashboard() {
  const { profile } = useAuth();
  const { occupancy } = useSocket();
  const [stats, setStats] = useState({
    users: 0,
    reservations: 0,
    today: 0
  });
  const [recentReservations, setRecentReservations] = useState<any[]>([]);
  const [tab, setTab] = useState<'overview' | 'pos' | 'inventory' | 'reservations' | 'menu'>('overview');

  useEffect(() => {
    if (!profile || (profile.role !== 'admin' && profile.role !== 'staff' && profile.role !== 'super-admin')) {
      return;
    }

    // Stats fetching
    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const resSnap = await getDocs(collection(db, 'reservations'));
        
        const today = new Date().toISOString().split('T')[0];
        const todayRes = resSnap.docs.filter(d => d.data().date === today);

        setStats({
          users: usersSnap.size,
          reservations: resSnap.size,
          today: todayRes.length
        });
      } catch (err) {
        // Only log/handle if it's not a permission error we expect for staff
        if (profile.role === 'admin') {
          handleFirestoreError(err, OperationType.LIST, 'admin_stats_fetch');
        }
      }
    };
    fetchStats();

    // Listen to recent reservations
    const q = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snap) => {
      setRecentReservations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'reservations'));

    return () => unsubscribe();
  }, [profile]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'reservations', id), { 
        status, 
        updatedAt: new Date().toISOString() 
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `reservations/${id}`);
    }
  };

  if (!profile || (profile.role !== 'admin' && profile.role !== 'staff' && profile.role !== 'super-admin')) {
    return (
      <div className="pt-40 text-center">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-neutral-500">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pt-32 px-6 bg-warm-cream flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 hidden lg:flex flex-col gap-2 shrink-0 pr-8 border-r border-brand-sepia h-full pb-12">
        <button 
          onClick={() => setTab('overview')}
          className={cn(
            "flex items-center gap-3 px-6 py-4 font-black text-[10px] uppercase tracking-[0.3em] transition-all",
            tab === 'overview' ? "bg-brand-stone text-white shadow-xl" : "text-stone-500 hover:bg-white hover:border border-brand-sepia"
          )}
        >
          <BarChart3 className="w-5 h-5" />
          Overview
        </button>

        <button 
          onClick={() => setTab('pos')}
          className={cn(
            "flex items-center gap-3 px-6 py-4 font-black text-[10px] uppercase tracking-[0.3em] transition-all",
            tab === 'pos' ? "bg-brand-gold text-white shadow-xl" : "text-stone-500 hover:bg-white hover:border border-brand-sepia"
          )}
        >
          <Monitor className="w-5 h-5" />
          POS Terminal
        </button>

        <button 
          onClick={() => setTab('inventory')}
          className={cn(
            "flex items-center gap-3 px-6 py-4 font-black text-[10px] uppercase tracking-[0.3em] transition-all",
            tab === 'inventory' ? "bg-brand-stone text-white shadow-xl" : "text-stone-500 hover:bg-white hover:border border-brand-sepia"
          )}
        >
          <Package className="w-5 h-5" />
          Inventory
        </button>

        <button 
          onClick={() => setTab('reservations')}
          className={cn(
            "flex items-center gap-3 px-6 py-4 font-black text-[10px] uppercase tracking-[0.3em] transition-all",
            tab === 'reservations' ? "bg-brand-stone text-white shadow-xl" : "text-stone-500 hover:bg-white hover:border border-brand-sepia"
          )}
        >
          <Calendar className="w-5 h-5" />
          Reservations
        </button>

        <button 
          onClick={() => setTab('menu')}
          className={cn(
            "flex items-center gap-3 px-6 py-4 font-black text-[10px] uppercase tracking-[0.3em] transition-all",
            tab === 'menu' ? "bg-brand-stone text-white shadow-xl" : "text-stone-500 hover:bg-white hover:border border-brand-sepia"
          )}
        >
          <TrendingUp className="w-5 h-5" />
          Menu & Prices
        </button>
        
        <div className="mt-auto pt-8 border-t border-brand-sepia">
           <button className="flex items-center gap-3 px-6 py-4 font-black text-[10px] uppercase tracking-[0.3em] text-stone-500 hover:bg-white hover:border border-brand-sepia w-full transition-all">
            <Settings className="w-5 h-5 text-stone-300" />
            System Settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto h-full lg:pl-12 pb-24 pr-2 scrollbar-hide">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold mb-2 block">Administrative Portal</span>
            <h1 className="font-serif text-5xl font-bold text-brand-stone italic leading-none">Management Dashboard</h1>
            <p className="text-stone-500 text-sm mt-3 italic">Welcome back, {profile.displayName.split(' ')[0]}!</p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-8 py-4 bg-white border border-brand-sepia text-[10px] uppercase font-black tracking-widest text-stone-500 hover:shadow-xl transition-all">
               Live Stats
            </button>
            {tab === 'menu' && (
              <button className="flex items-center gap-2 px-8 py-4 bg-brand-stone text-white text-[10px] uppercase font-black tracking-widest shadow-xl hover:bg-black transition-all">
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            )}
          </div>
        </div>

        {tab === 'overview' && (
          <div className="space-y-12">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Customers', value: stats.users, icon: Users, color: 'bg-stone-800 shadow-xl' },
                { label: 'Total Bookings', value: stats.reservations, icon: Calendar, color: 'bg-stone-800 shadow-xl' },
                { label: 'Bookings Today', value: stats.today, icon: Clock, color: 'bg-stone-800 shadow-xl' },
                { label: 'Live Occupancy', value: `${occupancy.count}/${occupancy.max}`, icon: Package, color: 'bg-brand-gold shadow-xl' }
              ].map((s) => (
                <div key={s.label} className="bg-white p-8 border border-brand-sepia shadow-sm">
                  <div className={cn("w-10 h-10 flex items-center justify-center mb-6", s.color)}>
                    <s.icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-stone-400 text-[10px] uppercase tracking-[0.3em] font-black mb-2">{s.label}</p>
                  <p className="text-3xl font-serif font-black text-brand-stone italic">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Recent Table */}
            <div className="bg-white border border-brand-sepia shadow-sm overflow-hidden">
               <div className="px-8 py-6 border-b border-brand-sepia flex items-center justify-between bg-stone-50">
                <h3 className="font-black text-brand-stone uppercase tracking-[0.3em] text-[10px]">Recent Activity: Reservations</h3>
                <button 
                  onClick={() => setTab('reservations')}
                  className="text-brand-gold font-black text-[9px] uppercase tracking-[0.2em] hover:border-b border-brand-gold"
                >
                  View Archive
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 text-[9px] uppercase font-black tracking-widest text-stone-400 border-b border-brand-sepia">
                    <tr>
                      <th className="px-8 py-4">Guest Identity</th>
                      <th className="px-4 py-4">Territory & Time</th>
                      <th className="px-4 py-4">Count</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-8 py-4 text-right">Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-sepia">
                    {recentReservations.map((res) => (
                      <tr key={res.id} className="group hover:bg-warm-cream/30 transition-colors">
                        <td className="px-8 py-6">
                          <p className="font-serif text-lg font-bold italic text-brand-stone">{res.customerName}</p>
                          <p className="text-[10px] text-stone-400 font-mono">UID: {res.id.slice(-6).toUpperCase()}</p>
                        </td>
                        <td className="px-4 py-6">
                          <p className="font-black text-[10px] uppercase tracking-widest text-stone-600">{res.date}</p>
                          <p className="text-[10px] text-stone-400 italic">Expected at {res.time}</p>
                        </td>
                        <td className="px-4 py-6 font-serif text-xl italic text-stone-700">{res.guestCount}</td>
                        <td className="px-4 py-6">
                          <span className={cn(
                            "px-4 py-1 text-[9px] font-black uppercase tracking-[0.2em]",
                            res.status === 'confirmed' ? "bg-green-50 text-green-700" :
                            res.status === 'pending' ? "bg-brand-gold/10 text-brand-gold" :
                            "bg-stone-100 text-stone-400"
                          )}>
                            {res.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                             {res.status === 'pending' && (
                               <>
                                <button 
                                  onClick={() => updateStatus(res.id, 'confirmed')}
                                  className="w-8 h-8 border border-green-200 text-green-600 flex items-center justify-center hover:bg-green-50"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => updateStatus(res.id, 'cancelled')}
                                  className="w-8 h-8 border border-red-200 text-red-600 flex items-center justify-center hover:bg-red-50"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                               </>
                             )}
                             <button className="w-8 h-8 border border-brand-sepia text-stone-300 flex items-center justify-center hover:border-brand-stone hover:text-brand-stone">
                                <MoreVertical className="w-4 h-4" />
                             </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'pos' && <POSModule />}
        {tab === 'inventory' && <InventoryModule />}

        {tab === 'reservations' && (
           <div className="bg-white p-20 border border-brand-sepia text-center shadow-sm">
             <Calendar className="w-12 h-12 text-stone-100 mx-auto mb-6" />
             <h3 className="font-serif text-2xl font-bold italic text-brand-stone mb-2">Reservation Archive</h3>
             <p className="text-stone-400 text-[10px] uppercase font-black tracking-widest">Filter and manage all historical dining records.</p>
           </div>
        )}

        {tab === 'menu' && (
           <div className="bg-white p-20 border border-brand-sepia text-center shadow-sm">
             <TrendingUp className="w-12 h-12 text-stone-100 mx-auto mb-6" />
             <h3 className="font-serif text-2xl font-bold italic text-brand-stone mb-2">Menu Evolution</h3>
             <p className="text-stone-400 text-[10px] uppercase font-black tracking-widest">Architect your buffet offerings and seasonal pricing.</p>
           </div>
        )}
      </main>
    </div>
  );
}
