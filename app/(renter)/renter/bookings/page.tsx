import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import RenterBookingsSlider from "./RenterBookingsSlider";

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

  // Format bookings data safely for client component
  const serializableBookings = bookings.map((b) => ({
    id: b.id,
    checkIn: b.checkIn.toISOString(),
    checkOut: b.checkOut.toISOString(),
    totalPrice: Number(b.totalPrice),
    status: b.status,
    createdAt: b.createdAt.toISOString(),
    property: {
      id: b.property.id,
      title: b.property.title,
      city: b.property.city,
      images: b.property.images || [],
    },
    payment: b.payment
      ? {
          id: b.payment.id,
          amount: Number(b.payment.amount),
          chapaReference: b.payment.chapaReference,
        }
      : null,
  }));

  return (
    <div className="space-y-6 w-full py-4 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a1208] dark:text-[#f5f0e8] tracking-tight">
            Your bookings
          </h1>
          <p className="text-sm text-[#6b5e4e] dark:text-[#8a8278] mt-1">
            View your upcoming stays and booking history.
          </p>
        </div>
        {bookings.length > 0 && (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] border border-[#b8943d]/20 dark:border-[#c9a84c]/20">
            {bookings.length} {bookings.length === 1 ? "stay booked" : "stays booked"}
          </span>
        )}
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] border border-[#b8943d]/20 dark:border-[#c9a84c]/20 text-sm font-semibold flex items-center gap-2">
          <span className="size-2 rounded-full bg-[#b8943d] dark:bg-[#c9a84c] animate-pulse" />
          {message}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-[#ef4444]/10 text-red-800 dark:text-[#fca5a5] border border-red-200 dark:border-[#ef4444]/20 text-sm font-semibold flex items-center gap-2">
          <span className="size-2 rounded-full bg-red-500 animate-pulse" />
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-black/[0.08] dark:border-[#fff8dc]/[0.06] rounded-3xl bg-white dark:bg-[#141310] shadow-sm">
          <CalendarDays className="size-10 text-[#6b5e4e] dark:text-[#8a8278] mx-auto mb-3" />
          <h3 className="font-bold text-[#1a1208] dark:text-[#f5f0e8] text-sm">No bookings yet</h3>
          <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278] mt-1 mb-4">
            You haven&apos;t booked any stays yet. Explore properties to get started!
          </p>
          <Link href="/">
            <button className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#b8943d] dark:bg-[#c9a84c] hover:bg-[#d4b458] text-white dark:text-[#0c0b09] shadow-xs transition-colors cursor-pointer">
              Explore properties
            </button>
          </Link>
        </div>
      ) : (
        <RenterBookingsSlider bookings={serializableBookings} />
      )}
    </div>
  );
}
