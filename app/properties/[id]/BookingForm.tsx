"use client";

import { useState } from "react";
import { bookProperty } from "./actions";
import { Calendar, CreditCard } from "lucide-react";

export default function BookingForm({ 
  propertyId, 
  pricePerNight 
}: { 
  propertyId: string;
  pricePerNight: number;
}) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateTotalPrice = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (start >= end) return 0;
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights * pricePerNight;
  };

  const totalPrice = calculateTotalPrice();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await bookProperty(propertyId, checkIn, checkOut);
      if (res?.checkoutUrl) {
        // Redirect to Chapa payment portal
        window.location.href = res.checkoutUrl;
      } else {
        throw new Error("Could not initialize checkout gateway.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while booking.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-sans">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}
      
      <div className="space-y-1.5">
        <label htmlFor="checkIn" className="block text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
          Check-in Date
        </label>
        <div className="relative">
          <input 
            type="date" 
            id="checkIn" 
            required 
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full h-11 px-4 pl-10 rounded-xl border border-[#e5e7eb] bg-white text-sm text-[#111827] focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 outline-none transition-all"
          />
          <Calendar className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-3.5" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="checkOut" className="block text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
          Check-out Date
        </label>
        <div className="relative">
          <input 
            type="date" 
            id="checkOut" 
            required 
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || new Date().toISOString().split("T")[0]}
            className="w-full h-11 px-4 pl-10 rounded-xl border border-[#e5e7eb] bg-white text-sm text-[#111827] focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 outline-none transition-all"
          />
          <Calendar className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-3.5" />
        </div>
      </div>

      {totalPrice > 0 && (
        <div className="flex justify-between items-center py-3.5 border-t border-b border-[#e5e7eb] text-sm">
          <span className="font-semibold text-[#6b7280]">Total Price</span>
          <span className="text-lg font-black text-[#7c3aed]">
            {totalPrice.toLocaleString()} ETB
          </span>
        </div>
      )}

      <button 
        type="submit" 
        disabled={loading || totalPrice <= 0}
        className="w-full bg-[#7c3aed] hover:bg-[#5b21b6] active:bg-[#4c1d95] text-white font-semibold text-xs py-3 rounded-xl shadow-[0_4px_14px_0_rgb(124_58_237_/0.25)] flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
      >
        <CreditCard className="w-4 h-4" />
        <span>{loading ? "Initializing payment..." : "Reserve & Pay with Chapa"}</span>
      </button>
    </form>
  );
}
