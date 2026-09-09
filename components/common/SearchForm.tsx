"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, Calendar, Users, SlidersHorizontal, Wand2, Loader2, Sparkles } from "lucide-react";

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
  const [aiQuery, setAiQuery] = useState("");
  const [showAiSearch, setShowAiSearch] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiApplied, setAiApplied] = useState(false);

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

    router.push(`/properties?${params.toString()}`);
  };

  const handleAiSearch = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiError("");
    setAiApplied(false);
    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: aiQuery }),
      });
      if (!res.ok) throw new Error("AI search failed");
      const { filters } = await res.json();

      // Apply filters to form state
      if (filters.city) setCity(filters.city);
      if (filters.maxPrice) setMaxPrice(String(filters.maxPrice));
      if (filters.bedrooms) setBedrooms(String(filters.bedrooms));
      setShowAdvanced(true);
      setAiApplied(true);
    } catch (err) {
      console.error(err);
      setAiError("AI could not parse your search. Try being more specific.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3 font-sans">
      {/* AI Natural Language Search Toggle */}
      <div className="flex items-center justify-end mb-1">
        <button
          type="button"
          onClick={() => { setShowAiSearch(!showAiSearch); setAiApplied(false); setAiError(""); }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer ${
            showAiSearch
              ? "bg-[#b8943d] dark:bg-[#c9a84c] border-[#b8943d] dark:border-[#c9a84c] text-white shadow-md shadow-[#b8943d]/20"
              : "border-[#b8943d]/30 dark:border-[#c9a84c]/30 text-[#b8943d] dark:text-[#c9a84c] hover:bg-[#b8943d]/10 dark:hover:bg-[#c9a84c]/10"
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          Search with AI ✨
        </button>
      </div>

      {/* AI Search Box */}
      {showAiSearch && (
        <div className="bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 border border-[#b8943d]/20 dark:border-[#c9a84c]/20 rounded-2xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-[#b8943d] dark:text-[#c9a84c] text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Describe what you&apos;re looking for in plain English</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAiSearch()}
              placeholder="e.g. A cozy 2-bedroom place in Hawassa under 3000 ETB with WiFi..."
              className="flex-1 h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a2e] text-sm text-neutral-900 dark:text-white focus:border-[#b8943d] dark:focus:border-[#c9a84c] focus:ring-2 focus:ring-[#b8943d]/20 outline-none transition-all placeholder:text-neutral-400"
            />
            <button
              type="button"
              onClick={handleAiSearch}
              disabled={aiLoading || !aiQuery.trim()}
              className="h-11 px-4 rounded-xl bg-[#b8943d] hover:bg-[#a38233] dark:bg-[#c9a84c] dark:hover:bg-[#b8943d] text-white font-semibold flex items-center gap-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-md shadow-[#b8943d]/15"
            >
              {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {aiLoading ? "Parsing..." : "Parse"}
            </button>
          </div>
          {aiError && (
            <p className="text-xs text-red-600 dark:text-red-400 font-medium px-1">{aiError}</p>
          )}
          {aiApplied && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
              <span>✅ Filters applied from your AI query! Review below and click Search.</span>
            </div>
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#12121e] p-4 md:p-3 rounded-2xl shadow-xl flex flex-col md:flex-row items-stretch md:items-center gap-3 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white"
      >
        {/* Location */}
        <div className="flex-1 flex items-center gap-2.5 px-3 py-2 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800">
          <MapPin className="w-5 h-5 text-[#b8943d] dark:text-[#c9a84c] shrink-0" />
          <div className="flex-1 text-left">
            <label className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Where</label>
            <input
              type="text"
              placeholder="Addis Ababa, Hawassa..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-transparent border-none p-0 text-sm font-medium focus:ring-0 placeholder:text-neutral-400 text-neutral-900 dark:text-white outline-none"
            />
          </div>
        </div>

        {/* Check In */}
        <div className="w-full md:w-40 flex items-center gap-2.5 px-3 py-2 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800">
          <Calendar className="w-5 h-5 text-[#b8943d] dark:text-[#c9a84c] shrink-0" />
          <div className="flex-1 text-left">
            <label className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Check In</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-transparent border-none p-0 text-sm font-medium focus:ring-0 text-neutral-900 dark:text-white outline-none"
            />
          </div>
        </div>

        {/* Check Out */}
        <div className="w-full md:w-40 flex items-center gap-2.5 px-3 py-2 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800">
          <Calendar className="w-5 h-5 text-[#b8943d] dark:text-[#c9a84c] shrink-0" />
          <div className="flex-1 text-left">
            <label className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Check Out</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-transparent border-none p-0 text-sm font-medium focus:ring-0 text-neutral-900 dark:text-white outline-none"
            />
          </div>
        </div>

        {/* Guests */}
        <div className="w-full md:w-32 flex items-center gap-2.5 px-3 py-2">
          <Users className="w-5 h-5 text-[#b8943d] dark:text-[#c9a84c] shrink-0" />
          <div className="flex-1 text-left">
            <label className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Guests</label>
            <input
              type="number"
              placeholder="Guests"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              min="1"
              className="w-full bg-transparent border-none p-0 text-sm font-medium focus:ring-0 placeholder:text-neutral-400 text-neutral-900 dark:text-white outline-none"
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
                ? "bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 border-[#b8943d]/30 dark:border-[#c9a84c]/30 text-[#b8943d] dark:text-[#c9a84c]"
                : "border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            }`}
            title="Advanced Filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            type="submit"
            className="flex-1 md:flex-none bg-[#b8943d] hover:bg-[#a38233] dark:bg-[#c9a84c] dark:hover:bg-[#b8943d] text-white font-semibold h-11 px-5 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#b8943d]/15 transition-all cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </div>
      </form>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="bg-white dark:bg-[#12121e] border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-200 text-neutral-900 dark:text-white">
          {/* Min Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Min Price (ETB)</label>
            <input
              type="number"
              placeholder="E.g. 1000"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a2e] text-sm focus:border-[#b8943d] dark:focus:border-[#c9a84c] focus:ring-2 focus:ring-[#b8943d]/20 outline-none text-neutral-900 dark:text-white"
            />
          </div>

          {/* Max Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Max Price (ETB)</label>
            <input
              type="number"
              placeholder="E.g. 10000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a2e] text-sm focus:border-[#b8943d] dark:focus:border-[#c9a84c] focus:ring-2 focus:ring-[#b8943d]/20 outline-none text-neutral-900 dark:text-white"
            />
          </div>

          {/* Bedrooms */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Bedrooms</label>
            <input
              type="number"
              placeholder="Any"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              min="0"
              className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a2e] text-sm focus:border-[#b8943d] dark:focus:border-[#c9a84c] focus:ring-2 focus:ring-[#b8943d]/20 outline-none text-neutral-900 dark:text-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}
