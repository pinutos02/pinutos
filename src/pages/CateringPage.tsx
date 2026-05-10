import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, Calendar, Users, FileText, Send, CheckCircle2 } from 'lucide-react';

export function CateringPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="pt-40 pb-24 px-6 min-h-screen bg-neutral-50 flex items-center justify-center text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md bg-white p-12 rounded-[48px] shadow-2xl border border-orange-100"
        >
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-8 text-orange-600">
            <Send className="w-10 h-10" />
          </div>
          <h2 className="font-serif text-4xl font-bold text-orange-950 mb-4 italic">Inquiry Sent!</h2>
          <p className="text-neutral-600 mb-10 leading-relaxed">
            Thank you for considering our heritage house for your event. Our catering specialist will review your request and get back to you within 24 hours.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="w-full py-4 bg-orange-950 text-white rounded-full font-bold hover:shadow-lg transition-all"
          >
            Send Another Inquiry
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-32 pb-24 px-6 min-h-screen bg-warm-cream">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div>
            <span className="text-brand-gold font-black tracking-[0.4em] uppercase text-[10px] mb-4 block">Event Planning</span>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-brand-stone mb-8 italic leading-tight text-balance">
              Make Your Moment <br />
              Extraordinary
            </h1>
            <p className="text-stone-500 text-sm md:text-lg mb-12 leading-relaxed max-w-lg">
              Whether it's a dream wedding, a corporate milestone, or an intimate family reunion, we bring the premium buffet experience to your chosen venue.
            </p>

            <div className="space-y-8">
              {[
                { title: 'Custom Menus', desc: 'Personalize your selection from over 50 authentic heritage dishes.' },
                { title: 'Professional Staff', desc: 'Our trained servers ensure a smooth flow for your guests.' },
                { title: 'Full Setup', desc: 'We handle everything from table settings to food warmers.' }
              ].map((f) => (
                <div key={f.title} className="flex gap-6 items-start">
                  <div className="w-6 h-6 bg-brand-gold shrink-0 mt-1 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-brand-stone text-[10px] uppercase tracking-widest leading-none mb-2">{f.title}</h4>
                    <p className="text-stone-500 text-xs italic">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 md:p-14 border border-brand-sepia shadow-2xl relative">
            <h3 className="text-2xl font-serif font-black text-brand-stone mb-8 italic">Catering Inquiry Form</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-stone-400 block">Name</label>
                  <input required placeholder="Your name" className="w-full px-0 py-3 bg-transparent border-b border-brand-sepia focus:border-brand-gold outline-none transition-all font-serif italic text-lg" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-stone-400 block">Email</label>
                  <input required type="email" placeholder="email@example.com" className="w-full px-0 py-3 bg-transparent border-b border-brand-sepia focus:border-brand-gold outline-none transition-all font-serif italic text-lg" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-stone-400 block">Event Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold" />
                    <input required type="date" className="w-full pl-8 py-3 bg-transparent border-b border-brand-sepia outline-none focus:border-brand-gold font-serif italic text-lg" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-stone-400 block">Guest Count</label>
                  <div className="relative">
                    <Users className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold" />
                    <input required type="number" placeholder="Approx. guests" className="w-full pl-8 py-3 bg-transparent border-b border-brand-sepia outline-none focus:border-brand-gold font-serif italic text-lg" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-stone-400 block">Event Details</label>
                <div className="relative">
                  <textarea rows={4} placeholder="Type of event, venue, special cravings..." className="w-full px-6 py-6 bg-warm-cream border border-brand-sepia focus:border-brand-gold outline-none transition-all resize-none font-serif italic text-lg" />
                </div>
              </div>

              <button type="submit" className="w-full py-5 bg-brand-stone text-white text-[10px] uppercase font-black tracking-[0.4em] hover:bg-black transition-all flex items-center justify-center gap-3 group">
                Send Quotation Request
                <Send className="w-4 h-4 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <p className="text-center text-[9px] font-black text-stone-400 uppercase tracking-widest">
                Or call us directly at <span className="text-brand-gold">+63 912 345 6789</span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
