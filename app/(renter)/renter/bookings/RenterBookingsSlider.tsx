"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import CancelBookingButton from "./CancelBookingButton";
import PayNowButton from "./PayNowButton";

interface BookingItem {
  id: string;
  checkIn: string | Date;
  checkOut: string | Date;
  totalPrice: string | number;
  status: string;
  createdAt: string | Date;
  property: {
    id: string;
    title: string;
    city: string;
    images: string[];
  };
  payment?: {
    id: string;
    amount: string | number;
    chapaReference?: string | null;
  } | null;
}

interface RenterBookingsSliderProps {
  bookings: BookingItem[];
}

const ITEMS_PER_PAGE = 12; // 4 columns × 3 rows

export default function RenterBookingsSlider({ bookings }: RenterBookingsSliderProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(bookings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, bookings.length);
  const currentBookings = bookings.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Smooth scroll to top of bookings section
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  const getBadge = (status: string, payment?: any) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-[#f59e0b]/10 text-amber-700 dark:text-[#fcd34d] border border-amber-200 dark:border-[#f59e0b]/20">
            Awaiting payment
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] border border-[#b8943d]/20 dark:border-[#c9a84c]/20">
            Confirmed {payment ? `(${Number(payment.amount).toLocaleString()} ETB)` : ""}
          </span>
        );
      case "CANCELLED":
        return (
          <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 dark:bg-[#ef4444]/10 text-red-700 dark:text-[#fca5a5] border border-red-200 dark:border-[#ef4444]/20">
            Cancelled
          </span>
        );
      case "COMPLETED":
        return (
          <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] border border-[#b8943d]/20 dark:border-[#c9a84c]/20">
            Completed
          </span>
        );
      default:
        return (
          <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/5 dark:bg-[#fff8dc]/[0.06] text-[#6b5e4e] dark:text-[#8a8278]">
            {status}
          </span>
        );
    }
  };

  // Generate page numbers array with sliding window
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
      {/* Top Slider Bar (if multiple pages) */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-black/[0.06] dark:border-[#fff8dc]/[0.06]">
          <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278]">
            Showing <span className="font-semibold text-[#1a1208] dark:text-[#f5f0e8]">{startIndex + 1}–{endIndex}</span> of{" "}
            <span className="font-semibold text-[#1a1208] dark:text-[#f5f0e8]">{bookings.length}</span> bookings
          </p>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl border border-black/10 dark:border-[#fff8dc]/[0.1] hover:border-[#b8943d] dark:hover:border-[#c9a84c] text-[#1a1208] dark:text-[#f5f0e8] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer bg-white dark:bg-[#141310]"
              title="Previous Slide"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-2 text-[#b8943d] dark:text-[#c9a84c]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl border border-black/10 dark:border-[#fff8dc]/[0.1] hover:border-[#b8943d] dark:hover:border-[#c9a84c] text-[#1a1208] dark:text-[#f5f0e8] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer bg-white dark:bg-[#141310]"
              title="Next Slide"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4 COLUMNS × 3 ROWS GRID (12 Items) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {currentBookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white dark:bg-[#141310] border border-black/[0.08] dark:border-[#fff8dc]/[0.06] rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#b8943d]/30 dark:hover:border-[#c9a84c]/20 transition-all duration-200 flex flex-col justify-between h-full group"
          >
            {/* Image Banner */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/5 dark:bg-[#1c1a16] shrink-0">
              <div
                className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                style={{
                  backgroundImage: `url(${booking.property.images?.[0] || "/placeholder-property.jpg"})`,
                }}
              />
              <span className="absolute top-2.5 left-2.5 bg-white/95 dark:bg-[#1c1a16]/95 text-[#1a1208] dark:text-[#f5f0e8] text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs backdrop-blur-sm border border-black/5 dark:border-[#fff8dc]/[0.06]">
                {booking.property.city}
              </span>
            </div>

            {/* Content Details */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between items-start gap-1.5">
                  <h3 className="font-bold text-[#1a1208] dark:text-[#f5f0e8] text-sm line-clamp-1 group-hover:text-[#b8943d] dark:group-hover:text-[#c9a84c] transition-colors">
                    {booking.property.title}
                  </h3>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-[#6b5e4e] dark:text-[#8a8278] flex items-center gap-1">
                    <MapPin className="size-3 text-[#b8943d] dark:text-[#c9a84c]" />
                    {booking.property.city}
                  </p>
                  {getBadge(booking.status, booking.payment)}
                </div>
                {booking.payment?.chapaReference && (
                  <p className="text-[9px] text-[#9b8e7e] dark:text-[#8a8278] font-mono truncate">
                    Ref: {booking.payment.chapaReference}
                  </p>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-2 text-[11px] py-2 px-2.5 rounded-xl bg-black/[0.02] dark:bg-[#fff8dc]/[0.02] border border-black/[0.04] dark:border-[#fff8dc]/[0.04]">
                <div>
                  <p className="text-[10px] text-[#9b8e7e] dark:text-[#8a8278] font-medium">Check-in</p>
                  <p className="font-semibold text-[#1a1208] dark:text-[#f5f0e8] mt-0.5">
                    {new Date(booking.checkIn).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[#9b8e7e] dark:text-[#8a8278] font-medium">Check-out</p>
                  <p className="font-semibold text-[#1a1208] dark:text-[#f5f0e8] mt-0.5">
                    {new Date(booking.checkOut).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Pricing & Actions */}
              <div className="pt-2 border-t border-black/[0.05] dark:border-[#fff8dc]/[0.05] flex items-center justify-between gap-2">
                <div>
                  <p className="text-[9px] text-[#9b8e7e] dark:text-[#8a8278] uppercase font-bold tracking-wider">
                    Total
                  </p>
                  <p className="font-black text-[#b8943d] dark:text-[#c9a84c] text-sm">
                    {Number(booking.totalPrice).toLocaleString()} <span className="text-[10px] font-semibold">ETB</span>
                  </p>
                </div>

                <div className="flex gap-1.5 items-center">
                  {booking.status === "PENDING" && (
                    <PayNowButton bookingId={booking.id} />
                  )}
                  {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                    <CancelBookingButton bookingId={booking.id} />
                  )}
                  <Link href={`/properties/${booking.property.id}`}>
                    <button className="flex items-center gap-1 text-[11px] font-semibold text-[#6b5e4e] hover:text-[#b8943d] dark:text-[#d4cfc7] dark:hover:text-[#c9a84c] border border-black/10 dark:border-[#fff8dc]/[0.08] hover:border-[#b8943d] dark:hover:border-[#c9a84c] px-2.5 py-1 rounded-lg transition-all cursor-pointer">
                      <span>View</span>
                      <ExternalLink className="size-2.5" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM SLIDE BUTTONS WITH NUMBERS */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-black/[0.06] dark:border-[#fff8dc]/[0.06]">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-black/10 dark:border-[#fff8dc]/[0.1] bg-white dark:bg-[#141310] text-[#1a1208] dark:text-[#f5f0e8] hover:border-[#b8943d] dark:hover:border-[#c9a84c] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Numbered Slide Buttons */}
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
                  aria-label={`Slide to page ${pageNum}`}
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
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
