import React from 'react';

interface FooterProps {
  onNavigate: (view: any) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-warm-cream text-brand-stone py-20 px-12 border-t border-brand-sepia">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
        <div className="col-span-1 md:col-span-2">
          <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-stone-500 mb-2 block tracking-widest">Est. 2020</span>
          <h2 className="font-serif text-3xl font-bold mb-6 italic">The Heritage <span className="text-brand-gold italic">Eat All You Can</span></h2>
          <p className="text-stone-500 mb-8 max-w-sm leading-relaxed text-sm">
            Located in Purok 4, Looc, Villanueva, Misamis Oriental. Beside Aquarius Beach. We serve heritage recipes with passion and soul.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-[10px] uppercase tracking-[0.3em] mb-8 text-brand-gold">Menu & Reservations</h3>
          <ul className="space-y-4 text-xs font-bold uppercase tracking-widest">
            <li><button onClick={() => onNavigate('home')} className="hover:text-brand-gold transition-colors">Home</button></li>
            <li><button onClick={() => onNavigate('menu')} className="hover:text-brand-gold transition-colors">The Buffet Menu</button></li>
            <li><button onClick={() => onNavigate('reservation')} className="hover:text-brand-gold transition-colors">Table Booking</button></li>
            <li><button onClick={() => onNavigate('catering')} className="hover:text-brand-gold transition-colors">Catering Inquiry</button></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-[10px] uppercase tracking-[0.3em] mb-8 text-brand-gold">Contact & Connect</h3>
          <ul className="space-y-4 text-sm font-medium">
            <li className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest text-stone-400">Call Us</span>
              <span>+63 9XX XXX XXXX</span>
            </li>
            <li className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest text-stone-400">Socials</span>
              <div className="flex gap-4 uppercase font-bold text-[10px] tracking-widest">
                <a href="#" className="hover:text-brand-gold transition-colors">Facebook</a>
                <a href="#" className="hover:text-brand-gold transition-colors">Instagram</a>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-brand-sepia text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© {currentYear} Heritage Management System • Version 2.1.0</p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500/20 rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
          </span>
          <span>System Secure</span>
        </div>
      </div>
    </footer>
  );
}
