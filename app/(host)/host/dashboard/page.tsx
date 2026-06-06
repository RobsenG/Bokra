import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Building2,
  CalendarDays,
  Star,
  TrendingUp,
  Plus,
  ArrowRight,
  DollarSign,
  Users,
  Clock,
} from "lucide-react";

export default async function HostDashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const [propertyCount, bookingStats, recentBookings] = await Promise.all([
    prisma.property.count({ where: { hostId: session.user.id } }),
    prisma.booking.findMany({
      where: { property: { hostId: session.user.id } },
      select: { totalPrice: true, status: true },
    }),
    prisma.booking.findMany({
      where: { property: { hostId: session.user.id } },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        renter: { select: { name: true, email: true } },
        property: { select: { title: true } },
      },
    }),
  ]);

  const totalRevenue = bookingStats
    .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
    .reduce((acc, b) => acc + Number(b.totalPrice), 0);

  const confirmedBookings = bookingStats.filter(
    (b) => b.status === "CONFIRMED"
  ).length;
  const pendingBookings = bookingStats.filter(
    (b) => b.status === "PENDING"
  ).length;

  const stats = [
    {
      label: "My Properties",
      value: propertyCount,
      icon: Building2,
      color: "teal",
      href: "/host/properties",
    },
    {
      label: "Confirmed Bookings",
      value: confirmedBookings,
      icon: CalendarDays,
      color: "emerald",
      href: "/host/bookings",
    },
    {
      label: "Pending Bookings",
      value: pendingBookings,
      icon: Clock,
      color: "orange",
      href: "/host/bookings",
    },
    {
      label: "Total Revenue (ETB)",
      value: totalRevenue.toLocaleString(),
      icon: DollarSign,
      color: "violet",
      href: "/host/bookings",
    },
  ];

  const colorMap: Record<string, string> = {
    teal: "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400",
    emerald: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
    orange: "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400",
    violet: "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-800 dark:text-white tracking-tight">
            Welcome back, {session.user.name?.split(" ")[0] || "Host"} 👋
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Here's what's happening with your listings today.
          </p>
        </div>
        <Link
          href="/host/properties/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/10 transition-all"
        >
          <Plus className="size-4" />
          Add Property
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl ${colorMap[stat.color]}`}>
                  <Icon className="size-5" />
                </div>
                <ArrowRight className="size-4 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-500 transition-colors mt-1" />
              </div>
              <div className="mt-4">
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {stat.label}
                </p>
                <p className="text-2xl font-extrabold text-neutral-800 dark:text-white mt-0.5">
                  {stat.value}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h2 className="font-bold text-neutral-800 dark:text-white text-sm">
            Recent Bookings
          </h2>
          <Link
            href="/host/bookings"
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
          >
            View all
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="py-12 text-center">
            <CalendarDays className="size-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2.5" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No bookings yet.
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
              Bookings will appear here once guests reserve your properties.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors"
              >
                <div className="space-y-0.5 min-w-0">
                  <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 truncate">
                    {booking.property.title}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    {booking.renter.name || booking.renter.email}
                  </p>
                </div>
                <div className="text-right shrink-0 pl-4 space-y-1">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      booking.status === "CONFIRMED"
                        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                        : booking.status === "PENDING"
                        ? "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400"
                        : booking.status === "CANCELLED"
                        ? "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                        : "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    {booking.status}
                  </span>
                  <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">
                    {Number(booking.totalPrice).toLocaleString()} ETB
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/host/properties"
          className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 shrink-0">
            <Building2 className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 group-hover:text-teal-600 transition-colors">
              Manage Properties
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              Edit listings, pricing & photos
            </p>
          </div>
        </Link>

        <Link
          href="/host/bookings"
          className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 shrink-0">
            <CalendarDays className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 group-hover:text-teal-600 transition-colors">
              View Bookings
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              Track reservations & guests
            </p>
          </div>
        </Link>

        <Link
          href="/host/reviews"
          className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 shrink-0">
            <Star className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 group-hover:text-teal-600 transition-colors">
              Guest Reviews
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              See what guests are saying
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
