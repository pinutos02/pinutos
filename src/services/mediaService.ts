import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface SiteMedia {
  id?: string;
  key: string;
  url: string;
  description: string;
  updatedAt: any;
}

const COLLECTION = 'site_media';

// Default assets to ensure something displays if Firestore is empty
export const DEFAULT_MEDIA: Record<string, string> = {
  'hero_bg': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1920',
  'lechon_promo': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=1200',
  'catering_promo': 'https://images.unsplash.com/photo-1519222970733-f546218fa6d7?auto=format&fit=crop&q=80&w=1200',
  'map_bg': 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200',
  'highlight_seafood': 'https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&q=80&w=800',
  'highlight_lechon': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800',
  'highlight_karekare': 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?auto=format&fit=crop&q=80&w=800',
  'highlight_dessert': 'https://images.unsplash.com/photo-1551024506-0bccd038d33d?auto=format&fit=crop&q=80&w=800'
};

export const mediaService = {
  async getAllMedia(): Promise<SiteMedia[]> {
    const snapshot = await getDocs(collection(db, COLLECTION));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SiteMedia));
  },

  subscribeToMedia(callback: (media: Record<string, string>) => void) {
    return onSnapshot(collection(db, COLLECTION), (snapshot) => {
      const mediaMap: Record<string, string> = { ...DEFAULT_MEDIA };
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.key && data.url) {
          mediaMap[data.key] = data.url;
        }
      });
      callback(mediaMap);
    }, (err) => {
      console.error('Site Media Subscription Error:', err);
      // We don't throw here to allow app to function with defaults
    });
  },

  async updateMedia(key: string, url: string, description: string = '') {
    const q = query(collection(db, COLLECTION), where('key', '==', key));
    const snapshot = await getDocs(q);
    
    let docRef;
    if (snapshot.empty) {
      docRef = doc(collection(db, COLLECTION));
    } else {
      docRef = snapshot.docs[0].ref;
    }

    await setDoc(docRef, {
      key,
      url,
      description,
      updatedAt: Timestamp.now()
    });
  },

  async deleteMedia(id: string) {
    await deleteDoc(doc(db, COLLECTION, id));
  }
};
