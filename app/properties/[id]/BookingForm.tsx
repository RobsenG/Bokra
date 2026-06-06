"use client";

import { useState } from "react";
import { bookProperty } from "./actions";
import { Calendar, CreditCard, Sparkles } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}
      
      <div className="space-y-1.5">
        <label htmlFor="checkIn" className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
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
            className="w-full h-11 px-4 pl-10 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none text-neutral-800 dark:text-neutral-100"
          />
          <Calendar className="size-4 text-neutral-400 absolute left-3.5 top-3.5" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="checkOut" className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
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
            className="w-full h-11 px-4 pl-10 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none text-neutral-800 dark:text-neutral-100"
          />
          <Calendar className="size-4 text-neutral-400 absolute left-3.5 top-3.5" />
        </div>
      </div>

      {totalPrice > 0 && (
        <div className="flex justify-between items-center py-3.5 border-t border-b border-neutral-100 dark:border-neutral-800 text-sm">
          <span className="font-semibold text-neutral-600 dark:text-neutral-400">Total Price</span>
          <span className="text-lg font-black text-teal-700 dark:text-teal-300">
            {totalPrice.toLocaleString()} ETB
          </span>
        </div>
      )}

      <button 
        type="submit" 
        disabled={loading || totalPrice <= 0}
        className="w-full h-11 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-md shadow-teal-600/10 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <CreditCard className="size-4" />
        <span>{loading ? "Initializing payment..." : "Reserve & Pay with Chapa"}</span>
      </button>
    </form>
  );
}
