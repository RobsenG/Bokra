"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
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
    <div className="space-y-6 max-w-5xl mx-auto pb-12 print:p-0">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <Link
          href="/host/bookings"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to Bookings
        </Link>
        <div className="text-xs font-mono text-neutral-400">
          Booking #<span className="font-bold text-neutral-700 dark:text-neutral-300">{booking.id.slice(0, 8)}</span>
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
            : "bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-900/50"
        }`}
      >
        <div className="flex items-center gap-2.5">
          {status === "CONFIRMED" && <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />}
          {status === "PENDING" && <Clock className="size-5 text-amber-600 dark:text-amber-400" />}
          {status === "CANCELLED" && <XCircle className="size-5 text-red-600 dark:text-red-400" />}
          {status === "COMPLETED" && <ShieldCheck className="size-5 text-teal-600 dark:text-teal-400" />}
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
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="font-bold text-neutral-800 dark:text-white text-sm flex items-center gap-2">
                <User className="size-4 text-teal-600" /> Guest Details
              </h3>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  booking.renter.isReturning
                    ? "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/40"
                    : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40"
                }`}
              >
                {booking.renter.isReturning ? "Returning Guest" : "First Time Guest"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-900 flex items-center justify-center font-bold text-teal-700 dark:text-teal-300 text-lg overflow-hidden shrink-0">
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
                <p className="font-extrabold text-neutral-900 dark:text-white text-base">
                  {booking.renter.name || "Guest User"}
                </p>
                <p className="text-xs text-neutral-400">
                  Member since {new Date(booking.renter.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short" })}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-300 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Mail className="size-3.5 text-neutral-400" />
                <span className="font-medium">{booking.renter.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-3.5 text-neutral-400" />
                <span className="font-medium">{booking.renter.phone || "Not provided"}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Property Information */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="font-bold text-neutral-800 dark:text-white text-sm flex items-center gap-2">
                <Building className="size-4 text-teal-600" /> Property Information
              </h3>
            </div>

            <div className="flex items-start gap-3.5">
              {booking.property.images.length > 0 ? (
                <Image
                  src={booking.property.images[0]}
                  alt={booking.property.title}
                  width={80}
                  height={80}
                  className="rounded-xl object-cover size-20 shrink-0 border border-neutral-200 dark:border-neutral-800"
                />
              ) : (
                <div className="size-20 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 shrink-0">
                  <Building className="size-8" />
                </div>
              )}
              <div className="space-y-1">
                <Link
                  href={`/properties/${booking.property.id}`}
                  className="font-bold text-neutral-900 dark:text-white text-sm hover:text-teal-600 transition-colors line-clamp-2"
                >
                  {booking.property.title}
                </Link>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {booking.property.address}, {booking.property.city}
                </p>
                <p className="text-xs font-bold text-teal-700 dark:text-teal-300">
                  {booking.property.pricePerNight.toLocaleString()} ETB / night
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          {/* Card 3: Stay Details */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="font-bold text-neutral-800 dark:text-white text-sm flex items-center gap-2">
                <Calendar className="size-4 text-teal-600" /> Stay Details
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-100 dark:border-neutral-800">
                <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider mb-1">Check-in</p>
                <p className="font-extrabold text-neutral-800 dark:text-white text-xs">
                  {checkInDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-100 dark:border-neutral-800">
                <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider mb-1">Check-out</p>
                <p className="font-extrabold text-neutral-800 dark:text-white text-xs">
                  {checkOutDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-neutral-600 dark:text-neutral-300 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <span>Duration:</span>
              <span className="font-bold text-neutral-900 dark:text-white">{nights} {nights === 1 ? "night" : "nights"}</span>
            </div>

            <div className="flex justify-between items-center text-xs text-neutral-600 dark:text-neutral-300">
              <span>Booked on:</span>
              <span className="font-medium text-neutral-500">
                {new Date(booking.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          </div>

          {/* Card 4: Payment & Revenue Breakdown */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="font-bold text-neutral-800 dark:text-white text-sm flex items-center gap-2">
                <DollarSign className="size-4 text-emerald-600" /> Payment &amp; Revenue Breakdown
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Price per night:</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{booking.property.pricePerNight.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Nights reserved:</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">× {nights}</span>
              </div>
              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-2 flex justify-between font-bold text-neutral-900 dark:text-white">
                <span>Gross Subtotal:</span>
                <span>{booking.totalPrice.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between text-orange-600 dark:text-orange-400">
                <span>Platform fee (3%):</span>
                <span>- {platformFee.toLocaleString()} ETB</span>
              </div>
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-2 flex justify-between font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                <span>Your Net Earnings:</span>
                <span>{hostEarnings.toLocaleString()} ETB</span>
              </div>
            </div>

            {booking.payment && (
              <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500 space-y-1">
                <div className="flex justify-between">
                  <span>Payment Gateway Ref:</span>
                  <span className="font-mono font-bold text-neutral-700 dark:text-neutral-300">{booking.payment.chapaReference || "Chapa"}</span>
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
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            {status === "CONFIRMED" && isPastCheckOut && "Check-out date has passed. You can mark this stay as completed."}
            {status === "CONFIRMED" && !isPastCheckOut && "Stay is currently in progress or upcoming."}
            {status === "COMPLETED" && "This stay has been completed."}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {status === "CONFIRMED" && isPastCheckOut && (
              <button
                onClick={handleMarkCompleted}
                disabled={loading}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                Mark as Completed
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-750 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="size-3.5" /> Print Summary
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
