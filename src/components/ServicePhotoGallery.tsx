"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Camera } from "lucide-react";

const GALLERY_PHOTOS: Record<string, { url: string; caption: string }[]> = {
  plumbing: [
    { url: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=80", caption: "Tap repair in progress" },
    { url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80", caption: "Pipe installation" },
    { url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80", caption: "Bathroom fitting" },
  ],
  electrical: [
    { url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80", caption: "Switch board repair" },
    { url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80", caption: "Wiring work" },
    { url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80", caption: "Fan installation" },
  ],
  cleaning: [
    { url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80", caption: "Deep cleaning" },
    { url: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&q=80", caption: "Sofa cleaning" },
    { url: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&q=80", caption: "Bathroom scrub" },
  ],
  appliances: [
    { url: "https://images.unsplash.com/photo-1631545806609-04cf44b5ce01?w=600&q=80", caption: "AC servicing" },
    { url: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=80", caption: "Washing machine repair" },
    { url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80", caption: "Fridge maintenance" },
  ],
};

interface ServicePhotoGalleryProps {
  category: string;
}

export function ServicePhotoGallery({ category }: ServicePhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const photos = GALLERY_PHOTOS[category.toLowerCase()] || GALLERY_PHOTOS.cleaning;

  if (!photos.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Camera className="w-4 h-4 text-brand-500" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Service Gallery</h3>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo, i) => (
          <button
            key={i}
            onClick={() => setLightboxIndex(i)}
            className="aspect-square rounded-xl overflow-hidden relative group"
          >
            <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxIndex(null)}>
          <button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 text-white/80 hover:text-white"><X className="w-6 h-6" /></button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length); }} className="absolute left-4 text-white/80 hover:text-white"><ChevronLeft className="w-8 h-8" /></button>
          <div className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={photos[lightboxIndex].url} alt={photos[lightboxIndex].caption} className="w-full rounded-2xl" />
            <p className="text-center text-white/80 text-sm mt-3">{photos[lightboxIndex].caption}</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % photos.length); }} className="absolute right-4 text-white/80 hover:text-white"><ChevronRight className="w-8 h-8" /></button>
        </div>
      )}
    </div>
  );
}
