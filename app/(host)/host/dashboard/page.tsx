import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Building2,
  CalendarDays,
  Plus,
  ArrowRight,
  Wallet,
  Clock,
  AlertTriangle,
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
    rejectedProperties,
  ] = await Promise.all([
    prisma.property.count({
      where: { hostId },
    }),
    prisma.booking.count({
      where: {
        property: { hostId },
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
    }),
    prisma.booking.count({
      where: {
        property: { hostId },
        status: "PENDING",
      },
    }),
    prisma.payment.aggregate({
      where: {
        status: "SUCCESS",
        booking: {
          property: { hostId },
        },
      },
      _sum: { amount: true },
    }),
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
    prisma.property.findMany({
      where: {
        hostId,
        status: "REJECTED",
      },
      select: {
        id: true,
        title: true,
        city: true,
        rejectionReason: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const totalRevenue = Number(revenueResult._sum.amount || 0);

  const stats = [
    {
      label: "Properties",
      value: totalProperties,
      icon: Building2,
      color: "purple",
      href: "/host/properties",
    },
    {
      label: "Confirmed bookings",
      value: confirmedBookings,
      icon: CalendarDays,
      color: "purple",
      href: "/host/bookings",
    },
    {
      label: "Total earnings",
      value: `${totalRevenue.toLocaleString()} ETB`,
      icon: Wallet,
      color: "purple",
      href: "/host/revenue",
    },
    {
      label: "Pending bookings",
      value: pendingBookings,
      icon: Clock,
      color: "orange",
      href: "/host/bookings?filter=pending",
    },
  ];

  const colorMap: Record<string, string> = {
    purple: "bg-[#7c3aed]/10 text-[#7c3aed]",
    orange: "bg-orange-50 text-orange-600",
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
            Here&apos;s your hosting overview.
          </p>
        </div>
        <Link
          href="/host/properties/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-[#7c3aed] hover:bg-[#5b21b6] text-white shadow-md shadow-[#7c3aed]/10 transition-all cursor-pointer"
        >
          <Plus className="size-4" />
          List property
        </Link>
      </div>

      {/* Rejected Properties Alert Section */}
      {rejectedProperties.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-extrabold text-sm">
            <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>⚠️ Action required — {rejectedProperties.length} {rejectedProperties.length === 1 ? "property needs" : "properties need"} attention</span>
          </div>
          <div className="space-y-3">
            {rejectedProperties.map((prop) => (
              <div key={prop.id} className="bg-white dark:bg-neutral-900 rounded-xl p-4 border-l-4 border-l-red-500 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="font-extrabold text-neutral-900 dark:text-white text-sm">
                    ✗ {prop.title} — <span className="font-semibold text-neutral-500">{prop.city}</span>
                  </h4>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    Rejected on: {new Date(prop.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                {prop.rejectionReason && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 italic bg-neutral-50 dark:bg-neutral-800/60 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800">
                    Reason: &quot;{prop.rejectionReason}&quot;
                  </p>
                )}
                <div className="flex gap-2.5 pt-1">
                  <Link
                    href={`/host/properties/${prop.id}/edit`}
                    className="px-3.5 py-1.5 rounded-lg bg-[#7c3aed] hover:bg-[#5b21b6] text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    Edit &amp; Resubmit
                  </Link>
                  <Link
                    href={`/properties/${prop.id}`}
                    className="px-3.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold text-xs transition-colors"
                  >
                    View details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
              Recent bookings
            </h2>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              Latest 5 booking requests for your properties
            </p>
          </div>
          <Link
            href="/host/bookings"
            className="text-xs font-semibold text-[#7c3aed] hover:underline"
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
              Bookings will show up here when guests book your places.
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
                  <th className="px-6 py-3">Total price</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-medium text-neutral-700 dark:text-neutral-200">
                {recentBookings.map((booking) => {
                  const paymentStatus = booking.payment?.status || (booking.status === "CONFIRMED" || booking.status === "COMPLETED" ? "SUCCESS" : "PENDING");
                  return (
                    <tr key={booking.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#7c3aed]/10 text-[#7c3aed] flex items-center justify-center text-[10px] font-bold shrink-0">
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
                      <td className="px-6 py-4 font-bold text-[#7c3aed] whitespace-nowrap">
                        {Number(booking.totalPrice).toLocaleString()} ETB
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            booking.status === "CONFIRMED" || booking.status === "COMPLETED"
                              ? "bg-purple-50 text-[#7c3aed] border border-purple-200"
                              : booking.status === "PENDING"
                              ? "bg-orange-50 text-orange-700 border border-orange-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            paymentStatus === "SUCCESS"
                              ? "bg-purple-50 text-[#7c3aed]"
                              : paymentStatus === "FAILED"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
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
          <div className="p-2.5 rounded-xl bg-[#7c3aed]/10 text-[#7c3aed] shrink-0">
            <Building2 className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 group-hover:text-[#7c3aed] transition-colors">
              Your properties
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              Edit listings, pricing &amp; details
            </p>
          </div>
        </Link>

        <Link
          href="/host/bookings"
          className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="p-2.5 rounded-xl bg-[#7c3aed]/10 text-[#7c3aed] shrink-0">
            <CalendarDays className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 group-hover:text-[#7c3aed] transition-colors">
              Your bookings
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              Track reservations &amp; guests
            </p>
          </div>
        </Link>

        <Link
          href="/host/revenue"
          className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="p-2.5 rounded-xl bg-[#7c3aed]/10 text-[#7c3aed] shrink-0">
            <Wallet className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 group-hover:text-[#7c3aed] transition-colors">
              Earnings &amp; withdrawals
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              Manage payouts &amp; balance
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
