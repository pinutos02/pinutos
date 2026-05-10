import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Users, Clock, MessageSquare, CheckCircle2, AlertCircle, ChevronRight, ArrowLeft } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import { cn } from '../lib/utils';

export function ReservationPage() {
  const { user, profile, login } = useAuth();
  const { setIsLoading } = useLoading();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    customerName: profile?.displayName || '',
    email: profile?.email || '',
    phoneNumber: profile?.phoneNumber || '',
    guestCount: 2,
    date: '',
    time: '12:00',
    specialRequests: ''
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Please sign in to make a reservation.");
      return;
    }

    setLoading(true);
    setIsLoading(true, "Securing Reservation");
    setError(null);

    try {
      const path = 'reservations';
      const reservationData = {
        ...formData,
        userId: user.uid,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(db, path), reservationData);
      setSuccess(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'reservations');
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="pt-40 pb-24 px-6 min-h-screen bg-warm-cream flex items-center justify-center text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md bg-white p-12 shadow-sm border border-brand-sepia"
        >
          <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10 text-brand-gold" />
          </div>
          <h2 className="font-serif text-4xl font-bold text-brand-stone mb-4 italic">Reservation Received</h2>
          <p className="text-stone-500 mb-10 leading-relaxed text-sm">
            Thank you, <span className="font-bold text-brand-gold">{formData.customerName}</span>. We've received your booking for {formData.date} at {formData.time}. A confirmation summary is being prepared.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-brand-stone text-white text-[10px] uppercase font-black tracking-[0.3em] hover:bg-black transition-all"
          >
            Return to Front Page
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 px-12 min-h-screen bg-warm-cream">
      <div className="max-w-6xl mx-auto">
        <header className="mb-20 text-center space-y-4">
          <span className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-gold block">Booking Inquiry</span>
          <h1 className="font-serif text-6xl font-bold text-brand-stone italic leading-none">Reserve Your Spot</h1>
          <p className="text-stone-500 max-w-lg mx-auto text-sm leading-relaxed">
            Planning a celebration or a family dinner? Secure your table in our heritage dining room.
          </p>
        </header>

        {!user ? (
          <div className="bg-white p-20 text-center border border-brand-sepia shadow-sm max-w-2xl mx-auto">
            <Calendar className="w-10 h-10 text-brand-sepia mx-auto mb-8" />
            <h3 className="font-serif text-2xl font-bold text-brand-stone mb-4 italic">Authentication Required</h3>
            <p className="text-stone-500 mb-10 text-sm max-w-sm mx-auto leading-relaxed">We require guest verification to manage our buffet capacity and ensure the best service for everyone.</p>
            <button 
              onClick={login}
              className="px-12 py-4 bg-brand-stone text-white text-[10px] uppercase font-black tracking-[0.3em] hover:bg-black transition-all"
            >
              Verify with Google
            </button>
          </div>
        ) : (
          <div className="bg-white overflow-hidden border border-brand-sepia shadow-sm flex flex-col md:flex-row min-h-[650px]">
            {/* Sidebar with Steps */}
            <div className="md:w-1/3 bg-brand-stone p-12 text-white flex flex-col justify-between">
              <div className="space-y-12">
                <div>
                   <h3 className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-gold mb-10">Application Progress</h3>
                   <div className="space-y-10">
                    {[
                      { s: 1, label: 'Guest Particulars', icon: Users },
                      { s: 2, label: 'Temporal Details', icon: Calendar },
                      { s: 3, label: 'Special Provisions', icon: MessageSquare }
                    ].map((it) => (
                      <div key={it.s} className={cn(
                        "flex items-center gap-6 transition-all",
                        step === it.s ? "opacity-100 translate-x-2" : "opacity-30"
                      )}>
                        <div className={cn(
                          "w-12 h-12 flex items-center justify-center border transition-all",
                          step === it.s ? "border-brand-gold text-brand-gold" : "border-white/20 text-white"
                        )}>
                          <it.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.3em] font-black text-white/50 mb-1">Phase 0{it.s}</p>
                          <p className="font-serif text-sm font-bold tracking-wide italic">{it.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="border border-white/10 p-8 mt-12 bg-white/5">
                <p className="text-[10px] uppercase font-black tracking-[0.3em] text-brand-gold mb-4 underline decoration-brand-gold/30 underline-offset-4">Capacity Policy</p>
                <p className="text-[11px] text-stone-400 leading-relaxed italic font-medium">
                  Reserved tables are prioritized. We hold your placement for 15 minutes past the appointed time.
                </p>
              </div>
            </div>

            {/* Form Area */}
            <div className="md:w-2/3 p-12 lg:p-20 bg-white">
              <form onSubmit={handleSubmit} className="h-full flex flex-col">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-10"
                    >
                      <h2 className="font-serif text-3xl font-bold text-brand-stone mb-10 italic">Guest Information</h2>
                      <div className="space-y-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 block">Lead Guest Name</label>
                          <input 
                            required
                            value={formData.customerName}
                            onChange={e => setFormData({...formData, customerName: e.target.value})}
                            placeholder="Full name as per identification"
                            className="w-full px-0 py-4 bg-transparent border-b border-brand-sepia focus:border-brand-gold outline-none transition-all font-serif text-lg italic placeholder:text-stone-200"
                          />
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 block">Dining Party Size</label>
                          <div className="flex items-center gap-8">
                            <button 
                              type="button" 
                              onClick={() => setFormData({...formData, guestCount: Math.max(1, formData.guestCount - 1)})}
                              className="w-12 h-12 border border-brand-sepia text-brand-stone font-bold hover:border-brand-gold transition-colors"
                            >-</button>
                            <span className="font-serif text-3xl italic w-12 text-center text-brand-stone">{formData.guestCount}</span>
                            <button 
                              type="button" 
                              onClick={() => setFormData({...formData, guestCount: Math.min(20, formData.guestCount + 1)})}
                              className="w-12 h-12 bg-brand-stone text-white font-bold hover:bg-black transition-colors"
                            >+</button>
                            <span className="text-[10px] text-stone-400 uppercase tracking-widest italic ml-auto">Max 20 per digital booking</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 block">Contact Designation</label>
                          <input 
                            required
                            value={formData.phoneNumber}
                            onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                            placeholder="Active mobile number"
                            className="w-full px-0 py-4 bg-transparent border-b border-brand-sepia focus:border-brand-gold outline-none transition-all font-serif text-lg italic placeholder:text-stone-200"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-10"
                    >
                      <h2 className="font-serif text-3xl font-bold text-brand-stone mb-10 italic">Reservation Timing</h2>
                      <div className="space-y-10">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 block">Preferred Date</label>
                          <div className="relative">
                            <Calendar className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gold" />
                            <input 
                              required
                              type="date"
                              min={new Date().toISOString().split('T')[0]}
                              value={formData.date}
                              onChange={e => setFormData({...formData, date: e.target.value})}
                              className="w-full pl-10 py-4 bg-transparent border-b border-brand-sepia focus:border-brand-gold outline-none transition-all font-serif text-lg italic"
                            />
                          </div>
                        </div>
                        <div className="space-y-6">
                          <label className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 block">Available Time Slots</label>
                          <div className="grid grid-cols-3 gap-4">
                            {['11:00', '12:30', '14:00', '17:00', '18:30', '20:00'].map(t => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setFormData({...formData, time: t})}
                                className={cn(
                                  "py-4 border transition-all text-sm font-bold uppercase tracking-widest",
                                  formData.time === t 
                                    ? "bg-brand-gold border-brand-gold text-white" 
                                    : "bg-white border-brand-sepia text-stone-500 hover:border-stone-300"
                                )}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div 
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-10"
                    >
                      <h2 className="font-serif text-3xl font-bold text-brand-stone mb-10 italic">Special Requests</h2>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 block">Annotations / Dietary Requests</label>
                        <textarea 
                          rows={6}
                          value={formData.specialRequests}
                          onChange={e => setFormData({...formData, specialRequests: e.target.value})}
                          placeholder="Allergies, celebrations, or specific seating preferences..."
                          className="w-full px-6 py-6 bg-warm-cream border border-brand-sepia outline-none focus:border-brand-gold transition-all resize-none font-serif text-lg italic placeholder:text-stone-300"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-auto pt-20 flex gap-6">
                  {step > 1 && (
                    <button 
                      type="button" 
                      onClick={prevStep}
                      className="flex-1 py-5 border border-brand-sepia font-black text-[10px] uppercase tracking-[0.3em] text-stone-500 hover:bg-stone-50 transition-all flex items-center justify-center gap-3"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      Previous Phase
                    </button>
                  )}
                  {step < 3 ? (
                    <button 
                      type="button" 
                      onClick={nextStep}
                      disabled={!formData.customerName || !formData.phoneNumber || (step === 2 && !formData.date)}
                      className="flex-[2] py-5 bg-brand-stone text-white font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
                    >
                      Proceed to next
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <button 
                      type="submit"
                      disabled={loading}
                      className="flex-[2] py-5 bg-brand-gold text-white font-black text-[10px] uppercase tracking-[0.3em] hover:bg-brand-stone disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
                    >
                      {loading ? "Confirming..." : "Finalize Booking"}
                      {!loading && <CheckCircle2 className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                {error && (
                  <div className="mt-8 p-6 bg-red-50 text-red-600 text-[10px] uppercase tracking-widest font-bold flex items-center gap-3 border border-red-100">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
