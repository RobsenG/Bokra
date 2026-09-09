import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CalendarDays, MapPin, Users, ChevronRight, Eye } from "lucide-react";
import Link from "next/link";

export default async function HostBookingsPage() {
  const session = await auth();
  if (!session?.user) return null;

  let bookings: any[] = [];
  try {
    bookings = await prisma.booking.findMany({
      where: { property: { hostId: session.user.id } },
      orderBy: { createdAt: "desc" },
      include: {
        renter: { select: { name: true, email: true } },
        property: { select: { title: true, city: true } },
      },
    });
  } catch (error) {
    console.error("[DB Error] Could not fetch bookings:", error);
  }

  const statusStyle: Record<string, string> = {
    CONFIRMED: "bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] border border-[#b8943d]/20 dark:border-[#c9a84c]/20",
    PENDING: "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900/40",
    CANCELLED: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40",
    COMPLETED: "bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] border border-[#b8943d]/20 dark:border-[#c9a84c]/20",
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1a1208] dark:text-[#f8f6f0] tracking-tight">Your bookings</h1>
        <p className="text-sm text-[#6b5e4e] dark:text-[#9b9080] mt-0.5">All bookings for your properties.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-black/[0.08] dark:border-white/[0.06] rounded-2xl">
          <CalendarDays className="size-8 text-[#6b5e4e] dark:text-[#9b9080] mx-auto mb-2.5" />
          <p className="text-sm font-medium text-[#1a1208] dark:text-[#f8f6f0]">No bookings yet</p>
          <p className="text-xs text-[#6b5e4e] dark:text-[#9b9080] mt-1">Bookings will appear here when guests reserve your places.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-black/[0.08] dark:border-white/[0.06] shadow-sm divide-y divide-black/[0.06] dark:divide-white/[0.06] overflow-hidden">
          {bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/host/bookings/${booking.id}`}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group cursor-pointer"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#6b5e4e] dark:text-[#9b9080]">#{booking.id.slice(0, 8)}</span>
                  <p className="font-bold text-[#1a1208] dark:text-[#f8f6f0] truncate group-hover:text-[#b8943d] dark:group-hover:text-[#c9a84c] transition-colors">
                    {booking.property.title}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#6b5e4e] dark:text-[#9b9080]">
                  <span className="flex items-center gap-1"><MapPin className="size-3" /> {booking.property.city}</span>
                  <span className="flex items-center gap-1"><Users className="size-3" /> {booking.renter.name || booking.renter.email}</span>
                </div>
                <p className="text-xs text-[#6b5e4e] dark:text-[#9b9080]">
                  {new Date(booking.checkIn).toLocaleDateString()} — {new Date(booking.checkOut).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusStyle[booking.status] || ""}`}>
                    {booking.status}
                  </span>
                  <p className="font-extrabold text-[#b8943d] dark:text-[#c9a84c] text-sm">
                    {Number(booking.totalPrice).toLocaleString()} ETB
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-[#b8943d] dark:text-[#c9a84c] group-hover:translate-x-0.5 transition-transform bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 px-3 py-1.5 rounded-xl border border-[#b8943d]/20 dark:border-[#c9a84c]/20">
                  <Eye className="size-3.5" />
                  <span>View details</span>
                  <ChevronRight className="size-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
