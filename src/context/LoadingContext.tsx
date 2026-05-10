import React, { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LoadingFeast } from '../components/ui/LoadingFeast';

interface LoadingContextType {
  setIsLoading: (loading: boolean, message?: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | undefined>();

  const setIsLoading = (val: boolean, msg?: string) => {
    setLoading(val);
    setMessage(msg);
  };

  return (
    <LoadingContext.Provider value={{ setIsLoading }}>
      {children}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-stone-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="mb-12">
              <LoadingFeast />
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-xs"
            >
              <p className="text-brand-gold text-[10px] uppercase tracking-[0.8em] font-black italic mb-4">
                The Heritage
              </p>
              <h4 className="text-white text-2xl font-serif font-bold italic mb-4">
                {message || "Preparing the Feast"}
              </h4>
              <div className="w-48 h-[1px] bg-brand-sepia/30 mx-auto relative overflow-hidden">
                <motion.div 
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute inset-y-0 w-1/3 bg-brand-gold"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </LoadingContext.Provider>
  );
}

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) throw new Error('useLoading must be used within LoadingProvider');
  return context;
};
