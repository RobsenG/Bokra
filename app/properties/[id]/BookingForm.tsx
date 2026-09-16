"use client";

import { useState } from "react";
import { bookProperty } from "./actions";
import { Calendar, CreditCard, ShieldCheck, Users, Loader2 } from "lucide-react";

export default function BookingForm({
  propertyId,
  pricePerNight,
}: {
  propertyId: string;
  pricePerNight: number;
}) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (start >= end) return 0;
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();
  const basePrice = nights * pricePerNight;
  const serviceFee = Math.round(basePrice * 0.05);
  const totalPrice = basePrice + serviceFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nights <= 0) {
      setError("Please select valid check-in and check-out dates.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await bookProperty(propertyId, checkIn, checkOut);
      if (res?.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        throw new Error("Could not initialize payment gateway.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while booking.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-sans">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-[rgba(239,68,68,0.08)] border border-red-200 dark:border-[rgba(239,68,68,0.15)] text-red-600 dark:text-[#fca5a5] rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Date Pickers */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-black/[0.03] dark:bg-[#fff8dc]/[0.03] border border-black/[0.06] dark:border-[#fff8dc]/[0.07] rounded-2xl">
        <div className="p-2 space-y-1">
          <label htmlFor="checkIn" className="label">Check-in</label>
          <input
            type="date"
            id="checkIn"
            required
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full text-xs font-bold text-[#1a1208] dark:text-[#d4cfc7] bg-transparent outline-none cursor-pointer"
          />
        </div>
        <div className="p-2 space-y-1 border-l border-black/[0.06] dark:border-[#fff8dc]/[0.06]">
          <label htmlFor="checkOut" className="label">Check-out</label>
          <input
            type="date"
            id="checkOut"
            required
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || new Date().toISOString().split("T")[0]}
            className="w-full text-xs font-bold text-[#1a1208] dark:text-[#d4cfc7] bg-transparent outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Guests */}
      <div className="space-y-1.5">
        <label htmlFor="guests" className="label">Guests</label>
        <div className="relative">
          <select
            id="guests"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full h-10 px-3 pl-9 rounded-xl border border-black/[0.08] dark:border-[#fff8dc]/[0.07] bg-white dark:bg-[#fff8dc]/[0.03] text-xs font-bold text-[#1a1208] dark:text-[#d4cfc7] focus:border-[#b8943d] dark:focus:border-[#c9a84c]/30 outline-none cursor-pointer"
          >
            <option value="1" className="dark:bg-[#1c1a16] dark:text-[#d4cfc7]">1 guest</option>
            <option value="2" className="dark:bg-[#1c1a16] dark:text-[#d4cfc7]">2 guests</option>
            <option value="3" className="dark:bg-[#1c1a16] dark:text-[#d4cfc7]">3 guests</option>
            <option value="4" className="dark:bg-[#1c1a16] dark:text-[#d4cfc7]">4 guests</option>
            <option value="5" className="dark:bg-[#1c1a16] dark:text-[#d4cfc7]">5+ guests</option>
          </select>
          <Users className="w-4 h-4 text-[#b8943d] dark:text-[#c9a84c] absolute left-3 top-3" />
        </div>
      </div>

      {/* Price Breakdown */}
      {nights > 0 && (
        <div className="space-y-2 p-3 bg-neutral-50 dark:bg-[#fff8dc]/[0.02] border border-neutral-100 dark:border-[#fff8dc]/[0.05] rounded-xl text-xs">
          <div className="flex justify-between text-[#9b8e7e] dark:text-[#8a8278]">
            <span>{pricePerNight.toLocaleString()} ETB × {nights} {nights === 1 ? "night" : "nights"}</span>
            <span className="font-semibold text-[#1a1208] dark:text-[#d4cfc7]">{basePrice.toLocaleString()} ETB</span>
          </div>
          <div className="flex justify-between text-[#9b8e7e] dark:text-[#8a8278]">
            <span>Service &amp; processing fee (5%)</span>
            <span className="font-semibold text-[#1a1208] dark:text-[#d4cfc7]">{serviceFee.toLocaleString()} ETB</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-black/[0.06] dark:border-[#fff8dc]/[0.05] text-sm">
            <span className="font-extrabold text-[#1a1208] dark:text-[#f5f0e8]">Total</span>
            <span className="text-xl font-black text-[#b8943d] dark:text-[#c9a84c]">
              {totalPrice.toLocaleString()} ETB
            </span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || nights <= 0}
        className="btn-primary w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Redirecting to Chapa...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            Reserve &amp; Pay with Chapa
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#9b8e7e] dark:text-[#524d47] pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-[#b8943d] dark:text-[#c9a84c]" />
        <span>Secured by Chapa Payment Gateway</span>
      </div>
    </form>
  );
}
