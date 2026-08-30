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

  const sideImages = images.slice(1, 5);

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 h-[320px] md:h-[440px] rounded-3xl overflow-hidden relative shadow-sm">
        {/* Main large image */}
        <div
          className={`h-full w-full bg-cover bg-center bg-[#f8fafc] relative group overflow-hidden cursor-pointer hover:opacity-90 transition-opacity ${
            sideImages.length > 0 ? "md:col-span-2" : "md:col-span-4"
          }`}
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

        {/* Side thumbnails (no duplicates) */}
        {sideImages.length > 0 && (
          <div className="hidden md:grid col-span-2 grid-cols-2 gap-3 h-full">
            {sideImages.map((img, i) => {
              const idx = i + 1;
              const isLast = i === sideImages.length - 1;
              const remainingCount = images.length - 5;
              return (
                <div
                  key={idx}
                  className="h-full w-full bg-cover bg-center bg-[#f8fafc] hover:opacity-90 transition-opacity rounded-xl cursor-pointer relative group overflow-hidden"
                  style={{ backgroundImage: `url(${img})` }}
                  onClick={() => openLightbox(idx)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View image ${idx + 1}`}
                  onKeyDown={(e) => e.key === "Enter" && openLightbox(idx)}
                >
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
                  {isLast && remainingCount > 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-sm rounded-xl">
                      +{remainingCount} more
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox UI (Fullscreen Overlay) */}
      {lightboxOpen && (
        <div
          className="bg-black/95 fixed inset-0 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button top right */}
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors z-10 cursor-pointer"
            onClick={closeLightbox}
            aria-label="Close lightbox"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Arrow Button */}
          {images.length > 1 && (
            <button
              className="absolute top-1/2 -translate-y-1/2 left-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors border border-white/20 z-10 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Current Centered Image */}
          <div
            className="relative max-h-[85vh] max-w-[90vw] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[lightboxIndex]}
              alt={`${title} — image ${lightboxIndex + 1}`}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl select-none transition-all duration-200"
              draggable={false}
            />
          </div>

          {/* Right Arrow Button */}
          {images.length > 1 && (
            <button
              className="absolute top-1/2 -translate-y-1/2 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors border border-white/20 z-10 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm font-bold bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-sm">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
