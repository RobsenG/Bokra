"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export default function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const prev = useCallback(() => {
    setLightboxIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setLightboxIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, prev, next]);

  if (images.length === 0) return null;

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 h-[320px] md:h-[440px] rounded-3xl overflow-hidden relative shadow-sm">
        {/* Main large image */}
        <div
          className="md:col-span-2 h-full w-full bg-cover bg-center bg-[#f8fafc] relative group overflow-hidden cursor-pointer"
          style={{ backgroundImage: `url(${images[0]})` }}
          onClick={() => openLightbox(0)}
          role="button"
          tabIndex={0}
          aria-label={`View image 1 of ${images.length}`}
          onKeyDown={(e) => e.key === "Enter" && openLightbox(0)}
        >
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
          <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
            1 / {images.length} · Click to expand
          </span>
        </div>

        {/* Right 4 thumbnails */}
        <div className="hidden md:grid col-span-2 grid-cols-2 gap-3 h-full">
          {Array.from({ length: 4 }).map((_, i) => {
            const img = images[i + 1] || images[0];
            const idx = i + 1 < images.length ? i + 1 : 0;
            return (
              <div
                key={i}
                className="h-full w-full bg-cover bg-center bg-[#f8fafc] hover:opacity-90 transition-all duration-300 rounded-xl cursor-pointer relative group overflow-hidden"
                style={{ backgroundImage: `url(${img})` }}
                onClick={() => openLightbox(idx)}
                role="button"
                tabIndex={0}
                aria-label={`View image ${i + 2}`}
                onKeyDown={(e) => e.key === "Enter" && openLightbox(idx)}
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
                {/* "View all" overlay on last thumbnail if there are more */}
                {i === 3 && images.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-sm rounded-xl">
                    +{images.length - 5} more
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors z-10"
            onClick={closeLightbox}
            aria-label="Close lightbox"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prev arrow */}
          {images.length > 1 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-h-[85vh] max-w-[90vw] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[lightboxIndex]}
              alt={`${title} — image ${lightboxIndex + 1}`}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl select-none"
              draggable={false}
            />
          </div>

          {/* Next arrow */}
          {images.length > 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm font-bold bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-sm">
            {lightboxIndex + 1} / {images.length}
          </div>

          {/* Dot indicators */}
          {images.length > 1 && images.length <= 10 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === lightboxIndex ? "bg-white scale-125" : "bg-white/40"
                  }`}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
