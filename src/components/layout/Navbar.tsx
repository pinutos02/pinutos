import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, User, LogIn, LogOut, ShieldCheck, Calendar, UtensilsCrossed, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavbarProps {
  currentView: string;
  onViewChange: (view: any) => void;
}

export function Navbar({ currentView, onViewChange }: NavbarProps) {
  const { user, profile, login, logout } = useAuth();
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', icon: UtensilsCrossed },
    { id: 'menu', label: 'Menu', icon: Menu },
    { id: 'reservation', label: 'Reserve', icon: Calendar },
    { id: 'catering', label: 'Catering', icon: Info },
  ];

  if (user) {
    navItems.push({ 
      id: 'dashboard', 
      label: profile?.role === 'admin' ? 'Admin Panel' : 'My Dashboard', 
      icon: profile?.role === 'admin' ? ShieldCheck : User 
    });
  }

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 lg:px-12 py-4",
      isScrolled 
        ? "bg-white border-b border-brand-sepia shadow-sm py-3" 
        : "bg-transparent py-6"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center gap-4 cursor-pointer group" 
          onClick={() => onViewChange('home')}
        >
          <div className="flex flex-col">
            <h1 className="font-serif text-xl lg:text-3xl font-bold tracking-tight text-brand-stone leading-none drop-shadow-sm">
              The Heritage <span className="text-brand-gold italic font-normal">Eat All You Can</span>
            </h1>
            <span className="text-[9px] tracking-[0.5em] uppercase font-black text-stone-400 mt-2">Heritage Buffet • Since 2020</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "text-[10px] uppercase tracking-[0.2em] font-bold transition-all hover:text-brand-gold flex items-center gap-2",
                currentView === item.id 
                  ? "text-brand-gold" 
                  : "text-stone-600"
              )}
            >
              <item.icon className="w-3 h-3 opacity-50" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:block">
            <span className="text-[10px] font-mono tracking-widest text-stone-400 uppercase">Looc, Villanueva</span>
          </div>
          {user ? (
            <div className="flex items-center gap-4 border-l border-brand-sepia pl-6">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold text-brand-stone uppercase tracking-widest">
                  {profile?.displayName || user.displayName}
                </p>
                <p className="text-[9px] uppercase tracking-[0.2em] text-brand-gold font-bold">
                  {profile?.role || 'customer'}
                </p>
              </div>
              <button 
                onClick={logout}
                className="p-2 rounded-full hover:bg-stone-100 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-stone-400" />
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              className="bg-stone-900 text-white px-8 py-2.5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-stone-800 transition-all shadow-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
