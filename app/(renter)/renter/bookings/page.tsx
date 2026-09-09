import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, MapPin, ExternalLink } from "lucide-react";
import CancelBookingButton from "./CancelBookingButton";
import PayNowButton from "./PayNowButton";

export default async function RenterBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const { message, error } = await searchParams;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  let bookings: any[] = [];
  try {
    bookings = await prisma.booking.findMany({
      where: { renterId: session.user.id },
      include: {
        property: {
          select: { id: true, title: true, city: true, images: true },
        },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("[DB Error] Could not fetch bookings:", error);
  }

  const getBadge = (status: string, payment?: any) => {
    switch (status) {
      case "PENDING":
        return <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900/40">Awaiting payment</span>;
      case "CONFIRMED":
        return (
          <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] border border-[#b8943d]/20 dark:border-[#c9a84c]/20">
            Confirmed {payment ? `(${Number(payment.amount).toLocaleString()} ETB)` : ""}
          </span>
        );
      case "CANCELLED":
        return <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40">Cancelled</span>;
      case "COMPLETED":
        return <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] border border-[#b8943d]/20 dark:border-[#c9a84c]/20">Completed</span>;
      default:
        return <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/5 dark:bg-white/5 text-[#6b5e4e] dark:text-[#9b9080]">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1a1208] dark:text-[#f8f6f0] tracking-tight">Your bookings</h1>
        <p className="text-sm text-[#6b5e4e] dark:text-[#9b9080] mt-0.5">
          View your upcoming and past stays.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] border border-[#b8943d]/20 dark:border-[#c9a84c]/20 text-sm font-semibold flex items-center gap-2">
          <span className="size-2 rounded-full bg-[#b8943d] dark:bg-[#c9a84c] animate-pulse" />
          {message}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900/40 text-sm font-semibold flex items-center gap-2">
          <span className="size-2 rounded-full bg-red-500 animate-pulse" />
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-black/[0.08] dark:border-white/[0.06] rounded-3xl bg-white dark:bg-[#12121a] shadow-sm">
          <CalendarDays className="size-10 text-[#6b5e4e] dark:text-[#9b9080] mx-auto mb-3" />
          <h3 className="font-bold text-[#1a1208] dark:text-[#f8f6f0] text-sm">No bookings yet</h3>
          <p className="text-xs text-[#6b5e4e] dark:text-[#9b9080] mt-1 mb-4">
            You haven&apos;t booked any stays yet. Explore properties to get started!
          </p>
          <Link href="/">
            <button className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#b8943d] dark:bg-[#c9a84c] hover:brightness-110 text-white dark:text-[#0a0a0f] shadow-xs transition-colors cursor-pointer">
              Explore properties
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <div 
              key={booking.id} 
              className="bg-white dark:bg-[#12121a] border border-black/[0.08] dark:border-white/[0.06] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full"
            >
              {/* Image Banner */}
              <div 
                className="h-44 w-full bg-cover bg-center bg-black/5 dark:bg-white/5 shrink-0"
                style={{ backgroundImage: `url(${booking.property.images[0] || ""})` }}
              />

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-[#1a1208] dark:text-[#f8f6f0] text-sm line-clamp-1">
                      {booking.property.title}
                    </h3>
                    {getBadge(booking.status, booking.payment)}
                  </div>
                  <p className="text-xs text-[#6b5e4e] dark:text-[#9b9080] flex items-center gap-1">
                    <MapPin className="size-3" /> {booking.property.city}
                  </p>
                  {booking.payment?.chapaReference && (
                    <p className="text-[10px] text-[#6b5e4e] dark:text-[#9b9080] font-mono">
                      Ref: {booking.payment.chapaReference}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs py-3 border-t border-b border-black/[0.06] dark:border-white/[0.06]">
                  <div>
                    <p className="text-[#6b5e4e] dark:text-[#9b9080] font-medium">Check-in</p>
                    <p className="font-semibold text-[#1a1208] dark:text-[#f8f6f0] mt-0.5">
                      {new Date(booking.checkIn).toLocaleDateString(undefined, { dateStyle: "medium" })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#6b5e4e] dark:text-[#9b9080] font-medium">Check-out</p>
                    <p className="font-semibold text-[#1a1208] dark:text-[#f8f6f0] mt-0.5">
                      {new Date(booking.checkOut).toLocaleDateString(undefined, { dateStyle: "medium" })}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <div>
                    <p className="text-[10px] text-[#6b5e4e] dark:text-[#9b9080] font-medium">Total price</p>
                    <p className="font-black text-[#b8943d] dark:text-[#c9a84c] text-base">
                      {Number(booking.totalPrice).toLocaleString()} ETB
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    {booking.status === "PENDING" && (
                      <PayNowButton bookingId={booking.id} />
                    )}
                    {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                      <CancelBookingButton bookingId={booking.id} />
                    )}
                    <Link href={`/properties/${booking.property.id}`}>
                      <button className="flex items-center gap-1 text-xs font-semibold text-[#6b5e4e] hover:text-[#b8943d] dark:text-[#9b9080] dark:hover:text-[#c9a84c] border border-black/10 dark:border-white/10 hover:border-[#b8943d] dark:hover:border-[#c9a84c] px-3 py-1.5 rounded-xl transition-all cursor-pointer">
                        <span>View</span>
                        <ExternalLink className="size-3" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
