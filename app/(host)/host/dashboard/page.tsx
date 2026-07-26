import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Building2,
  CalendarDays,
  Star,
  Plus,
  ArrowRight,
  Wallet,
  Clock,
  User,
} from "lucide-react";

export default async function HostDashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const hostId = session.user.id;

  const [
    totalProperties,
    confirmedBookings,
    pendingBookings,
    revenueResult,
    recentBookings,
  ] = await Promise.all([
    // Total properties
    prisma.property.count({
      where: { hostId },
    }),
    // Confirmed + Completed bookings
    prisma.booking.count({
      where: {
        property: { hostId },
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
    }),
    // Pending bookings
    prisma.booking.count({
      where: {
        property: { hostId },
        status: "PENDING",
      },
    }),
    // Total revenue from successful payments
    prisma.payment.aggregate({
      where: {
        status: "SUCCESS",
        booking: {
          property: { hostId },
        },
      },
      _sum: { amount: true },
    }),
    // Last 5 recent bookings
    prisma.booking.findMany({
      where: {
        property: { hostId },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        renter: { select: { name: true, email: true } },
        property: { select: { title: true } },
        payment: { select: { status: true } },
      },
    }),
  ]);

  const totalRevenue = Number(revenueResult._sum.amount || 0);

  const stats = [
    {
      label: "Total Properties",
      value: totalProperties,
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
      label: "Total Revenue (ETB)",
      value: `${totalRevenue.toLocaleString()} ETB`,
      icon: Wallet,
      color: "violet",
      href: "/host/revenue",
    },
    {
      label: "Pending Bookings",
      value: pendingBookings,
      icon: Clock,
      color: "orange",
      href: "/host/bookings?filter=pending",
    },
  ];

  const colorMap: Record<string, string> = {
    teal: "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400",
    emerald: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
    violet: "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400",
    orange: "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400",
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
            Here's your live hosting activity and earnings performance.
          </p>
        </div>
        <Link
          href="/host/properties/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/10 transition-all cursor-pointer"
        >
          <Plus className="size-4" />
          Add Property
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer"
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

      {/* Recent Bookings Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 className="font-bold text-neutral-800 dark:text-white text-sm">
              Recent Bookings
            </h2>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              Latest 5 reservation requests across your properties
            </p>
          </div>
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
            <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
              No bookings yet
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
              Bookings will appear here once guests reserve your listings.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/70 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Renter</th>
                  <th className="px-6 py-3">Property</th>
                  <th className="px-6 py-3">Dates</th>
                  <th className="px-6 py-3">Total Price</th>
                  <th className="px-6 py-3">Booking Status</th>
                  <th className="px-6 py-3">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-medium text-neutral-700 dark:text-neutral-200">
                {recentBookings.map((booking) => {
                  const paymentStatus = booking.payment?.status || (booking.status === "CONFIRMED" || booking.status === "COMPLETED" ? "SUCCESS" : "PENDING");
                  return (
                    <tr key={booking.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {(booking.renter.name || "G")[0].toUpperCase()}
                        </div>
                        <span className="truncate">{booking.renter.name || booking.renter.email}</span>
                      </td>
                      <td className="px-6 py-4 max-w-[200px] truncate">
                        {booking.property.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-neutral-500 dark:text-neutral-400">
                        {new Date(booking.checkIn).toLocaleDateString(undefined, { month: "short", day: "numeric" })} - {new Date(booking.checkOut).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </td>
                      <td className="px-6 py-4 font-bold text-teal-700 dark:text-teal-400 whitespace-nowrap">
                        {Number(booking.totalPrice).toLocaleString()} ETB
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            booking.status === "CONFIRMED" || booking.status === "COMPLETED"
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40"
                              : booking.status === "PENDING"
                              ? "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900/40"
                              : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            paymentStatus === "SUCCESS"
                              ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300"
                              : paymentStatus === "FAILED"
                              ? "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300"
                              : "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300"
                          }`}
                        >
                          {paymentStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/host/properties"
          className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 shrink-0">
            <Building2 className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 group-hover:text-teal-600 transition-colors">
              Manage Properties
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              Edit listings, pricing & details
            </p>
          </div>
        </Link>

        <Link
          href="/host/bookings"
          className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all group cursor-pointer"
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
          href="/host/revenue"
          className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 shrink-0">
            <Wallet className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 group-hover:text-teal-600 transition-colors">
              Revenue & Withdrawals
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              Manage payouts & balance
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
