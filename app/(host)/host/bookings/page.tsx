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
    CONFIRMED: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40",
    PENDING: "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900/40",
    CANCELLED: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40",
    COMPLETED: "bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-900/40",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-800 dark:text-white tracking-tight">Bookings</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">All reservations for your properties.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
          <CalendarDays className="size-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2.5" />
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">No bookings yet</p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Reservations will appear here once guests book your properties.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm divide-y divide-neutral-100 dark:divide-neutral-800 overflow-hidden">
          {bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/host/bookings/${booking.id}`}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors group cursor-pointer"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-neutral-400">#{booking.id.slice(0, 8)}</span>
                  <p className="font-bold text-neutral-800 dark:text-neutral-200 truncate group-hover:text-teal-600 transition-colors">
                    {booking.property.title}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                  <span className="flex items-center gap-1"><MapPin className="size-3" /> {booking.property.city}</span>
                  <span className="flex items-center gap-1"><Users className="size-3" /> {booking.renter.name || booking.renter.email}</span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {new Date(booking.checkIn).toLocaleDateString()} — {new Date(booking.checkOut).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusStyle[booking.status] || ""}`}>
                    {booking.status}
                  </span>
                  <p className="font-extrabold text-teal-700 dark:text-teal-300 text-sm">
                    {Number(booking.totalPrice).toLocaleString()} ETB
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform bg-teal-50 dark:bg-teal-950/40 px-3 py-1.5 rounded-xl border border-teal-100 dark:border-teal-900/30">
                  <Eye className="size-3.5" />
                  <span>View Details</span>
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
