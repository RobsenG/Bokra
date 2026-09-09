"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Building,
  User,
  Mail,
  Phone,
  Printer,
  Loader2,
  DollarSign,
  ShieldCheck,
} from "lucide-react";
import { calculatePlatformFee, calculateNetAmount } from "@/lib/platform";
import { markBookingAsCompleted } from "../actions";

interface BookingDetailClientProps {
  booking: {
    id: string;
    checkIn: string;
    checkOut: string;
    totalPrice: number;
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
    createdAt: string;
    renter: {
      id: string;
      name: string | null;
      email: string;
      phone: string | null;
      avatar: string | null;
      createdAt: string;
      isReturning: boolean;
    };
    property: {
      id: string;
      title: string;
      address: string;
      city: string;
      images: string[];
      pricePerNight: number;
    };
    payment: {
      id: string;
      amount: number;
      currency: string;
      status: string;
      chapaReference: string | null;
      createdAt: string;
    } | null;
  };
}

export default function BookingDetailClient({ booking }: BookingDetailClientProps) {
  const [status, setStatus] = useState(booking.status);
  const [loading, setLoading] = useState(false);

  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);
  const nights = Math.max(
    1,
    Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
  );

  const platformFee = calculatePlatformFee(booking.totalPrice);
  const hostEarnings = calculateNetAmount(booking.totalPrice);
  const isPastCheckOut = new Date() > checkOutDate;

  const handleMarkCompleted = async () => {
    setLoading(true);
    try {
      const res = await markBookingAsCompleted(booking.id);
      if (res.success) {
        setStatus("COMPLETED");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 print:p-0 font-sans">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <Link
          href="/host/bookings"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#6b5e4e] dark:text-[#9b9080] hover:text-[#b8943d] dark:hover:text-[#c9a84c] transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to Bookings
        </Link>
        <div className="text-xs font-mono text-[#6b5e4e] dark:text-[#9b9080]">
          Booking #<span className="font-bold text-[#1a1208] dark:text-[#f8f6f0]">{booking.id.slice(0, 8)}</span>
        </div>
      </div>

      {/* Status Banner */}
      <div
        className={`w-full p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm font-bold shadow-xs ${
          status === "CONFIRMED"
            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50"
            : status === "PENDING"
            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/50"
            : status === "CANCELLED"
            ? "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900/50"
            : "bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] border border-[#b8943d]/20 dark:border-[#c9a84c]/20"
        }`}
      >
        <div className="flex items-center gap-2.5">
          {status === "CONFIRMED" && <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />}
          {status === "PENDING" && <Clock className="size-5 text-amber-600 dark:text-amber-400" />}
          {status === "CANCELLED" && <XCircle className="size-5 text-red-600 dark:text-red-400" />}
          {status === "COMPLETED" && <ShieldCheck className="size-5 text-[#b8943d] dark:text-[#c9a84c]" />}
          <span>
            {status === "CONFIRMED" && "✓ Booking Confirmed & Paid"}
            {status === "PENDING" && "⏳ Awaiting Payment"}
            {status === "CANCELLED" && "✗ Booking Cancelled"}
            {status === "COMPLETED" && "✓ Stay Completed"}
          </span>
        </div>
        <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-white/60 dark:bg-black/20">
          {status}
        </span>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          
          {/* Card 1: Renter Information */}
          <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-black/[0.08] dark:border-white/[0.06] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
              <h3 className="font-bold text-[#1a1208] dark:text-[#f8f6f0] text-sm flex items-center gap-2">
                <User className="size-4 text-[#b8943d] dark:text-[#c9a84c]" /> Guest Details
              </h3>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  booking.renter.isReturning
                    ? "bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] border border-[#b8943d]/20 dark:border-[#c9a84c]/20"
                    : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40"
                }`}
              >
                {booking.renter.isReturning ? "Returning Guest" : "First Time Guest"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 border border-[#b8943d]/20 dark:border-[#c9a84c]/20 flex items-center justify-center font-bold text-[#b8943d] dark:text-[#c9a84c] text-lg overflow-hidden shrink-0">
                {booking.renter.avatar ? (
                  <Image
                    src={booking.renter.avatar}
                    alt="Renter Avatar"
                    width={48}
                    height={48}
                    className="object-cover size-full"
                  />
                ) : (
                  (booking.renter.name?.[0] || booking.renter.email[0]).toUpperCase()
                )}
              </div>
              <div className="space-y-0.5">
                <p className="font-extrabold text-[#1a1208] dark:text-[#f8f6f0] text-base">
                  {booking.renter.name || "Guest User"}
                </p>
                <p className="text-xs text-[#6b5e4e] dark:text-[#9b9080]">
                  Member since {new Date(booking.renter.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short" })}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-[#6b5e4e] dark:text-[#9b9080] pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Mail className="size-3.5 text-[#6b5e4e] dark:text-[#9b9080]" />
                <span className="font-medium">{booking.renter.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-3.5 text-[#6b5e4e] dark:text-[#9b9080]" />
                <span className="font-medium">{booking.renter.phone || "Not provided"}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Property Information */}
          <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-black/[0.08] dark:border-white/[0.06] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
              <h3 className="font-bold text-[#1a1208] dark:text-[#f8f6f0] text-sm flex items-center gap-2">
                <Building className="size-4 text-[#b8943d] dark:text-[#c9a84c]" /> Property Information
              </h3>
            </div>

            <div className="flex items-start gap-3.5">
              {booking.property.images.length > 0 ? (
                <Image
                  src={booking.property.images[0]}
                  alt={booking.property.title}
                  width={80}
                  height={80}
                  className="rounded-xl object-cover size-20 shrink-0 border border-black/[0.08] dark:border-white/[0.06]"
                />
              ) : (
                <div className="size-20 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-[#6b5e4e] dark:text-[#9b9080] shrink-0">
                  <Building className="size-8" />
                </div>
              )}
              <div className="space-y-1">
                <Link
                  href={`/properties/${booking.property.id}`}
                  className="font-bold text-[#1a1208] dark:text-[#f8f6f0] text-sm hover:text-[#b8943d] dark:hover:text-[#c9a84c] transition-colors line-clamp-2"
                >
                  {booking.property.title}
                </Link>
                <p className="text-xs text-[#6b5e4e] dark:text-[#9b9080]">
                  {booking.property.address}, {booking.property.city}
                </p>
                <p className="text-xs font-bold text-[#b8943d] dark:text-[#c9a84c]">
                  {booking.property.pricePerNight.toLocaleString()} ETB / night
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          {/* Card 3: Stay Details */}
          <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-black/[0.08] dark:border-white/[0.06] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
              <h3 className="font-bold text-[#1a1208] dark:text-[#f8f6f0] text-sm flex items-center gap-2">
                <Calendar className="size-4 text-[#b8943d] dark:text-[#c9a84c]" /> Stay Details
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-[#f5f3ef] dark:bg-[#1a1a2e] rounded-xl border border-black/[0.06] dark:border-white/[0.06]">
                <p className="text-[10px] text-[#6b5e4e] dark:text-[#9b9080] uppercase font-bold tracking-wider mb-1">Check-in</p>
                <p className="font-extrabold text-[#1a1208] dark:text-[#f8f6f0] text-xs">
                  {checkInDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <div className="p-3 bg-[#f5f3ef] dark:bg-[#1a1a2e] rounded-xl border border-black/[0.06] dark:border-white/[0.06]">
                <p className="text-[10px] text-[#6b5e4e] dark:text-[#9b9080] uppercase font-bold tracking-wider mb-1">Check-out</p>
                <p className="font-extrabold text-[#1a1208] dark:text-[#f8f6f0] text-xs">
                  {checkOutDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-[#6b5e4e] dark:text-[#9b9080] pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
              <span>Duration:</span>
              <span className="font-bold text-[#1a1208] dark:text-[#f8f6f0]">{nights} {nights === 1 ? "night" : "nights"}</span>
            </div>

            <div className="flex justify-between items-center text-xs text-[#6b5e4e] dark:text-[#9b9080]">
              <span>Booked on:</span>
              <span className="font-medium text-[#6b5e4e] dark:text-[#9b9080]">
                {new Date(booking.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          </div>

          {/* Card 4: Payment & Revenue Breakdown */}
          <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-black/[0.08] dark:border-white/[0.06] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
              <h3 className="font-bold text-[#1a1208] dark:text-[#f8f6f0] text-sm flex items-center gap-2">
                <DollarSign className="size-4 text-emerald-600 dark:text-emerald-400" /> Payment &amp; Revenue Breakdown
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#6b5e4e] dark:text-[#9b9080]">
                <span>Price per night:</span>
                <span className="font-semibold text-[#1a1208] dark:text-[#f8f6f0]">{booking.property.pricePerNight.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between text-[#6b5e4e] dark:text-[#9b9080]">
                <span>Nights reserved:</span>
                <span className="font-semibold text-[#1a1208] dark:text-[#f8f6f0]">× {nights}</span>
              </div>
              <div className="border-t border-black/[0.06] dark:border-white/[0.06] pt-2 flex justify-between font-bold text-[#1a1208] dark:text-[#f8f6f0]">
                <span>Gross Subtotal:</span>
                <span>{booking.totalPrice.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between text-orange-600 dark:text-orange-400">
                <span>Platform fee (3%):</span>
                <span>- {platformFee.toLocaleString()} ETB</span>
              </div>
              <div className="border-t border-black/10 dark:border-white/10 pt-2 flex justify-between font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                <span>Your Net Earnings:</span>
                <span>{hostEarnings.toLocaleString()} ETB</span>
              </div>
            </div>

            {booking.payment && (
              <div className="mt-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] text-[11px] text-[#6b5e4e] dark:text-[#9b9080] space-y-1">
                <div className="flex justify-between">
                  <span>Payment Gateway Ref:</span>
                  <span className="font-mono font-bold text-[#1a1208] dark:text-[#f8f6f0]">{booking.payment.chapaReference || "Chapa"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Date:</span>
                  <span>{new Date(booking.payment.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Bottom Action Bar */}
      {(status === "CONFIRMED" || status === "COMPLETED") && (
        <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-black/[0.08] dark:border-white/[0.06] p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-[#6b5e4e] dark:text-[#9b9080]">
            {status === "CONFIRMED" && isPastCheckOut && "Check-out date has passed. You can mark this stay as completed."}
            {status === "CONFIRMED" && !isPastCheckOut && "Stay is currently in progress or upcoming."}
            {status === "COMPLETED" && "This stay has been completed."}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {status === "CONFIRMED" && isPastCheckOut && (
              <button
                onClick={handleMarkCompleted}
                disabled={loading}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#b8943d] dark:bg-[#c9a84c] hover:brightness-110 text-white dark:text-[#0a0a0f] font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                Mark as Completed
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-[#1a1208] dark:text-[#f8f6f0] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="size-3.5" /> Print Summary
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
