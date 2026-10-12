"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, BadgeCheck, Star, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

interface PropertyReview {
  rating: number;
}

export interface HomePropertyItem {
  id: string;
  title: string;
  description: string;
  city: string;
  pricePerNight: number | string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  images: string[];
  isVerified: boolean;
  reviews?: PropertyReview[];
}

interface HomePropertiesSliderProps {
  properties: HomePropertyItem[];
  isLoggedIn: boolean;
}

const ITEMS_PER_PAGE = 24; // 6 columns × 4 rows

export default function HomePropertiesSlider({
  properties,
  isLoggedIn,
}: HomePropertiesSliderProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(properties.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, properties.length);
  const currentProperties = properties.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      const section = document.getElementById("featured-properties-section");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // Generate numbered slide buttons array
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Top Slider Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-black/[0.06] dark:border-[#fff8dc]/[0.06]">
        <div className="flex items-center gap-2 text-xs text-[#6b5e4e] dark:text-[#8a8278]">
          <span className="font-semibold text-[#1a1208] dark:text-[#f5f0e8]">
            {properties.length}
          </span>{" "}
          stays available
          {totalPages > 1 && (
            <span className="text-[#9b8e7e] dark:text-[#8a8278]">
              • Showing {startIndex + 1}–{endIndex}
            </span>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs font-semibold text-[#b8943d] dark:text-[#c9a84c] mr-1">
              Slide {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-black/10 dark:border-[#fff8dc]/[0.1] hover:border-[#b8943d] dark:hover:border-[#c9a84c] text-[#1a1208] dark:text-[#f5f0e8] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer bg-white dark:bg-[#141310] shadow-xs active:scale-95"
              title="Previous Slide"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-black/10 dark:border-[#fff8dc]/[0.1] hover:border-[#b8943d] dark:hover:border-[#c9a84c] text-[#1a1208] dark:text-[#f5f0e8] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer bg-white dark:bg-[#141310] shadow-xs active:scale-95"
              title="Next Slide"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 6 COLUMNS × 4 ROWS GRID (24 properties per view) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {currentProperties.map((property) => {
          const totalRating = (property.reviews || []).reduce(
            (acc, r) => acc + r.rating,
            0
          );
          const avgRating =
            property.reviews && property.reviews.length > 0
              ? (totalRating / property.reviews.length).toFixed(1)
              : null;

          const href = isLoggedIn
            ? `/properties/${property.id}`
            : "/login?message=Sign+in+to+view+and+book+properties";

          return (
            <Link
              href={href}
              key={property.id}
              className="group flex flex-col h-full animate-fade-up"
            >
              <article className="overflow-hidden h-full flex flex-col p-0 bg-white dark:bg-[#141310] border border-black/[0.08] dark:border-[#fff8dc]/[0.06] rounded-2xl transition-all duration-200 hover:shadow-lg hover:border-[#b8943d]/40 dark:hover:border-[#c9a84c]/30 hover:dark:bg-[#1c1a16] group">
                {/* Image */}
                <div className="relative aspect-[16/11] overflow-hidden bg-black/[0.03] dark:bg-[#1c1a16] shrink-0">
                  {property.images?.[0] ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#9b8e7e] dark:text-[#524d47]">
                      <MapPin className="w-8 h-8" />
                    </div>
                  )}

                  {/* City Badge */}
                  <span className="absolute top-2 left-2 bg-white/95 dark:bg-[#1c1a16]/95 text-[#1a1208] dark:text-[#f5f0e8] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs backdrop-blur-sm border border-black/5 dark:border-[#fff8dc]/[0.06]">
                    {property.city}
                  </span>

                  {/* Verified Badge */}
                  {property.isVerified && (
                    <span className="absolute top-2 right-2 bg-[#b8943d] dark:bg-[#c9a84c] text-white dark:text-[#0c0b09] text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-xs">
                      <BadgeCheck className="w-2.5 h-2.5" />
                      Verified
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex justify-between items-start gap-1 mb-1">
                      <h3 className="font-bold text-[#1a1208] dark:text-[#f5f0e8] text-xs line-clamp-1 group-hover:text-[#b8943d] dark:group-hover:text-[#c9a84c] transition-colors">
                        {property.title}
                      </h3>
                      {avgRating && (
                        <div className="flex items-center gap-0.5 text-amber-500 text-[11px] font-bold shrink-0">
                          <Star className="w-3 h-3 fill-amber-500" />
                          <span>{avgRating}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-[#9b8e7e] dark:text-[#8a8278] line-clamp-1">
                      {property.description}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#9b8e7e] dark:text-[#8a8278] pb-2 border-b border-black/[0.05] dark:border-[#fff8dc]/[0.04]">
                      <span>{property.bedrooms} Bed</span>
                      <span>•</span>
                      <span>{property.bathrooms} Bath</span>
                      <span>•</span>
                      <span>{property.maxGuests} Guests</span>
                    </div>
                    <div className="flex items-baseline justify-between pt-2">
                      <span className="text-[10px] text-[#9b8e7e] dark:text-[#8a8278]">
                        night
                      </span>
                      <span className="font-extrabold text-[#b8943d] dark:text-[#c9a84c] text-sm">
                        {Number(property.pricePerNight).toLocaleString()}{" "}
                        <span className="text-[10px] font-semibold text-[#1a1208] dark:text-[#f5f0e8]">ETB</span>
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>

      {/* BOTTOM SLIDE / NUMBERED CONTROLS */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-black/[0.06] dark:border-[#fff8dc]/[0.06]">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-black/10 dark:border-[#fff8dc]/[0.1] bg-white dark:bg-[#141310] text-[#1a1208] dark:text-[#f5f0e8] hover:border-[#b8943d] dark:hover:border-[#c9a84c] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Slide</span>
          </button>

          {/* Numbered buttons */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {getPageNumbers().map((pageNum, idx) => {
              if (pageNum === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 text-xs text-[#9b8e7e] dark:text-[#8a8278]"
                  >
                    ...
                  </span>
                );
              }

              const isCurrent = pageNum === currentPage;
              return (
                <button
                  key={`page-${pageNum}`}
                  onClick={() => goToPage(pageNum as number)}
                  className={`min-w-8 h-8 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-[#b8943d] dark:bg-[#c9a84c] text-white dark:text-[#0c0b09] shadow-sm scale-105"
                      : "border border-black/[0.08] dark:border-[#fff8dc]/[0.08] bg-white dark:bg-[#141310] text-[#6b5e4e] dark:text-[#8a8278] hover:border-[#b8943d]/50 dark:hover:border-[#c9a84c]/50 hover:text-[#1a1208] dark:hover:text-[#f5f0e8]"
                  }`}
                  aria-label={`Go to slide ${pageNum}`}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-black/10 dark:border-[#fff8dc]/[0.1] bg-white dark:bg-[#141310] text-[#1a1208] dark:text-[#f5f0e8] hover:border-[#b8943d] dark:hover:border-[#c9a84c] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
          >
            <span>Next Slide</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
