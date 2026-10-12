"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const PERIODS = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "3months", label: "Last 3 Months" },
  { id: "6months", label: "Last 6 Months" },
  { id: "all", label: "All Time" },
];

export default function TimePeriodSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentPeriod = searchParams.get("period") || "all";

  const setPeriod = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", id);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-1">
      {PERIODS.map((period) => {
        const isActive = currentPeriod === period.id;
        return (
          <button
            key={period.id}
            onClick={() => setPeriod(period.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-[#b8943d] dark:bg-[#c9a84c] text-white dark:text-[#09090f] shadow-md shadow-[#b8943d]/20"
                : "bg-white dark:bg-[#141310] text-[#6b5e4e] dark:text-[#8a8278] border border-black/[0.08] dark:border-white/[0.06] hover:border-[#b8943d]/40 dark:hover:border-[#c9a84c]/40 hover:text-[#1a1208] dark:hover:text-[#f5f0e8]"
            }`}
          >
            {period.label}
          </button>
        );
      })}
    </div>
  );
}
