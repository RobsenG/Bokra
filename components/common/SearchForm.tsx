"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, Calendar, Users, SlidersHorizontal } from "lucide-react";

export default function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [city, setCity] = useState(searchParams.get("city") || "");
  const [checkIn, setCheckIn] = useState(searchParams.get("checkIn") || "");
  const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") || "");
  const [guests, setGuests] = useState(searchParams.get("guests") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "");

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (city) params.set("city", city);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("guests", guests);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (bedrooms) params.set("bedrooms", bedrooms);

    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-neutral-900 p-4 md:p-3 rounded-2xl shadow-2xl flex flex-col md:flex-row items-stretch md:items-center gap-3 border border-neutral-100 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200"
      >
        {/* Location */}
        <div className="flex-1 flex items-center gap-2.5 px-3 py-2 border-b md:border-b-0 md:border-r border-neutral-100 dark:border-neutral-800">
          <MapPin className="size-5 text-teal-600 shrink-0" />
          <div className="flex-1 text-left">
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Where</label>
            <input
              type="text"
              placeholder="Addis Ababa, Hawassa..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-transparent border-none p-0 text-sm font-medium focus:ring-0 placeholder-neutral-400 outline-none"
            />
          </div>
        </div>

        {/* Check In */}
        <div className="w-full md:w-40 flex items-center gap-2.5 px-3 py-2 border-b md:border-b-0 md:border-r border-neutral-100 dark:border-neutral-800">
          <Calendar className="size-5 text-teal-600 shrink-0" />
          <div className="flex-1 text-left">
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Check In</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-transparent border-none p-0 text-sm font-medium focus:ring-0 text-neutral-600 dark:text-neutral-300 outline-none"
            />
          </div>
        </div>

        {/* Check Out */}
        <div className="w-full md:w-40 flex items-center gap-2.5 px-3 py-2 border-b md:border-b-0 md:border-r border-neutral-100 dark:border-neutral-800">
          <Calendar className="size-5 text-teal-600 shrink-0" />
          <div className="flex-1 text-left">
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Check Out</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-transparent border-none p-0 text-sm font-medium focus:ring-0 text-neutral-600 dark:text-neutral-300 outline-none"
            />
          </div>
        </div>

        {/* Guests */}
        <div className="w-full md:w-32 flex items-center gap-2.5 px-3 py-2">
          <Users className="size-5 text-teal-600 shrink-0" />
          <div className="flex-1 text-left">
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Guests</label>
            <input
              type="number"
              placeholder="Guests"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              min="1"
              className="w-full bg-transparent border-none p-0 text-sm font-medium focus:ring-0 placeholder-neutral-400 outline-none"
            />
          </div>
        </div>

        {/* Toggle Filters & Submit */}
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`p-3 rounded-xl border transition-colors flex items-center justify-center cursor-pointer ${
              showAdvanced
                ? "bg-teal-50 border-teal-200 text-teal-600 dark:bg-teal-950/20 dark:border-teal-900/30"
                : "border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-850"
            }`}
            title="Advanced Filters"
          >
            <SlidersHorizontal className="size-4" />
          </button>

          <button
            type="submit"
            className="flex-1 md:flex-none bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold h-11 px-5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-teal-600/10 cursor-pointer"
          >
            <Search className="size-4" />
            <span>Search</span>
          </button>
        </div>
      </form>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 p-5 rounded-2xl shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-200 text-neutral-800 dark:text-neutral-200">
          {/* Min Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Min Price (ETB)</label>
            <input
              type="number"
              placeholder="E.g. 1000"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none"
            />
          </div>

          {/* Max Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Max Price (ETB)</label>
            <input
              type="number"
              placeholder="E.g. 10000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none"
            />
          </div>

          {/* Bedrooms */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Bedrooms</label>
            <input
              type="number"
              placeholder="Any"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              min="0"
              className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
