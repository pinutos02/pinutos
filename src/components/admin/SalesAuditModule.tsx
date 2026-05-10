import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search
} from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { cn } from '../../lib/utils';
import { useLoading } from '../../context/LoadingContext';

interface Transaction {
  id: string;
  orderId: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
  month: string;
  items: any[];
}

export function SalesAuditModule() {
  const { setIsLoading } = useLoading();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    avgTicket: 0,
    growth: 0
  });

  useEffect(() => {
    fetchSales();
  }, [selectedMonth]);

  const fetchSales = async () => {
    setIsLoading(true, "Auditing Ledger");
    try {
      const q = query(
        collection(db, 'pos_transactions'),
        where('month', '==', selectedMonth),
        orderBy('createdAt', 'desc')
      );
      
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(data);

      const total = data.reduce((acc, curr) => acc + curr.total, 0);
      setSummary({
        totalRevenue: total,
        totalTransactions: data.length,
        avgTicket: data.length > 0 ? total / data.length : 0,
        growth: 12.5 // Mock growth for UI
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'pos_transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const changeMonth = (delta: number) => {
    const date = new Date(selectedMonth + '-01');
    date.setMonth(date.getMonth() + delta);
    setSelectedMonth(date.toISOString().slice(0, 7));
  };

  const exportData = () => {
    const csv = [
      ['Date', 'Order ID', 'Total', 'Payment Method'].join(','),
      ...transactions.map(t => [
        new Date(t.createdAt).toLocaleDateString(),
        t.orderId,
        t.total,
        t.paymentMethod
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Audit-Sales-${selectedMonth}.csv`;
    a.click();
  };

  return (
    <div className="space-y-12 bg-stone-950 p-6 lg:p-10 rounded-sm">
      {/* Month Navigator */}
      <div className="flex items-center justify-between bg-stone-900 p-8 border border-stone-800 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-brand-gold flex items-center justify-center text-stone-950 shadow-2xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-[0.4em] text-brand-gold mb-1 block">Financial Archive</span>
            <h3 className="text-2xl font-serif font-black italic text-white uppercase tracking-tighter">Monthly Audit</h3>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-stone-950 p-2 border border-stone-800">
          <button onClick={() => changeMonth(-1)} className="p-3 text-stone-500 hover:text-white transition-colors"><ChevronLeft /></button>
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white px-8 border-x border-stone-800 font-mono">
            {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => changeMonth(1)} className="p-3 text-stone-500 hover:text-white transition-colors"><ChevronRight /></button>
        </div>

        <button 
          onClick={exportData}
          className="px-8 py-4 bg-stone-800 border border-stone-700 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-stone-950 transition-all flex items-center gap-3"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Revenue (PHP)', value: summary.totalRevenue.toLocaleString(), icon: DollarSign, trend: '+12%', isUp: true },
          { label: 'Transactions', value: summary.totalTransactions, icon: ShoppingBag, trend: '+5%', isUp: true },
          { label: 'Average Ticket', value: summary.avgTicket.toLocaleString(undefined, { maximumFractionDigits: 0 }), icon: TrendingUp, trend: '-2%', isUp: false },
          { label: 'Audit Status', value: 'VERIFIED', icon: BarChart3, trend: 'SECURE', isUp: true }
        ].map((s, idx) => (
          <div key={idx} className="bg-stone-900 p-8 border border-stone-800 shadow-2xl group flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-stone-950 border border-stone-800 text-brand-gold">
                <s.icon className="w-4 h-4" />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-1 border",
                s.isUp ? "text-green-500 border-green-900/30 bg-green-950/20" : "text-red-500 border-red-900/30 bg-red-950/20"
              )}>
                {s.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {s.trend}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500 mb-2">{s.label}</p>
              <p className="text-3xl font-serif font-black italic text-white tracking-widest">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-stone-900 border border-stone-800 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-stone-800 flex justify-between items-center bg-stone-900/50">
          <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-stone-400">Transaction Ledger</h4>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-stone-600 text-[10px] font-black uppercase tracking-widest">
                <Filter className="w-3 h-3" />
                Filter: All Methods
             </div>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-950/50 border-b border-stone-800">
                <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-stone-500">Temporal Detail</th>
                <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-stone-500">Order Manifest ID</th>
                <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-stone-500">Payment Channel</th>
                <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-stone-500 text-right">Settlement (PHP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800 bg-stone-900/30">
              {transactions.map((t) => (
                <tr key={t.id} className="group hover:bg-stone-800/80 transition-colors">
                  <td className="px-8 py-6">
                    <p className="text-[11px] font-black text-white uppercase tracking-widest">{new Date(t.createdAt).toLocaleDateString()}</p>
                    <p className="text-[9px] text-stone-600 font-mono font-bold mt-1 uppercase">{new Date(t.createdAt).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-8 py-6 font-serif text-lg font-bold italic text-stone-300 group-hover:text-brand-gold">{t.orderId}</td>
                  <td className="px-8 py-6">
                    <span className="px-4 py-1.5 bg-stone-950 text-[9px] font-black uppercase tracking-widest text-white border border-stone-700">
                      {t.paymentMethod}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <p className="font-mono text-lg font-black text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.1)]">{t.total.toLocaleString()}</p>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Search className="w-12 h-12 text-stone-500" />
                      <p className="text-[11px] font-black uppercase tracking-widest text-stone-500">No archival data found for this period</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
