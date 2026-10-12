import React, { Suspense } from "react";
import prisma from "@/lib/prisma";
import TimePeriodSelector from "@/components/superadmin/TimePeriodSelector";
import {
  Users,
  DollarSign,
  Briefcase,
  Calendar,
  Home,
  TrendingUp,
  ShieldCheck,
  Building,
  CheckCircle,
  Clock,
  XCircle,
  Award,
  ArrowUpRight,
} from "lucide-react";
import { PLATFORM_FEE_PERCENT, calculatePlatformFee } from "@/lib/platform";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

function getDateFilter(period?: string) {
  const now = new Date();
  if (!period || period === "all") return undefined;

  let startDate = new Date();
  if (period === "today") {
    startDate.setHours(0, 0, 0, 0);
  } else if (period === "week") {
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
    startDate = new Date(startDate.setDate(diff));
    startDate.setHours(0, 0, 0, 0);
  } else if (period === "month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === "3months") {
    startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  } else if (period === "6months") {
    startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  } else {
    return undefined;
  }
  return { gte: startDate };
}

export default async function SuperAdminDashboardPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const period = resolvedParams.period || "all";
  const dateFilter = getDateFilter(period);
  const whereDate = dateFilter ? { createdAt: dateFilter } : {};

  const [
    totalUsers,
    totalRenters,
    totalHosts,
    totalAdmins,
    totalProperties,
    approvedProperties,
    pendingProperties,
    rejectedProperties,
    totalBookings,
    confirmedBookings,
    cancelledBookings,
    completedBookings,
    revenueAggregate,
    newUsersPeriod,
    topPropertiesRaw,
    topHostsRaw,
  ] = await Promise.all([
    prisma.user.count({ where: whereDate }).catch(() => 0),
    prisma.user.count({ where: { role: "RENTER", ...whereDate } }).catch(() => 0),
    prisma.user.count({ where: { role: "HOST", ...whereDate } }).catch(() => 0),
    prisma.user.count({ where: { role: { in: ["ADMIN", "FINANCE_ADMIN"] }, ...whereDate } }).catch(() => 0),
    prisma.property.count({ where: whereDate }).catch(() => 0),
    prisma.property.count({ where: { isVerified: true, ...whereDate } }).catch(() => 0),
    prisma.property.count({ where: { status: "PENDING", ...whereDate } }).catch(() => 0),
    prisma.property.count({ where: { status: "REJECTED", ...whereDate } }).catch(() => 0),
    prisma.booking.count({ where: whereDate }).catch(() => 0),
    prisma.booking.count({ where: { status: "CONFIRMED", ...whereDate } }).catch(() => 0),
    prisma.booking.count({ where: { status: "CANCELLED", ...whereDate } }).catch(() => 0),
    prisma.booking.count({ where: { status: "COMPLETED", ...whereDate } }).catch(() => 0),
    prisma.payment
      .aggregate({
        where: { status: "SUCCESS", ...whereDate },
        _sum: { amount: true },
      })
      .catch(() => ({ _sum: { amount: null } })),
    prisma.user.count({ where: whereDate }).catch(() => 0),
    prisma.booking
      .findMany({
        where: { status: { in: ["CONFIRMED", "COMPLETED"] }, ...whereDate },
        include: { property: { select: { id: true, title: true, city: true } } },
      })
      .catch(() => []),
    prisma.booking
      .findMany({
        where: { status: { in: ["CONFIRMED", "COMPLETED"] }, ...whereDate },
        include: { property: { include: { host: { select: { id: true, name: true, email: true } } } } },
      })
      .catch(() => []),
  ]);

  const totalVolume = Number(revenueAggregate._sum?.amount || 0);
  const totalCommission = calculatePlatformFee(totalVolume);

  // Top Earning Properties (Top 5)
  const propertyEarningsMap: Record<string, { title: string; city: string; revenue: number; bookings: number }> = {};
  topPropertiesRaw.forEach((b) => {
    const pId = b.propertyId;
    if (!propertyEarningsMap[pId]) {
      propertyEarningsMap[pId] = { title: b.property.title, city: b.property.city, revenue: 0, bookings: 0 };
    }
    propertyEarningsMap[pId].revenue += Number(b.totalPrice || 0);
    propertyEarningsMap[pId].bookings += 1;
  });
  const topProperties = Object.values(propertyEarningsMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Top Earning Hosts (Top 5)
  const hostEarningsMap: Record<string, { name: string; email: string; revenue: number; bookings: number }> = {};
  topHostsRaw.forEach((b) => {
    const hId = b.property.host.id;
    if (!hostEarningsMap[hId]) {
      hostEarningsMap[hId] = {
        name: b.property.host.name || b.property.host.email || "Host",
        email: b.property.host.email,
        revenue: 0,
        bookings: 0,
      };
    }
    hostEarningsMap[hId].revenue += Number(b.totalPrice || 0);
    hostEarningsMap[hId].bookings += 1;
  });
  const topHosts = Object.values(hostEarningsMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Monthly revenue chart data calculation for 6 months
  const now = new Date();
  const months: { name: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const monthName = d.toLocaleString("default", { month: "short" });

    const mRevenue = await prisma.payment
      .aggregate({
        where: { status: "SUCCESS", createdAt: { gte: d, lt: nextD } },
        _sum: { amount: true },
      })
      .catch(() => ({ _sum: { amount: null } }));

    months.push({
      name: monthName,
      revenue: calculatePlatformFee(Number(mRevenue._sum?.amount || 0)),
    });
  }

  const maxMonthRev = Math.max(...months.map((m) => m.revenue), 1);

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* HERO METRIC (TOP CENTER) */}
      <div className="max-w-lg mx-auto text-center bg-gradient-to-b from-[#faf7f0] to-white dark:from-[#1c1a14] dark:to-[#141310] border border-[#b8943d]/20 dark:border-[#c9a84c]/20 rounded-3xl p-10 shadow-sm space-y-4">
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#b8943d] dark:text-[#c9a84c]">
          TOTAL PLATFORM REVENUE
        </span>
        <h1 className="text-6xl font-black text-[#b8943d] dark:text-[#c9a84c] tracking-tight">
          {totalCommission.toLocaleString()} ETB
        </h1>
        <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278]">
          Total Platform Revenue ({PLATFORM_FEE_PERCENT}% Commission)
        </p>

        {/* 3 Sub-metrics in a row */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-black/[0.06] dark:border-[#fff8dc]/[0.06] text-xs">
          <div>
            <span className="text-[10px] text-[#9b8e7e] block font-semibold">Volume</span>
            <span className="font-bold text-[#1a1208] dark:text-[#f5f0e8]">
              {totalVolume.toLocaleString()} ETB
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#9b8e7e] block font-semibold">Bookings</span>
            <span className="font-bold text-[#1a1208] dark:text-[#f5f0e8]">
              {totalBookings}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#9b8e7e] block font-semibold">Users</span>
            <span className="font-bold text-[#1a1208] dark:text-[#f5f0e8]">
              {totalUsers}
            </span>
          </div>
        </div>
      </div>

      {/* TIME PERIOD SELECTOR (PILL ROW BELOW HERO METRIC CARD) */}
      <div className="flex justify-center">
        <Suspense fallback={null}>
          <TimePeriodSelector />
        </Suspense>
      </div>

      {/* SECOND ROW — THREE EQUAL CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Users Overview */}
        <div className="bg-white dark:bg-[#141310] p-6 rounded-3xl border border-black/[0.08] dark:border-white/[0.06] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#1a1208] dark:text-[#f5f0e8]">
              Users Overview
            </h3>
            <Users className="size-5 text-[#b8943d] dark:text-[#c9a84c]" />
          </div>
          <div>
            <span className="text-4xl font-black text-[#1a1208] dark:text-[#f5f0e8]">
              {totalUsers}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block mt-1">
              +{newUsersPeriod} new this period
            </span>
          </div>
          <div className="pt-3 border-t border-black/[0.05] dark:border-white/[0.05] flex justify-between text-xs text-[#6b5e4e] dark:text-[#8a8278]">
            <span>{totalRenters} Renters</span>
            <span>{totalHosts} Hosts</span>
            <span>{totalAdmins} Admins</span>
          </div>
        </div>

        {/* Card 2: Properties Overview */}
        <div className="bg-white dark:bg-[#141310] p-6 rounded-3xl border border-black/[0.08] dark:border-white/[0.06] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#1a1208] dark:text-[#f5f0e8]">
              Properties Overview
            </h3>
            <Home className="size-5 text-[#b8943d] dark:text-[#c9a84c]" />
          </div>
          <div>
            <span className="text-4xl font-black text-[#1a1208] dark:text-[#f5f0e8]">
              {totalProperties}
            </span>
            <span className="text-xs text-[#6b5e4e] dark:text-[#8a8278] block mt-1">
              Total Listed Stays
            </span>
          </div>
          {/* Visual Mini Bar */}
          <div className="w-full bg-black/[0.06] dark:bg-white/[0.06] h-2.5 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${totalProperties ? (approvedProperties / totalProperties) * 100 : 0}%` }}
              className="bg-emerald-500 h-full"
            />
            <div
              style={{ width: `${totalProperties ? (pendingProperties / totalProperties) * 100 : 0}%` }}
              className="bg-amber-500 h-full"
            />
            <div
              style={{ width: `${totalProperties ? (rejectedProperties / totalProperties) * 100 : 0}%` }}
              className="bg-red-500 h-full"
            />
          </div>
          <div className="flex justify-between text-[11px] font-medium text-[#6b5e4e] dark:text-[#8a8278]">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{approvedProperties} Approved</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">{pendingProperties} Pending</span>
            <span className="text-red-600 dark:text-red-400 font-bold">{rejectedProperties} Rejected</span>
          </div>
        </div>

        {/* Card 3: Bookings Overview */}
        <div className="bg-white dark:bg-[#141310] p-6 rounded-3xl border border-black/[0.08] dark:border-white/[0.06] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#1a1208] dark:text-[#f5f0e8]">
              Bookings Overview
            </h3>
            <Calendar className="size-5 text-[#b8943d] dark:text-[#c9a84c]" />
          </div>
          <div>
            <span className="text-4xl font-black text-[#1a1208] dark:text-[#f5f0e8]">
              {totalBookings}
            </span>
            <span className="text-xs text-[#6b5e4e] dark:text-[#8a8278] block mt-1">
              Total Reservations
            </span>
          </div>
          {/* Visual Mini Bar */}
          <div className="w-full bg-black/[0.06] dark:bg-white/[0.06] h-2.5 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${totalBookings ? (confirmedBookings / totalBookings) * 100 : 0}%` }}
              className="bg-[#b8943d] dark:bg-[#c9a84c] h-full"
            />
            <div
              style={{ width: `${totalBookings ? (completedBookings / totalBookings) * 100 : 0}%` }}
              className="bg-emerald-500 h-full"
            />
            <div
              style={{ width: `${totalBookings ? (cancelledBookings / totalBookings) * 100 : 0}%` }}
              className="bg-red-500 h-full"
            />
          </div>
          <div className="flex justify-between text-[11px] font-medium text-[#6b5e4e] dark:text-[#8a8278]">
            <span className="text-[#b8943d] dark:text-[#c9a84c] font-bold">{confirmedBookings} Confirmed</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{completedBookings} Completed</span>
            <span className="text-red-600 dark:text-red-400 font-bold">{cancelledBookings} Cancelled</span>
          </div>
        </div>
      </div>

      {/* THIRD ROW — REVENUE CHART (CSS BAR CHART, GOLD BARS, NO GRID LINES) */}
      <div className="bg-white dark:bg-[#141310] p-6 sm:p-8 rounded-3xl border border-black/[0.08] dark:border-white/[0.06] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-[#1a1208] dark:text-[#f5f0e8] text-base">
              Monthly Platform Revenue Trend
            </h2>
            <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278]">
              Clean monthly revenue breakdown for selected period
            </p>
          </div>
          <span className="text-xs font-bold text-[#b8943d] dark:text-[#c9a84c] bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 border border-[#b8943d]/20 px-3 py-1 rounded-full">
            {PLATFORM_FEE_PERCENT}% Commission
          </span>
        </div>

        <div className="h-52 flex items-end justify-between gap-3 pt-8 pb-2 border-b border-black/[0.06] dark:border-white/[0.06] px-4">
          {months.map((m, idx) => {
            const hPct = Math.max(8, Math.round((m.revenue / maxMonthRev) * 100));

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <span className="text-[10px] font-bold text-[#b8943d] dark:text-[#c9a84c] opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-100 dark:bg-[#1c1a16] px-2 py-0.5 rounded-md border border-black/[0.08]">
                  {m.revenue.toLocaleString()} ETB
                </span>
                <div
                  style={{ height: `${hPct}%` }}
                  className="w-full max-w-[48px] bg-[#b8943d] dark:bg-[#c9a84c] rounded-t-xl transition-all duration-300 hover:brightness-110"
                />
                <span className="text-xs font-semibold text-[#6b5e4e] dark:text-[#8a8278]">
                  {m.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOURTH ROW — TWO COLUMNS (TOP PROPERTIES & TOP HOSTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Top Earning Properties */}
        <div className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-white/[0.06] shadow-xs p-6 space-y-4">
          <h2 className="font-extrabold text-[#1a1208] dark:text-[#f5f0e8] text-base border-b border-black/[0.06] dark:border-white/[0.05] pb-3">
            Top Earning Properties
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] text-[#9b8e7e] uppercase border-b border-black/[0.05] dark:border-white/[0.05]">
                <tr>
                  <th className="py-2.5">Rank</th>
                  <th className="py-2.5">Property</th>
                  <th className="py-2.5 text-right">Revenue</th>
                  <th className="py-2.5 text-right">Bookings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                {topProperties.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[#6b5e4e] italic">
                      No property booking revenue yet.
                    </td>
                  </tr>
                ) : (
                  topProperties.map((p, idx) => (
                    <tr key={idx} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                      <td className="py-3 font-bold text-[#b8943d] dark:text-[#c9a84c]">
                        #{idx + 1}
                      </td>
                      <td className="py-3 font-bold text-[#1a1208] dark:text-[#f5f0e8]">
                        <p className="truncate max-w-[160px]">{p.title}</p>
                        <p className="text-[10px] text-[#9b8e7e] font-normal">{p.city}</p>
                      </td>
                      <td className="py-3 text-right font-black text-[#b8943d] dark:text-[#c9a84c]">
                        {p.revenue.toLocaleString()} ETB
                      </td>
                      <td className="py-3 text-right font-semibold text-[#6b5e4e] dark:text-[#8a8278]">
                        {p.bookings}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Top Earning Hosts */}
        <div className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-white/[0.06] shadow-xs p-6 space-y-4">
          <h2 className="font-extrabold text-[#1a1208] dark:text-[#f5f0e8] text-base border-b border-black/[0.06] dark:border-white/[0.05] pb-3">
            Top Earning Hosts
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] text-[#9b8e7e] uppercase border-b border-black/[0.05] dark:border-white/[0.05]">
                <tr>
                  <th className="py-2.5">Rank</th>
                  <th className="py-2.5">Host</th>
                  <th className="py-2.5 text-right">Revenue</th>
                  <th className="py-2.5 text-right">Bookings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                {topHosts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[#6b5e4e] italic">
                      No host booking earnings yet.
                    </td>
                  </tr>
                ) : (
                  topHosts.map((h, idx) => (
                    <tr key={idx} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                      <td className="py-3 font-bold text-[#b8943d] dark:text-[#c9a84c]">
                        #{idx + 1}
                      </td>
                      <td className="py-3 font-bold text-[#1a1208] dark:text-[#f5f0e8]">
                        <p className="truncate max-w-[160px]">{h.name}</p>
                        <p className="text-[10px] text-[#9b8e7e] font-normal truncate max-w-[160px]">{h.email}</p>
                      </td>
                      <td className="py-3 text-right font-black text-[#b8943d] dark:text-[#c9a84c]">
                        {h.revenue.toLocaleString()} ETB
                      </td>
                      <td className="py-3 text-right font-semibold text-[#6b5e4e] dark:text-[#8a8278]">
                        {h.bookings}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
