import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Home, ListTodo, MapPin } from "lucide-react";
import { sendBookingConfirmationEmail } from "@/lib/email";

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
      renter: true,
      payment: true,
    },
  });

  if (!booking) {
    redirect("/");
  }

  // If status is PENDING when arriving on the success page, auto-confirm it in DB
  if (booking.status === "PENDING") {
    try {
      await prisma.$transaction([
        prisma.booking.update({
          where: { id: cleanBookingId },
          data: { status: "CONFIRMED" },
        }),
        prisma.payment.upsert({
          where: { bookingId: cleanBookingId },
          update: { status: "SUCCESS" },
          create: {
            bookingId: cleanBookingId,
            amount: booking.totalPrice,
            currency: "ETB",
            status: "SUCCESS",
            chapaReference: `booking-${cleanBookingId}`,
          },
        }),
      ]);
      booking.status = "CONFIRMED";

      if (booking.renter?.email) {
        sendBookingConfirmationEmail({
          email: booking.renter.email,
          name: booking.renter.name || "Guest",
          propertyTitle: booking.property.title,
          checkIn: new Date(booking.checkIn).toLocaleDateString(),
          checkOut: new Date(booking.checkOut).toLocaleDateString(),
          totalPrice: Number(booking.totalPrice),
        }).catch((err) => console.error("Failed to send confirmation email on success page:", err));
      }
    } catch (err) {
      console.error("Error auto-confirming pending booking on success page:", err);
    }
  }

  // If the payment/booking was cancelled or failed, redirect to the failed page
  if (booking.status === "CANCELLED") {
    redirect("/payment/failed");
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white border border-[#e5e7eb] rounded-3xl shadow-xl overflow-hidden p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">
            Booking Confirmed!
          </h1>
          <p className="text-[#6b7280] text-sm leading-relaxed">
            Your payment was successful. Your booking is confirmed.
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-[#f8fafc] rounded-2xl p-4 text-left space-y-3 border border-[#e5e7eb]">
          <h3 className="font-bold text-[#111827] text-sm line-clamp-1">
            {booking.property.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-[#6b7280]">
            <MapPin className="w-3.5 h-3.5 text-[#7c3aed]" />
            <span>{booking.property.city}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#e5e7eb] text-xs">
            <div>
              <p className="text-[#6b7280] font-medium">Check-in</p>
              <p className="font-semibold text-[#111827] mt-0.5">
                {new Date(booking.checkIn).toLocaleDateString(undefined, { dateStyle: "medium" })}
              </p>
            </div>
            <div>
              <p className="text-[#6b7280] font-medium">Check-out</p>
              <p className="font-semibold text-[#111827] mt-0.5">
                {new Date(booking.checkOut).toLocaleDateString(undefined, { dateStyle: "medium" })}
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-[#e5e7eb] flex justify-between items-center text-xs">
            <span className="text-[#6b7280]">Amount Paid</span>
            <span className="font-extrabold text-[#7c3aed] text-sm">
              {Number(booking.totalPrice).toLocaleString()} ETB
            </span>
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <Link
            href="/renter/bookings"
            className="w-full flex items-center justify-center gap-2 bg-[#7c3aed] hover:bg-[#5b21b6] active:bg-[#4c1d95] text-white font-semibold py-3 rounded-xl transition-all shadow-[0_4px_14px_0_rgb(124_58_237_/0.25)] cursor-pointer text-sm"
          >
            <ListTodo className="w-4 h-4" />
            View My Bookings
          </Link>
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 border-2 border-[#7c3aed] text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white font-semibold py-3 rounded-xl transition-all cursor-pointer text-sm"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
