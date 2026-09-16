import React from "react";

export default function AdminRevenueLoading() {
  return (
    <div className="space-y-8 pb-12 font-sans animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-48 bg-neutral-200 dark:bg-[#1c1a16] rounded-lg mb-2" />
        <div className="h-4 w-72 bg-neutral-100 dark:bg-[#141310] rounded-md" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#141310] rounded-2xl border border-neutral-200 dark:border-[#fff8dc]/[0.06] p-5 space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-28 bg-neutral-200 dark:bg-[#1c1a16] rounded-md" />
              <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-[#1c1a16]" />
            </div>
            <div className="h-7 w-36 bg-neutral-200 dark:bg-[#1c1a16] rounded-lg" />
            <div className="h-3 w-40 bg-neutral-100 dark:bg-[#141310] rounded-md" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="bg-white dark:bg-[#141310] rounded-2xl border border-neutral-200 dark:border-[#fff8dc]/[0.06] p-6 space-y-4">
        <div className="h-5 w-56 bg-neutral-200 dark:bg-[#1c1a16] rounded-md" />
        <div className="h-40 bg-neutral-100 dark:bg-[#1c1a16] rounded-xl w-full" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-white dark:bg-[#141310] border border-neutral-200 dark:border-[#fff8dc]/[0.06] rounded-2xl p-6 space-y-4">
        <div className="h-5 w-48 bg-neutral-200 dark:bg-[#1c1a16] rounded-md" />
        <div className="space-y-3 pt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-neutral-100 dark:bg-[#1c1a16] rounded-lg w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
