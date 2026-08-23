"use client";

import { useState } from "react";
import { bookProperty } from "./actions";
import { Calendar, CreditCard, ShieldCheck, Users } from "lucide-react";

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
    return Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const nights = calculateNights();
  const basePrice = nights * pricePerNight;
  const serviceFee = Math.round(basePrice * 0.05); // 5% platform fee
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
        // Redirect to Chapa payment gateway
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
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Date Pickers Container */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#f8fafc] border border-[#e5e7eb] rounded-2xl">
        <div className="p-2 space-y-1">
          <label
            htmlFor="checkIn"
            className="block text-[10px] font-extrabold uppercase tracking-wider text-[#6b7280]"
          >
            Check-in
          </label>
          <div className="relative">
            <input
              type="date"
              id="checkIn"
              required
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full text-xs font-bold text-[#111827] bg-transparent outline-none cursor-pointer"
            />
          </div>
        </div>

        <div className="p-2 space-y-1 border-l border-[#e5e7eb]">
          <label
            htmlFor="checkOut"
            className="block text-[10px] font-extrabold uppercase tracking-wider text-[#6b7280]"
          >
            Check-out
          </label>
          <div className="relative">
            <input
              type="date"
              id="checkOut"
              required
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn || new Date().toISOString().split("T")[0]}
              className="w-full text-xs font-bold text-[#111827] bg-transparent outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Guests Dropdown */}
      <div className="space-y-1.5">
        <label
          htmlFor="guests"
          className="block text-[10px] font-extrabold uppercase tracking-wider text-[#6b7280]"
        >
          Guests
        </label>
        <div className="relative">
          <select
            id="guests"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full h-10 px-3 pl-9 rounded-xl border border-[#e5e7eb] bg-white text-xs font-bold text-[#111827] focus:border-[#7c3aed] outline-none"
          >
            <option value="1">1 guest</option>
            <option value="2">2 guests</option>
            <option value="3">3 guests</option>
            <option value="4">4 guests</option>
            <option value="5">5+ guests</option>
          </select>
          <Users className="w-4 h-4 text-[#6b7280] absolute left-3 top-3" />
        </div>
      </div>

      {/* Detailed Price Calculation Breakdown */}
      {nights > 0 && (
        <div className="space-y-2 pt-3 border-t border-[#e5e7eb] text-xs">
          <div className="flex justify-between text-[#6b7280]">
            <span>
              {pricePerNight.toLocaleString()} ETB × {nights}{" "}
              {nights === 1 ? "night" : "nights"}
            </span>
            <span className="font-semibold text-[#111827]">
              {basePrice.toLocaleString()} ETB
            </span>
          </div>
          <div className="flex justify-between text-[#6b7280]">
            <span>Service &amp; processing fee (5%)</span>
            <span className="font-semibold text-[#111827]">
              {serviceFee.toLocaleString()} ETB
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-[#e5e7eb] text-sm">
            <span className="font-extrabold text-[#111827]">Total</span>
            <span className="text-xl font-black text-[#7c3aed]">
              {totalPrice.toLocaleString()} ETB
            </span>
          </div>
        </div>
      )}

      {/* Reserve & Pay Button */}
      <button
        type="submit"
        disabled={loading || nights <= 0}
        className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] active:bg-[#5b21b6] text-white font-extrabold text-xs py-3.5 rounded-xl shadow-[0_4px_14px_0_rgb(124_58_237_/0.25)] hover:shadow-[0_6px_20px_0_rgb(124_58_237/_0.35)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
      >
        <CreditCard className="w-4 h-4" />
        <span>
          {loading ? "Redirecting to Chapa..." : "Reserve & Pay with Chapa"}
        </span>
      </button>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#6b7280] pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-[#7c3aed]" />
        <span>Secured by Chapa Payment Gateway</span>
      </div>
    </form>
  );
}
