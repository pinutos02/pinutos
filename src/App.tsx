import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { ReservationPage } from './pages/ReservationPage';
import { CateringPage } from './pages/CateringPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { POSModule } from './components/pos/POSModule';
import { InventoryModule } from './components/pos/InventoryModule';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { LoadingProvider } from './context/LoadingContext';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const [view, setView] = useState<'home' | 'menu' | 'reservation' | 'catering' | 'dashboard'>('home');
  const { user, profile } = useAuth();

  // Handle automatic dashboard redirection after login
  useEffect(() => {
    if (user && profile && view === 'home') {
      // Automatically switch to dashboard when logging in for the first time in a session
      // if we're still on the home page.
      setView('dashboard');
    }
  }, [user, !!profile]);

  const renderView = () => {
    switch (view) {
      case 'home': return <HomePage onNavigate={setView} />;
      case 'menu': return <MenuPage />;
      case 'reservation': return <ReservationPage />;
      case 'catering': return <CateringPage />;
      case 'dashboard': 
        return profile?.role === 'admin' ? <AdminDashboard /> : <CustomerDashboard />;
      default: return <HomePage onNavigate={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col font-sans selection:bg-brand-gold selection:text-white relative">
      <Navbar currentView={view} onViewChange={setView} />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
      {view !== 'dashboard' && <Footer onNavigate={setView} />}
    </div>
  );
}

export default function App() {
  return (
    <LoadingProvider>
      <AuthProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </AuthProvider>
    </LoadingProvider>
  );
}
