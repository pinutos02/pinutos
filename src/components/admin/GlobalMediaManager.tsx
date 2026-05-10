import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Image as ImageIcon, 
  Save, 
  RefreshCcw, 
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { mediaService, DEFAULT_MEDIA, SiteMedia } from '../../services/mediaService';
import { cn } from '../../lib/utils';

export function GlobalMediaManager() {
  const [mediaMap, setMediaMap] = useState<Record<string, string>>(DEFAULT_MEDIA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    const unsubscribe = mediaService.subscribeToMedia((newMedia) => {
      setMediaMap(newMedia);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdate = async (key: string, url: string) => {
    setSaving(key);
    try {
      await mediaService.updateMedia(key, url, `Global ${key} asset`);
      setStatus({ type: 'success', message: `${key} updated successfully.` });
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: `Failed to update ${key}.` });
    } finally {
      setSaving(null);
    }
  };

  const mediaKeys = [
    { key: 'hero_bg', label: 'Main Hero Background', desc: 'The massive background image on the landing page' },
    { key: 'lechon_promo', label: 'Lechon Promotion Image', desc: 'Used in the weekend lechon feast section' },
    { key: 'catering_promo', label: 'Catering Highlight', desc: 'Showcase image for the catering inquiry section' },
    { key: 'map_bg', label: 'Location Map Overlay', desc: 'The stylized background behind the location info' },
    { key: 'highlight_seafood', label: 'Seafood Selection', desc: 'Iconic image for the Seafood highlight card' },
    { key: 'highlight_lechon', label: 'Signature Roast', desc: 'Iconic image for the Lechon highlight card' },
    { key: 'highlight_karekare', label: 'Heritage Classics', desc: 'Iconic image for the Regional dishes highlight card' },
    { key: 'highlight_dessert', label: 'Sweet Endings', desc: 'Iconic image for the Kakanin highlight card' },
    { key: 'catering_banner', label: 'Catering Banner', desc: 'Main image for the catering service section' },
    { key: 'logo_text', label: 'Logo / Masthead', desc: 'The primary branding text or logo asset' }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <RefreshCcw className="animate-spin text-brand-gold" />
        <p className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Synchronizing Global Assets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end border-b border-brand-sepia pb-8">
        <div>
          <h2 className="text-3xl font-serif font-bold text-brand-stone italic tracking-tight">Master Media Control</h2>
          <p className="text-[10px] uppercase font-black tracking-[0.3em] text-stone-600 mt-2">Modify every core visual in the system</p>
        </div>
        {status && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 border text-[10px] uppercase font-bold tracking-widest",
              status.type === 'success' ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
            )}
          >
            {status.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            {status.message}
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {mediaKeys.map((item) => (
          <motion.div 
            key={item.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white border border-brand-sepia flex flex-col shadow-sm hover:shadow-md transition-all"
          >
            <div className="relative aspect-video overflow-hidden border-b border-brand-sepia bg-stone-50">
              <img 
                src={mediaMap[item.key]} 
                alt={item.label} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-brand-stone/90 backdrop-blur-md text-white border border-white/20 px-3 py-1 text-[8px] font-black uppercase tracking-widest">
                  {item.key}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6 flex-grow">
              <div>
                <h4 className="text-sm font-bold text-brand-stone uppercase tracking-widest mb-1">{item.label}</h4>
                <p className="text-[10px] text-stone-700 font-medium leading-relaxed">{item.desc}</p>
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-stone-500">Direct Asset URL</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={mediaMap[item.key]}
                    onChange={(e) => setMediaMap(prev => ({ ...prev, [item.key]: e.target.value }))}
                    className="flex-1 bg-stone-50 border border-brand-sepia/30 p-3 text-[11px] font-mono outline-none focus:ring-1 focus:ring-brand-gold transition-all"
                    placeholder="https://..."
                  />
                  <button 
                    disabled={saving === item.key}
                    onClick={() => handleUpdate(item.key, mediaMap[item.key])}
                    className={cn(
                      "px-4 transition-all flex items-center justify-center",
                      saving === item.key ? "bg-stone-100 text-stone-400" : "bg-brand-stone text-white hover:bg-black"
                    )}
                  >
                    {saving === item.key ? <RefreshCcw className="animate-spin" size={16} /> : <Save size={16} />}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-stone-50 border-t border-brand-sepia flex items-center gap-3">
              <Info className="text-brand-gold w-3 h-3" />
              <span className="text-[8px] font-black uppercase tracking-widest text-stone-600">Changes propagate to all users instantly</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
