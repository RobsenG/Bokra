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
      color: "gold",
      href: "/host/properties",
    },
    {
      label: "Confirmed bookings",
      value: confirmedBookings,
      icon: CalendarDays,
      color: "gold",
      href: "/host/bookings",
    },
    {
      label: "Total earnings",
      value: `${totalRevenue.toLocaleString()} ETB`,
      icon: Wallet,
      color: "gold",
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
    gold: "bg-[#b8943d]/10 dark:bg-[rgba(201,168,76,0.08)] text-[#b8943d] dark:text-[#c9a84c]",
    orange: "bg-amber-50 dark:bg-[rgba(245,158,11,0.08)] text-amber-600 dark:text-[#fcd34d]",
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1208] dark:text-[#f5f0e8] tracking-tight">
            Welcome back, {session.user.name?.split(" ")[0] || "Host"} 👋
          </h1>
          <p className="text-sm text-[#6b5e4e] dark:text-[#8a8278] mt-0.5">
            Here&apos;s your hosting overview.
          </p>
        </div>
        <Link
          href="/host/properties/new"
          className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer"
        >
          <Plus className="size-4" />
          List property
        </Link>
      </div>

      {/* Rejected Properties Alert Section */}
      {rejectedProperties.length > 0 && (
        <div className="bg-amber-50 dark:bg-[rgba(239,68,68,0.08)] border-2 border-amber-200 dark:border-[rgba(239,68,68,0.15)] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-amber-800 dark:text-[#fca5a5] font-extrabold text-sm">
            <AlertTriangle className="size-5 text-amber-600 dark:text-[#fca5a5] shrink-0" />
            <span>⚠️ Action required — {rejectedProperties.length} {rejectedProperties.length === 1 ? "property needs" : "properties need"} attention</span>
          </div>
          <div className="space-y-3">
            {rejectedProperties.map((prop) => (
              <div key={prop.id} className="bg-white dark:bg-[#141310] rounded-xl p-4 border-l-4 border-l-red-500 border border-black/[0.08] dark:border-[#fff8dc]/[0.06] space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="font-extrabold text-[#1a1208] dark:text-[#f5f0e8] text-sm">
                    ✗ {prop.title} — <span className="font-semibold text-[#6b5e4e] dark:text-[#8a8278]">{prop.city}</span>
                  </h4>
                  <span className="text-[10px] text-[#6b5e4e] dark:text-[#8a8278] font-mono">
                    Rejected on: {new Date(prop.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                {prop.rejectionReason && (
                  <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278] italic bg-[#f5f3ef] dark:bg-[#fff8dc]/[0.02] p-2.5 rounded-lg border border-black/[0.06] dark:border-[#fff8dc]/[0.05]">
                    Reason: &quot;{prop.rejectionReason}&quot;
                  </p>
                )}
                <div className="flex gap-2.5 pt-1">
                  <Link
                    href={`/host/properties/${prop.id}/edit`}
                    className="btn-primary px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Edit &amp; Resubmit
                  </Link>
                  <Link
                    href={`/properties/${prop.id}`}
                    className="btn-secondary px-3.5 py-1.5 rounded-lg font-semibold text-xs cursor-pointer"
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
              className="group bg-white dark:bg-[#141310] rounded-2xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] dark:shadow-[0_1px_0_rgba(255,255,255,0.03)] p-5 hover:border-[#b8943d]/40 dark:hover:border-[#fff8dc]/10 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl ${colorMap[stat.color]}`}>
                  <Icon className="size-5" />
                </div>
                <ArrowRight className="size-4 text-neutral-400 dark:text-[#524d47] group-hover:text-[#b8943d] dark:group-hover:text-[#c9a84c] transition-colors mt-1" />
              </div>
              <div className="mt-4">
                <p className="text-xs font-medium text-[#6b5e4e] dark:text-[#8a8278]">
                  {stat.label}
                </p>
                <p className="text-2xl font-extrabold text-[#1a1208] dark:text-[#f5f0e8] mt-0.5">
                  {stat.value}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white dark:bg-[#141310] rounded-2xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] dark:shadow-[0_1px_0_rgba(255,255,255,0.03)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] dark:border-[#fff8dc]/[0.05]">
          <div>
            <h2 className="font-bold text-[#1a1208] dark:text-[#f5f0e8] text-sm">
              Recent bookings
            </h2>
            <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278]">
              Latest 5 booking requests for your properties
            </p>
          </div>
          <Link
            href="/host/bookings"
            className="text-xs font-semibold text-[#b8943d] dark:text-[#c9a84c] hover:underline"
          >
            View all
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="py-12 text-center">
            <CalendarDays className="size-8 text-[#6b5e4e] dark:text-[#524d47] mx-auto mb-2.5" />
            <p className="text-sm font-semibold text-[#1a1208] dark:text-[#f5f0e8]">
              No bookings yet
            </p>
            <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278] mt-0.5">
              Bookings will show up here when guests book your places.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f5f3ef] dark:bg-[#fff8dc]/[0.02] text-[#6b5e4e] dark:text-[#524d47] border-b border-black/[0.06] dark:border-[#fff8dc]/[0.05] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Renter</th>
                  <th className="px-6 py-3">Property</th>
                  <th className="px-6 py-3">Dates</th>
                  <th className="px-6 py-3">Total price</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06] dark:divide-[#fff8dc]/[0.04] font-medium text-[#1a1208] dark:text-[#d4cfc7]">
                {recentBookings.map((booking) => {
                  const paymentStatus = booking.payment?.status || (booking.status === "CONFIRMED" || booking.status === "COMPLETED" ? "SUCCESS" : "PENDING");
                  return (
                    <tr key={booking.id} className="hover:bg-black/[0.02] dark:hover:bg-[#fff8dc]/[0.02] transition-colors">
                      <td className="px-6 py-4 font-semibold text-[#1a1208] dark:text-[#f5f0e8] flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#b8943d]/10 dark:bg-[rgba(201,168,76,0.08)] text-[#b8943d] dark:text-[#c9a84c] flex items-center justify-center text-[10px] font-bold shrink-0">
                          {(booking.renter.name || "G")[0].toUpperCase()}
                        </div>
                        <span className="truncate">{booking.renter.name || booking.renter.email}</span>
                      </td>
                      <td className="px-6 py-4 max-w-[200px] truncate text-[#6b5e4e] dark:text-[#8a8278]">
                        {booking.property.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#6b5e4e] dark:text-[#8a8278]">
                        {new Date(booking.checkIn).toLocaleDateString(undefined, { month: "short", day: "numeric" })} - {new Date(booking.checkOut).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#b8943d] dark:text-[#c9a84c] whitespace-nowrap">
                        {Number(booking.totalPrice).toLocaleString()} ETB
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            booking.status === "CONFIRMED" || booking.status === "COMPLETED"
                              ? "bg-[#b8943d]/10 dark:bg-[rgba(34,197,94,0.08)] text-[#b8943d] dark:text-[#86efac] border border-[#b8943d]/20 dark:border-[rgba(34,197,94,0.15)]"
                              : booking.status === "PENDING"
                              ? "bg-amber-50 dark:bg-[rgba(245,158,11,0.08)] text-amber-700 dark:text-[#fcd34d] border border-amber-200 dark:border-[rgba(245,158,11,0.15)]"
                              : "bg-red-50 dark:bg-[rgba(239,68,68,0.08)] text-red-700 dark:text-[#fca5a5] border border-red-200 dark:border-[rgba(239,68,68,0.15)]"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            paymentStatus === "SUCCESS"
                              ? "bg-emerald-50 dark:bg-[rgba(34,197,94,0.08)] text-emerald-700 dark:text-[#86efac]"
                              : paymentStatus === "FAILED"
                              ? "bg-red-50 dark:bg-[rgba(239,68,68,0.08)] text-red-700 dark:text-[#fca5a5]"
                              : "bg-amber-50 dark:bg-[rgba(245,158,11,0.08)] text-amber-700 dark:text-[#fcd34d]"
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
          className="flex items-center gap-3 p-4 bg-white dark:bg-[#141310] rounded-2xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] shadow-xs hover:border-[#b8943d]/40 dark:hover:border-[#fff8dc]/10 transition-all group cursor-pointer"
        >
          <div className="p-2.5 rounded-xl bg-[#b8943d]/10 dark:bg-[rgba(201,168,76,0.08)] text-[#b8943d] dark:text-[#c9a84c] shrink-0">
            <Building2 className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1a1208] dark:text-[#f5f0e8] group-hover:text-[#b8943d] dark:group-hover:text-[#c9a84c] transition-colors">
              Your properties
            </p>
            <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278]">
              Edit listings, pricing &amp; details
            </p>
          </div>
        </Link>

        <Link
          href="/host/bookings"
          className="flex items-center gap-3 p-4 bg-white dark:bg-[#141310] rounded-2xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] shadow-xs hover:border-[#b8943d]/40 dark:hover:border-[#fff8dc]/10 transition-all group cursor-pointer"
        >
          <div className="p-2.5 rounded-xl bg-[#b8943d]/10 dark:bg-[rgba(201,168,76,0.08)] text-[#b8943d] dark:text-[#c9a84c] shrink-0">
            <CalendarDays className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1a1208] dark:text-[#f5f0e8] group-hover:text-[#b8943d] dark:group-hover:text-[#c9a84c] transition-colors">
              Your bookings
            </p>
            <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278]">
              Track reservations &amp; guests
            </p>
          </div>
        </Link>

        <Link
          href="/host/revenue"
          className="flex items-center gap-3 p-4 bg-white dark:bg-[#141310] rounded-2xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] shadow-xs hover:border-[#b8943d]/40 dark:hover:border-[#fff8dc]/10 transition-all group cursor-pointer"
        >
          <div className="p-2.5 rounded-xl bg-[#b8943d]/10 dark:bg-[rgba(201,168,76,0.08)] text-[#b8943d] dark:text-[#c9a84c] shrink-0">
            <Wallet className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1a1208] dark:text-[#f5f0e8] group-hover:text-[#b8943d] dark:group-hover:text-[#c9a84c] transition-colors">
              Earnings &amp; withdrawals
            </p>
            <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278]">
              Manage payouts &amp; balance
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
