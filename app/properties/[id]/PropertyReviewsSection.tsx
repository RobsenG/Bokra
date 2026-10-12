"use client";

import React, { useState } from "react";
import { Star, Sparkles, CheckCircle2, MessageSquare, X } from "lucide-react";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string | Date;
  renter: {
    name: string | null;
    email: string | null;
    avatar: string | null;
  };
}

interface PropertyReviewsSectionProps {
  reviews: ReviewItem[];
  aiSummary: string;
}

export default function PropertyReviewsSection({
  reviews = [],
  aiSummary,
}: PropertyReviewsSectionProps) {
  const [selectedStar, setSelectedStar] = useState<number | null>(null);
  const [showAllModal, setShowAllModal] = useState(false);

  const totalReviews = reviews.length;
  const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avgRatingNumber = totalReviews > 0 ? totalRating / totalReviews : 0;
  const avgRatingStr = totalReviews > 0 ? avgRatingNumber.toFixed(1) : "0.0";
  const percentageScore = Math.round((avgRatingNumber / 5) * 100);

  // Breakdown percentages
  const starCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { star, count, pct };
  });

  const filteredReviews = selectedStar
    ? reviews.filter((r) => Math.round(r.rating) === selectedStar)
    : reviews;

  const displayedReviews = filteredReviews.slice(0, 6);

  return (
    <div className="space-y-10 font-sans">
      {/* AI REVIEW SUMMARY CARD */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[#faf7f0] to-[#f5f0e8] dark:from-[#1c1a14] dark:to-[#141310] border border-[#b8943d]/20 dark:border-[#c9a84c]/15 shadow-sm space-y-4">
        {/* Floating sparkles background accents */}
        <div className="absolute -top-3 -right-3 text-4xl text-[#b8943d]/15 dark:text-[#c9a84c]/10 select-none pointer-events-none">
          ✦
        </div>
        <div className="absolute bottom-2 right-12 text-2xl text-[#b8943d]/15 dark:text-[#c9a84c]/10 select-none pointer-events-none">
          ✦
        </div>
        <div className="absolute top-1/2 left-4 text-xl text-[#b8943d]/10 dark:text-[#c9a84c]/10 select-none pointer-events-none">
          ✦
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-[#b8943d] dark:text-[#c9a84c] animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#b8943d] dark:text-[#c9a84c]">
              ✦ Guest Sentiment Analysis
            </span>
          </div>
          <span className="text-[10px] text-[#9b8e7e] dark:text-[#8a8278] font-mono">
            Powered by Groq AI
          </span>
        </div>

        <p className="text-sm md:text-base text-[#1a1208] dark:text-[#f5f0e8] leading-relaxed font-medium">
          {aiSummary || "No AI review summary generated for this property yet."}
        </p>
      </div>

      {/* REVIEWS HEADER & SCORE BREAKDOWN */}
      <div className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] p-6 md:p-8 shadow-xs space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left Side — Big Score Circle */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="relative w-32 h-32 rounded-full flex items-center justify-center border-4 border-black/[0.06] dark:border-white/[0.06]">
              {/* Circular border percentage SVG */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-black/[0.06] dark:text-white/[0.06]"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#b8943d] dark:text-[#c9a84c] transition-all duration-1000"
                  strokeDasharray={`${percentageScore}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>

              <div className="text-center z-10 space-y-0.5">
                <span className="text-4xl font-black text-[#b8943d] dark:text-[#c9a84c]">
                  {avgRatingStr}
                </span>
                <span className="block text-[11px] font-semibold text-[#9b8e7e] dark:text-[#8a8278]">
                  out of 5
                </span>
              </div>
            </div>
            <p className="text-xs font-bold text-[#1a1208] dark:text-[#f5f0e8] mt-3">
              {totalReviews} {totalReviews === 1 ? "Guest Review" : "Guest Reviews"}
            </p>
          </div>

          {/* Right Side — Rating Breakdown Bars */}
          <div className="flex-1 w-full space-y-2.5">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-[#1a1208] dark:text-[#f5f0e8]">
                Rating Distribution
              </span>
              {selectedStar && (
                <button
                  type="button"
                  onClick={() => setSelectedStar(null)}
                  className="text-xs text-[#b8943d] dark:text-[#c9a84c] hover:underline"
                >
                  Clear Filter ({selectedStar} Stars)
                </button>
              )}
            </div>

            {starCounts.map(({ star, count, pct }) => (
              <button
                key={star}
                type="button"
                onClick={() => setSelectedStar(selectedStar === star ? null : star)}
                className={`w-full flex items-center gap-3 group text-xs cursor-pointer p-1 rounded-xl transition-colors ${
                  selectedStar === star
                    ? "bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 font-bold"
                    : "hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                }`}
              >
                <span className="w-12 text-left font-semibold text-[#6b5e4e] dark:text-[#8a8278] group-hover:text-[#1a1208] dark:group-hover:text-[#f5f0e8]">
                  {star} stars
                </span>
                <div className="flex-1 h-2 rounded-full bg-black/[0.06] dark:bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full bg-[#b8943d] dark:bg-[#c9a84c] rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-[11px] font-mono text-[#9b8e7e] dark:text-[#8a8278]">
                  {pct}%
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* REVIEWS GRID */}
      <div className="space-y-6">
        <h3 className="text-xl font-extrabold text-[#1a1208] dark:text-[#f5f0e8] flex items-center justify-between">
          <span>
            {selectedStar ? `${selectedStar}-Star Reviews` : "All Guest Reviews"} ({filteredReviews.length})
          </span>
        </h3>

        {filteredReviews.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6b5e4e] dark:text-[#8a8278] bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.06] dark:border-[#fff8dc]/[0.06]">
            <MessageSquare className="size-8 mx-auto text-[#9b8e7e] mb-2 opacity-50" />
            <p className="font-bold text-sm text-[#1a1208] dark:text-[#f5f0e8]">No reviews found</p>
            <p className="mt-0.5">There are no reviews for the selected filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedReviews.map((review) => {
              const renterName = review.renter.name || review.renter.email || "Renter";
              const avatarSrc = review.renter.avatar;
              const dateStr = new Date(review.createdAt).toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              });

              return (
                <div
                  key={review.id}
                  className="bg-white dark:bg-[#141310] rounded-2xl border border-black/[0.06] dark:border-white/[0.05] p-5 relative overflow-hidden flex flex-col justify-between shadow-xs space-y-4"
                >
                  {/* Decorative quote mark */}
                  <span className="absolute top-2 right-3 text-8xl font-serif opacity-5 text-[#b8943d] dark:text-[#c9a84c] pointer-events-none select-none">
                    “
                  </span>

                  {/* Top row */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 border border-black/[0.08] dark:border-white/[0.06] overflow-hidden shrink-0 flex items-center justify-center font-bold text-[#b8943d] dark:text-[#c9a84c] text-sm">
                      {avatarSrc ? (
                        <img src={avatarSrc} alt={renterName} className="w-full h-full object-cover" />
                      ) : (
                        renterName[0].toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#1a1208] dark:text-[#f5f0e8]">
                        {renterName}
                      </p>
                      <p className="text-xs text-[#9b8e7e] dark:text-[#8a8278]">{dateStr}</p>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-3.5 ${
                          i < Math.round(review.rating)
                            ? "fill-amber-500 text-amber-500"
                            : "text-[#9b8e7e]/30 dark:text-[#8a8278]/30"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Review comment */}
                  {review.comment && (
                    <p className="text-sm italic text-[#6b5e4e] dark:text-[#9b9080] leading-relaxed line-clamp-4">
                      &quot;{review.comment}&quot;
                    </p>
                  )}

                  {/* Bottom strip badge */}
                  <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] border border-[#b8943d]/20 dark:border-[#c9a84c]/20">
                      <CheckCircle2 className="size-3" />
                      Verified Stay
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SHOW ALL BUTTON */}
        {filteredReviews.length > 6 && (
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => setShowAllModal(true)}
              className="px-6 py-3 rounded-xl bg-white dark:bg-[#141310] border border-black/[0.08] dark:border-white/[0.06] text-xs font-bold text-[#b8943d] dark:text-[#c9a84c] hover:border-[#b8943d] transition-colors shadow-xs cursor-pointer"
            >
              Show all {filteredReviews.length} reviews
            </button>
          </div>
        )}
      </div>

      {/* FULL REVIEWS MODAL */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-white/[0.06] max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between bg-[#faf9f7] dark:bg-[#1c1a16]">
              <h3 className="text-lg font-extrabold text-[#1a1208] dark:text-[#f5f0e8]">
                All {filteredReviews.length} Reviews
              </h3>
              <button
                type="button"
                onClick={() => setShowAllModal(false)}
                className="p-1 rounded-lg text-[#6b5e4e] hover:text-[#1a1208] dark:hover:text-[#f5f0e8]"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 rounded-2xl bg-[#faf9f7] dark:bg-[#1c1a16] border border-black/[0.05] dark:border-white/[0.05] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm text-[#1a1208] dark:text-[#f5f0e8]">
                      {review.renter.name || review.renter.email}
                    </p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3 ${
                            i < Math.round(review.rating)
                              ? "fill-amber-500 text-amber-500"
                              : "text-gray-300 dark:text-gray-700"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-xs italic text-[#6b5e4e] dark:text-[#d4cfc7]">
                      &quot;{review.comment}&quot;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
