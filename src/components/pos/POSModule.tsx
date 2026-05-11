import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Wallet, 
  Banknote, 
  Zap, 
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  X
} from 'lucide-react';
import { collection, addDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useLoading } from '../../context/LoadingContext';
import { cn } from '../../lib/utils';

interface POSItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface CartItem extends POSItem {
  quantity: number;
}

interface ReceiptData {
  orderId: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  cashier: string;
  timestamp: string;
}

export function POSModule() {
  const { profile } = useAuth();
  const { socket } = useSocket();
  const [items, setItems] = useState<POSItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [category, setCategory] = useState<string>('Buffet');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'gcash' | 'maya' | 'card'>('cash');
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { setIsLoading } = useLoading();

  useEffect(() => {
    if (!profile) return;

    const q = query(collection(db, 'menu'), where('isAvailable', '==', true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as POSItem)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'menu'));
    
    return () => unsubscribe();
  }, [profile]);

  const addToCart = (item: POSItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal;

  const processTransaction = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    setIsLoading(true, "Finalizing Transaction");
    
    try {
      const orderId = `HB-${Date.now().toString().slice(-6)}`;
      const timestamp = new Date().toISOString();
      const transactionData = {
        orderId,
        cashierId: profile?.uid,
        cashierName: profile?.displayName,
        items: cart.map(i => ({ itemId: i.id, name: i.name, quantity: i.quantity, price: i.price })),
        subtotal,
        total,
        paymentMethod,
        createdAt: timestamp,
        month: timestamp.slice(0, 7), // For monthly audit
      };

      await addDoc(collection(db, 'pos_transactions'), transactionData);
      
      socket?.emit('order-submitted', transactionData);
      
      setReceipt({
        orderId,
        items: [...cart],
        total,
        paymentMethod,
        cashier: profile?.displayName || 'Unknown',
        timestamp
      });
      setCart([]);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'pos_transactions');
    } finally {
      setIsProcessing(false);
      setIsLoading(false);
    }
  };

  const categories = ['Buffet', 'Drinks', 'Extras', 'Catering'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[calc(100vh-260px)] pb-24 lg:pb-0">
      {/* Product Selection (LG: 8 Cols) */}
      <div className="lg:col-span-7 flex flex-col gap-6 max-h-[50vh] lg:max-h-full">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-8 py-3 text-[11px] uppercase font-black tracking-[0.2em] transition-all whitespace-nowrap border-b-2",
                category === cat 
                  ? "bg-stone-800 text-brand-gold border-brand-gold shadow-2xl" 
                  : "bg-stone-900 text-stone-400 border-transparent hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pr-2 custom-scrollbar">
          {items.filter(i => i.category === category).map(item => (
            <motion.button
              whileTap={{ scale: 0.95 }}
              key={item.id}
              onClick={() => addToCart(item)}
              className="bg-stone-900 p-6 border border-stone-800 text-left hover:border-brand-gold hover:bg-stone-800 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-8 h-8 bg-brand-gold/10 -translate-y-4 translate-x-4 rotate-45 group-hover:translate-y-0 group-hover:translate-x-0 transition-transform" />
              <h4 className="font-serif text-lg font-bold text-white italic leading-none mb-3 group-hover:text-brand-gold">
                {item.name}
              </h4>
              <p className="text-brand-gold text-xs font-black font-mono">PHP {item.price.toLocaleString()}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Cart & Checkout (LG: 5 Cols) */}
      <div className="lg:col-span-5 bg-stone-900 border border-stone-800 flex flex-col shadow-2xl relative">
        <div className="p-6 border-b border-stone-800 flex justify-between items-center bg-stone-900">
          <h3 className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-gold">Terminal Output</h3>
          <span className="text-[10px] font-mono text-stone-500 font-bold uppercase">Ready for Order</span>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar bg-stone-950/50">
          <AnimatePresence mode="popLayout">
            {cart.map(item => (
              <motion.div
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                key={item.id}
                className="flex items-center justify-between pb-4 border-b border-stone-800"
              >
                <div className="space-y-1">
                  <h5 className="font-black text-xs text-white uppercase tracking-widest">{item.name}</h5>
                  <p className="text-[10px] text-brand-gold font-mono font-bold">PHP {item.price} x {item.quantity}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-stone-700 bg-stone-800">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-stone-700"><Minus className="w-3 h-3 text-white" /></button>
                    <span className="px-4 font-mono text-xs font-black text-white border-x border-stone-700">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-stone-700"><Plus className="w-3 h-3 text-white" /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-stone-500 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-stone-800 space-y-4 pt-12">
              <Zap className="w-12 h-12 opacity-10 animate-pulse" />
              <p className="text-[10px] uppercase font-black tracking-widest opacity-20">Awaiting Command</p>
            </div>
          )}
        </div>

        <div className="p-8 bg-stone-900 border-t-2 border-brand-gold space-y-6">
          <div className="flex justify-between items-center px-2">
            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-stone-400">Grand Total PHP</span>
            <span className="text-4xl font-serif font-black italic text-white tracking-widest drop-shadow-[0_0_10px_rgba(212,175,55,0.2)]">
              {total.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'cash', icon: Banknote, label: 'Cash' },
              { id: 'gcash', icon: Wallet, label: 'GCash' },
              { id: 'maya', icon: Wallet, label: 'Maya' },
              { id: 'card', icon: CreditCard, label: 'Card' }
            ].map(method => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id as any)}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-3 border transition-all",
                  paymentMethod === method.id 
                    ? "bg-brand-gold text-stone-950 border-brand-gold shadow-lg transform -translate-y-1" 
                    : "bg-stone-800 text-stone-400 border-stone-700 hover:border-stone-500 hover:text-white"
                )}
              >
                <method.icon className="w-4 h-4" />
                <span className="text-[8px] uppercase font-black tracking-widest">{method.label}</span>
              </button>
            ))}
          </div>

          <button
            disabled={cart.length === 0 || isProcessing}
            onClick={processTransaction}
            className="w-full py-6 bg-brand-gold text-stone-950 text-[13px] uppercase font-black tracking-[0.5em] hover:bg-white transition-all flex items-center justify-center gap-4 disabled:opacity-30 disabled:grayscale group shadow-2xl"
          >
            {isProcessing ? "PROCESSING..." : "FINALIZE SESSION"}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>

      {/* Audit Receipt Modal */}
      <AnimatePresence>
        {receipt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 30 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 30 }}
               className="bg-white text-stone-950 w-full max-w-md p-10 font-mono shadow-[0_0_100px_rgba(255,255,255,0.1)] relative"
             >
                <div className="absolute top-4 right-4 print:hidden">
                   <button onClick={() => setReceipt(null)} className="p-2 hover:bg-stone-100"><X size={24} /></button>
                </div>

                <div className="text-center mb-10 pb-8 border-b-2 border-stone-950 border-dashed">
                   <h2 className="text-2xl font-serif font-black italic tracking-tighter mb-1">Looc Heritage House</h2>
                   <p className="text-[10px] uppercase font-black tracking-widest opacity-60">Villanueva Heritage Buffet</p>
                   <p className="text-[8px] uppercase font-medium mt-4">Transaction: {receipt.orderId}</p>
                   <p className="text-[8px] opacity-60 uppercase">{new Date(receipt.timestamp).toLocaleString()}</p>
                </div>

                <div className="space-y-4 mb-10">
                   {receipt.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start text-xs font-black">
                         <div className="flex-1">
                            <p className="uppercase">{item.name}</p>
                            <p className="text-[9px] opacity-50 font-medium">QTY: {item.quantity} x PHP {item.price}</p>
                         </div>
                         <p className="tracking-tighter">PHP {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                   ))}
                </div>

                <div className="border-t-2 border-stone-950 pt-6 mb-10 space-y-2">
                   <div className="flex justify-between font-black text-xs uppercase">
                      <span>Subtotal</span>
                      <span>PHP {receipt.total.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between font-black text-xl uppercase tracking-tighter border-t pt-2 mt-2">
                      <span>Total</span>
                      <span>PHP {receipt.total.toLocaleString()}</span>
                   </div>
                </div>

                <div className="bg-stone-100 p-6 mb-10">
                   <p className="text-[9px] uppercase font-black tracking-widest mb-1 text-stone-500">Settlement Info</p>
                   <div className="flex justify-between text-[10px] font-black uppercase">
                      <span>Mode</span>
                      <span className="text-brand-stone">{receipt.paymentMethod}</span>
                   </div>
                   <div className="flex justify-between text-[10px] font-black uppercase mt-1">
                      <span>Officer</span>
                      <span>{receipt.cashier}</span>
                   </div>
                </div>

                <div className="text-center">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4">Authenticity Verified</p>
                   <div className="flex gap-2 print:hidden justify-center">
                      <button 
                        onClick={() => window.print()}
                        className="px-6 py-3 bg-stone-950 text-white text-[9px] uppercase font-bold tracking-widest"
                      >
                        Print Copy
                      </button>
                      <button 
                         onClick={() => setReceipt(null)}
                         className="px-6 py-3 border border-stone-200 text-stone-600 text-[9px] uppercase font-bold tracking-widest"
                      >
                        Close Portal
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
