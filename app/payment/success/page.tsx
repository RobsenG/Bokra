import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Home, ListTodo, MapPin, Calendar } from "lucide-react";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string }>;
}) {
  const { bookingId } = await searchParams;

  if (!bookingId) {
    redirect("/");
  }

  // Reference format: booking-${bookingId}
  const cleanBookingId = bookingId.replace("booking-", "");

  const booking = await prisma.booking.findUnique({
    where: { id: cleanBookingId },
    include: {
      property: true,
    },
  });

  if (!booking) {
    redirect("/");
  }

  // If the payment/booking was cancelled or failed, redirect to the failed page
  if (booking.status === "CANCELLED") {
    redirect("/payment/failed");
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl shadow-xl overflow-hidden p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center animate-bounce-short">
            <CheckCircle2 className="size-10 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Booking Confirmed!
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
            Your payment was successful. Your booking is confirmed.
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl p-4 text-left space-y-3 border border-neutral-100 dark:border-neutral-800">
          <h3 className="font-bold text-neutral-800 dark:text-neutral-200 text-sm line-clamp-1">
            {booking.property.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <MapPin className="size-3.5 text-teal-600" />
            <span>{booking.property.city}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/65 text-xs">
            <div>
              <p className="text-neutral-400 dark:text-neutral-500 font-medium">Check-in</p>
              <p className="font-semibold text-neutral-700 dark:text-neutral-300 mt-0.5">
                {new Date(booking.checkIn).toLocaleDateString(undefined, { dateStyle: "medium" })}
              </p>
            </div>
            <div>
              <p className="text-neutral-400 dark:text-neutral-500 font-medium">Check-out</p>
              <p className="font-semibold text-neutral-700 dark:text-neutral-300 mt-0.5">
                {new Date(booking.checkOut).toLocaleDateString(undefined, { dateStyle: "medium" })}
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/65 flex justify-between items-center text-xs">
            <span className="text-neutral-400 dark:text-neutral-500">Amount Paid</span>
            <span className="font-extrabold text-teal-700 dark:text-teal-400 text-sm">
              {Number(booking.totalPrice).toLocaleString()} ETB
            </span>
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <Link
            href="/renter/bookings"
            className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-teal-600/10 cursor-pointer"
          >
            <ListTodo className="size-4" />
            View My Bookings
          </Link>
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold py-3 rounded-xl transition-all cursor-pointer"
          >
            <Home className="size-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
