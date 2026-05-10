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
  AlertTriangle
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

export function POSModule() {
  const { profile } = useAuth();
  const { socket } = useSocket();
  const [items, setItems] = useState<POSItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [category, setCategory] = useState<string>('Buffet');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'gcash' | 'maya' | 'card'>('cash');
  const [orderComplete, setOrderComplete] = useState(false);
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
  const total = subtotal; // Simplified for now (can add tax/discount later)

  const processTransaction = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    setIsLoading(true, "Recording Transaction");
    
    try {
      const transactionData = {
        cashierId: profile?.uid,
        cashierName: profile?.displayName,
        items: cart.map(i => ({ itemId: i.id, name: i.name, quantity: i.quantity, price: i.price })),
        subtotal,
        total,
        paymentMethod,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'pos_transactions'), transactionData);
      
      // Emit trigger for Kitchen Display and Occupancy
      socket?.emit('order-submitted', transactionData);
      
      setOrderComplete(true);
      setCart([]);
      setTimeout(() => setOrderComplete(false), 3000);
    } catch (err) {
      console.error('Transaction failed:', err);
    } finally {
      setIsProcessing(false);
      setIsLoading(false);
    }
  };

  const categories = ['Buffet', 'Drinks', 'Extras', 'Catering'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-260px)]">
      {/* Product Selection (LG: 8 Cols) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-8 py-3 text-[10px] uppercase font-black tracking-[0.2em] transition-all whitespace-nowrap",
                category === cat 
                  ? "bg-brand-stone text-white shadow-lg" 
                  : "bg-white text-stone-700 border border-brand-sepia hover:border-brand-gold"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pr-2">
          {items.filter(i => i.category === category).map(item => (
            <motion.button
              whileTap={{ scale: 0.95 }}
              key={item.id}
              onClick={() => addToCart(item)}
              className="bg-white p-6 border border-brand-sepia text-left hover:border-brand-gold hover:shadow-xl transition-all group"
            >
              <h4 className="font-serif text-lg font-bold text-brand-stone italic leading-none mb-2 group-hover:text-brand-gold">
                {item.name}
              </h4>
              <p className="text-stone-600 text-xs font-bold font-mono">PHP {item.price.toLocaleString()}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Cart & Checkout (LG: 5 Cols) */}
      <div className="lg:col-span-5 bg-white border border-brand-sepia flex flex-col shadow-2xl">
        <div className="p-6 border-b border-brand-sepia flex justify-between items-center bg-stone-50">
          <h3 className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-stone">Current Transaction</h3>
          <span className="text-[10px] font-mono text-stone-600">BATCH: {new Date().getTime().toString().slice(-6)}</span>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          <AnimatePresence mode="popLayout">
            {cart.map(item => (
              <motion.div
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                key={item.id}
                className="flex items-center justify-between pb-4 border-b border-stone-100"
              >
                <div className="space-y-1">
                  <h5 className="font-bold text-sm text-brand-stone uppercase tracking-widest">{item.name}</h5>
                  <p className="text-[10px] text-stone-600 font-mono">PHP {item.price} x {item.quantity}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-brand-sepia">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-stone-50"><Minus className="w-3 h-3 text-stone-600" /></button>
                    <span className="px-4 font-mono text-xs font-bold border-x border-brand-sepia">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-stone-50"><Plus className="w-3 h-3 text-stone-600" /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-stone-500 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {cart.length === 0 && !orderComplete && (
            <div className="h-full flex flex-col items-center justify-center text-stone-300 space-y-4 pt-12">
              <Zap className="w-12 h-12 opacity-20" />
              <p className="text-[10px] uppercase font-black tracking-widest">Awaiting Selection</p>
            </div>
          )}
          
          {orderComplete && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-green-500 space-y-4 pt-12"
            >
              <CheckCircle2 className="w-12 h-12" />
              <p className="text-[10px] uppercase font-black tracking-widest">Transaction Recorded</p>
            </motion.div>
          )}
        </div>

        <div className="p-8 bg-stone-50 border-t border-brand-sepia space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-stone-700">Total PHP</span>
            <span className="text-4xl font-serif font-black italic text-brand-stone tracking-tight">
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
                    ? "bg-brand-stone text-white border-brand-stone shadow-lg" 
                    : "bg-white text-stone-700 border-brand-sepia hover:border-brand-gold"
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
            className="w-full py-6 bg-brand-stone text-white text-[12px] uppercase font-black tracking-[0.4em] hover:bg-black transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:grayscale"
          >
            {isProcessing ? "Validating..." : "Finalize & Record"}
          </button>
        </div>
      </div>
    </div>
  );
}
