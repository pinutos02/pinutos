import { useState, useEffect } from 'react';
import { mediaService, DEFAULT_MEDIA } from '../services/mediaService';

export function useSiteMedia() {
  const [media, setMedia] = useState<Record<string, string>>(DEFAULT_MEDIA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = mediaService.subscribeToMedia((newMedia) => {
      setMedia(newMedia);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { media, loading };
}
