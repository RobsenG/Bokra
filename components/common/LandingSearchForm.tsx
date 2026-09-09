"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Users } from "lucide-react";

interface LandingSearchFormProps {
  isLoggedIn: boolean;
}

export default function LandingSearchForm({ isLoggedIn }: LandingSearchFormProps) {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push("/login?message=Please+sign+in+to+search+and+book+properties");
      return;
    }
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("guests", guests);
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-[#12121a] rounded-2xl p-3 flex flex-col md:flex-row items-stretch md:items-center gap-3
                 border border-black/[0.08] dark:border-white/[0.08]
                 shadow-[0_8px_32px_rgba(0,0,0,0.08),0_0_0_1px_rgba(184,148,61,0.08)]
                 dark:shadow-[0_0_0_1px_rgba(201,168,76,0.1),0_24px_64px_rgba(0,0,0,0.6)]"
    >
      {/* Location */}
      <div className="flex-1 flex items-center gap-2.5 px-4 py-2 border-b md:border-b-0 md:border-r border-black/[0.06] dark:border-white/[0.06]">
        <MapPin className="w-5 h-5 text-[#b8943d] dark:text-[#c9a84c] shrink-0" />
        <div className="flex-1 text-left">
          <label className="label">Where</label>
          <input
            type="text"
            placeholder="Addis Ababa, Hawassa..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full bg-transparent border-none p-0 text-sm font-medium text-[#1a1208] dark:text-[#f8f6f0] focus:ring-0 placeholder-[#9b8e7e] dark:placeholder-[#5a5348] outline-none"
          />
        </div>
      </div>

      {/* Check-in */}
      <div className="w-full md:w-36 flex items-center gap-2.5 px-4 py-2 border-b md:border-b-0 md:border-r border-black/[0.06] dark:border-white/[0.06]">
        <Calendar className="w-5 h-5 text-[#b8943d] dark:text-[#c9a84c] shrink-0" />
        <div className="flex-1 text-left">
          <label className="label">Check In</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full bg-transparent border-none p-0 text-sm font-medium text-[#1a1208] dark:text-[#f8f6f0] focus:ring-0 outline-none"
          />
        </div>
      </div>

      {/* Check-out */}
      <div className="w-full md:w-36 flex items-center gap-2.5 px-4 py-2 border-b md:border-b-0 md:border-r border-black/[0.06] dark:border-white/[0.06]">
        <Calendar className="w-5 h-5 text-[#b8943d] dark:text-[#c9a84c] shrink-0" />
        <div className="flex-1 text-left">
          <label className="label">Check Out</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full bg-transparent border-none p-0 text-sm font-medium text-[#1a1208] dark:text-[#f8f6f0] focus:ring-0 outline-none"
          />
        </div>
      </div>

      {/* Guests */}
      <div className="w-full md:w-28 flex items-center gap-2.5 px-4 py-2">
        <Users className="w-5 h-5 text-[#b8943d] dark:text-[#c9a84c] shrink-0" />
        <div className="flex-1 text-left">
          <label className="label">Guests</label>
          <input
            type="number"
            placeholder="1"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            min="1"
            className="w-full bg-transparent border-none p-0 text-sm font-medium text-[#1a1208] dark:text-[#f8f6f0] focus:ring-0 placeholder-[#9b8e7e] dark:placeholder-[#5a5348] outline-none"
          />
        </div>
      </div>

      {/* Search Button */}
      <button
        type="submit"
        className="btn-primary h-12 px-6 rounded-xl flex items-center justify-center gap-2 shrink-0 cursor-pointer"
      >
        <Search className="w-4 h-4" />
        <span>Search</span>
      </button>
    </form>
  );
}
