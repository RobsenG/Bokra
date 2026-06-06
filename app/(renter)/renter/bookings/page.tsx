import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, MapPin, ExternalLink, RefreshCw } from "lucide-react";

export default async function RenterBookingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const bookings = await prisma.booking.findMany({
    where: { renterId: session.user.id },
    include: {
      property: {
        select: { id: true, title: true, city: true, images: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const statusStyle: Record<string, string> = {
    CONFIRMED: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
    PENDING: "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400",
    CANCELLED: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-450",
    COMPLETED: "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400",
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-800 dark:text-white tracking-tight">My Bookings</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          View and manage your upcoming and past stays.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl bg-white dark:bg-neutral-900 shadow-sm">
          <CalendarDays className="size-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
          <h3 className="font-bold text-neutral-800 dark:text-neutral-200 text-sm">No bookings yet</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 mb-4">
            You haven't booked any properties yet. Find a cozy place to stay!
          </p>
          <Link href="/">
            <button className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/10 transition-colors cursor-pointer">
              Explore Stays
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <div 
              key={booking.id} 
              className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full"
            >
              {/* Image Banner */}
              <div 
                className="h-44 w-full bg-cover bg-center bg-neutral-200 dark:bg-neutral-800 shrink-0"
                style={{ backgroundImage: `url(${booking.property.images[0] || ""})` }}
              />

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-neutral-800 dark:text-neutral-200 text-sm line-clamp-1">
                      {booking.property.title}
                    </h3>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${statusStyle[booking.status] || ""}`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                    <MapPin className="size-3" /> {booking.property.city}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs py-3 border-t border-b border-neutral-100 dark:border-neutral-800/60">
                  <div>
                    <p className="text-neutral-400 dark:text-neutral-500 font-medium">Check-in</p>
                    <p className="font-semibold text-neutral-700 dark:text-neutral-250 mt-0.5">
                      {new Date(booking.checkIn).toLocaleDateString(undefined, { dateStyle: "medium" })}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-400 dark:text-neutral-500 font-medium">Check-out</p>
                    <p className="font-semibold text-neutral-700 dark:text-neutral-250 mt-0.5">
                      {new Date(booking.checkOut).toLocaleDateString(undefined, { dateStyle: "medium" })}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <div>
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">Total Paid</p>
                    <p className="font-black text-teal-700 dark:text-teal-300 text-base">
                      {Number(booking.totalPrice).toLocaleString()} ETB
                    </p>
                  </div>
                  <Link href={`/properties/${booking.property.id}`}>
                    <button className="flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-teal-600 dark:text-neutral-350 dark:hover:text-teal-400 border border-neutral-250 dark:border-neutral-750 hover:border-teal-500 px-3 py-1.5 rounded-xl transition-all cursor-pointer">
                      <span>View Details</span>
                      <ExternalLink className="size-3" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
