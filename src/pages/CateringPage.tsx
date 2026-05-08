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
    <div className="pt-32 pb-24 px-6 min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <span className="text-orange-600 font-bold tracking-[0.4em] uppercase text-xs mb-4 block">Event Planning</span>
            <h1 className="font-serif text-6xl md:text-7xl font-bold text-orange-950 mb-8 italic leading-tight text-balance">
              Make Your Moment <br />
              Extraordinary
            </h1>
            <p className="text-neutral-600 text-lg mb-12 leading-relaxed max-w-lg">
              Whether it's a dream wedding, a corporate milestone, or an intimate family reunion, we bring the buffet experience to your chosen venue.
            </p>

            <div className="space-y-6">
              {[
                { title: 'Custom Menus', desc: 'Personalize your selection from over 50 authentic dishes.' },
                { title: 'Professional Staff', desc: 'Our trained servers ensure a smooth flow for your guests.' },
                { title: 'Full Setup', desc: 'We handle everything from table settings to food warmers.' }
              ].map((f) => (
                <div key={f.title} className="flex gap-6 items-start">
                  <div className="w-6 h-6 rounded-full bg-orange-500 shrink-0 mt-1 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-orange-950 text-sm uppercase tracking-widest">{f.title}</h4>
                    <p className="text-neutral-500 text-sm">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-10 md:p-14 rounded-[48px] shadow-2xl border border-neutral-100 relative">
            <h3 className="text-2xl font-bold text-orange-950 mb-8 italic">Catering Inquiry Form</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 mb-2 block">Name</label>
                  <input required placeholder="Your name" className="w-full px-6 py-4 rounded-2xl bg-neutral-50 border border-neutral-100 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 mb-2 block">Email</label>
                  <input required type="email" placeholder="email@example.com" className="w-full px-6 py-4 rounded-2xl bg-neutral-50 border border-neutral-100 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 mb-2 block">Event Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                    <input required type="date" className="w-full pl-12 pr-6 py-4 rounded-2xl bg-neutral-50 border border-neutral-100 outline-none focus:ring-2 focus:ring-orange-500/20" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 mb-2 block">Guest Count</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                    <input required type="number" placeholder="Approx. guests" className="w-full pl-12 pr-6 py-4 rounded-2xl bg-neutral-50 border border-neutral-100 outline-none focus:ring-2 focus:ring-orange-500/20" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 mb-2 block">Event Details</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-6 w-4 h-4 text-neutral-300" />
                  <textarea rows={4} placeholder="Type of event, venue, special cravings..." className="w-full pl-12 pr-6 py-4 rounded-2xl bg-neutral-50 border border-neutral-100 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none" />
                </div>
              </div>

              <button type="submit" className="w-full py-5 bg-orange-600 text-white rounded-full font-bold text-lg hover:bg-orange-700 transition-all flex items-center justify-center gap-3 group">
                Send Quotation Request
                <Send className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <p className="text-center text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                Or call us directly at <span className="text-orange-600">+63 912 345 6789</span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
