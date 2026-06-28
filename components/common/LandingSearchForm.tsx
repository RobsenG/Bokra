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
      className="bg-white rounded-2xl shadow-2xl p-3 flex flex-col md:flex-row items-stretch md:items-center gap-3 border border-white/10"
    >
      {/* Location */}
      <div className="flex-1 flex items-center gap-2.5 px-4 py-2 border-b md:border-b-0 md:border-r border-neutral-100">
        <MapPin className="size-5 text-teal-600 shrink-0" />
        <div className="flex-1 text-left">
          <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Where</label>
          <input
            type="text"
            placeholder="Addis Ababa, Hawassa..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full bg-transparent border-none p-0 text-sm font-medium text-neutral-700 focus:ring-0 placeholder-neutral-400 outline-none"
          />
        </div>
      </div>

      {/* Check-in */}
      <div className="w-full md:w-36 flex items-center gap-2.5 px-4 py-2 border-b md:border-b-0 md:border-r border-neutral-100">
        <Calendar className="size-5 text-teal-600 shrink-0" />
        <div className="flex-1 text-left">
          <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Check In</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full bg-transparent border-none p-0 text-sm font-medium text-neutral-600 focus:ring-0 outline-none"
          />
        </div>
      </div>

      {/* Check-out */}
      <div className="w-full md:w-36 flex items-center gap-2.5 px-4 py-2 border-b md:border-b-0 md:border-r border-neutral-100">
        <Calendar className="size-5 text-teal-600 shrink-0" />
        <div className="flex-1 text-left">
          <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Check Out</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full bg-transparent border-none p-0 text-sm font-medium text-neutral-600 focus:ring-0 outline-none"
          />
        </div>
      </div>

      {/* Guests */}
      <div className="w-full md:w-28 flex items-center gap-2.5 px-4 py-2">
        <Users className="size-5 text-teal-600 shrink-0" />
        <div className="flex-1 text-left">
          <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Guests</label>
          <input
            type="number"
            placeholder="1"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            min="1"
            className="w-full bg-transparent border-none p-0 text-sm font-medium text-neutral-700 focus:ring-0 placeholder-neutral-400 outline-none"
          />
        </div>
      </div>

      {/* Search Button */}
      <button
        type="submit"
        className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold h-12 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 transition-colors shrink-0"
      >
        <Search className="size-4" />
        <span>Search Properties</span>
      </button>
    </form>
  );
}
