import React, { Suspense } from "react";
import prisma from "@/lib/prisma";
import TimePeriodSelector from "@/components/superadmin/TimePeriodSelector";
import AnalyticsTables from "@/components/superadmin/AnalyticsTables";
import {
  TrendingUp,
  DollarSign,
  Users,
  Building,
  Calendar,
  Award,
} from "lucide-react";

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

export default async function SuperAdminAnalyticsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const period = resolvedParams.period || "all";
  const dateFilter = getDateFilter(period);
  const whereDate = dateFilter ? { createdAt: dateFilter } : {};

  // 1. REVENUE ANALYTICS DATA
  const now = new Date();
  const monthlyRevenueRows = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const monthName = d.toLocaleString("default", { month: "long", year: "numeric" });

    const pAgg = await prisma.payment
      .aggregate({
        where: { status: "SUCCESS", createdAt: { gte: d, lt: nextD } },
        _sum: { amount: true },
        _count: { id: true },
      })
      .catch(() => ({ _sum: { amount: null }, _count: { id: 0 } }));

    const vol = Number(pAgg._sum?.amount || 0);
    const comm = vol * 0.03;

    monthlyRevenueRows.push({
      month: monthName,
      transactions: pAgg._count.id || 0,
      volume: vol,
      commission: comm,
    });
  }

  // Top Earning Properties
  const topPropertiesRaw = await prisma.booking
    .findMany({
      where: { status: { in: ["CONFIRMED", "COMPLETED"] }, ...whereDate },
      include: { property: { select: { id: true, title: true, city: true } } },
    })
    .catch(() => []);

  const propertyEarningsMap: Record<string, { title: string; city: string; revenue: number; bookings: number }> = {};
  topPropertiesRaw.forEach((b) => {
    const pId = b.propertyId;
    if (!propertyEarningsMap[pId]) {
      propertyEarningsMap[pId] = {
        title: b.property.title,
        city: b.property.city,
        revenue: 0,
        bookings: 0,
      };
    }
    propertyEarningsMap[pId].revenue += Number(b.totalPrice || 0);
    propertyEarningsMap[pId].bookings += 1;
  });

  const topPropertiesTable = Object.values(propertyEarningsMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Top Earning Hosts
  const topHostsRaw = await prisma.booking
    .findMany({
      where: { status: { in: ["CONFIRMED", "COMPLETED"] }, ...whereDate },
      include: {
        property: {
          include: { host: { select: { id: true, name: true, email: true } } },
        },
      },
    })
    .catch(() => []);

  const hostEarningsMap: Record<string, { name: string; email: string; earnings: number; bookings: number }> = {};
  topHostsRaw.forEach((b) => {
    const hId = b.property.host.id;
    if (!hostEarningsMap[hId]) {
      hostEarningsMap[hId] = {
        name: b.property.host.name || "Host",
        email: b.property.host.email,
        earnings: 0,
        bookings: 0,
      };
    }
    hostEarningsMap[hId].earnings += Number(b.totalPrice || 0) * 0.97;
    hostEarningsMap[hId].bookings += 1;
  });

  const topHostsTable = Object.values(hostEarningsMap)
    .sort((a, b) => b.earnings - a.earnings)
    .slice(0, 10);

  // 2. USER ANALYTICS DATA
  const [rentersCount, hostsCount, mostActiveRentersRaw, mostActiveHostsRaw] = await Promise.all([
    prisma.user.count({ where: { role: "RENTER", ...whereDate } }).catch(() => 0),
    prisma.user.count({ where: { role: "HOST", ...whereDate } }).catch(() => 0),
    prisma.user
      .findMany({
        where: { role: "RENTER" },
        select: {
          id: true,
          name: true,
          email: true,
          _count: { select: { bookings: true } },
        },
        orderBy: { bookings: { _count: "desc" } },
        take: 5,
      })
      .catch(() => []),
    prisma.user
      .findMany({
        where: { role: "HOST" },
        select: {
          id: true,
          name: true,
          email: true,
          _count: { select: { properties: true } },
        },
        orderBy: { properties: { _count: "desc" } },
        take: 5,
      })
      .catch(() => []),
  ]);

  const mostActiveRenters = mostActiveRentersRaw.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    count: u._count.bookings,
  }));

  const mostActiveHosts = mostActiveHostsRaw.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    count: u._count.properties,
  }));

  // 3. BOOKING ANALYTICS DATA
  const allBookings = await prisma.booking
    .findMany({
      where: whereDate,
      select: {
        id: true,
        checkIn: true,
        checkOut: true,
        status: true,
        property: { select: { city: true } },
      },
    })
    .catch(() => []);

  const totalB = allBookings.length;
  const confirmedB = allBookings.filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED").length;
  const bookingSuccessRate = totalB > 0 ? Math.round((confirmedB / totalB) * 100) : 0;

  // Average duration
  let totalNights = 0;
  allBookings.forEach((b) => {
    const diff = Math.max(1, Math.ceil((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / (1000 * 3600 * 24)));
    totalNights += diff;
  });
  const avgDuration = totalB > 0 ? (totalNights / totalB).toFixed(1) : "0";

  // 4. PROPERTY ANALYTICS DATA
  const allProperties = await prisma.property
    .findMany({
      where: whereDate,
      select: {
        id: true,
        title: true,
        city: true,
        pricePerNight: true,
        isVerified: true,
        status: true,
        _count: { select: { reviews: true } },
      },
    })
    .catch(() => []);

  const totalProps = allProperties.length;
  const verifiedProps = allProperties.filter((p) => p.isVerified).length;
  const approvalRate = totalProps > 0 ? Math.round((verifiedProps / totalProps) * 100) : 0;

  // Properties by city & avg price
  const cityPropertyMap: Record<string, { count: number; totalPrice: number }> = {};
  allProperties.forEach((p) => {
    const city = p.city || "Unknown";
    if (!cityPropertyMap[city]) {
      cityPropertyMap[city] = { count: 0, totalPrice: 0 };
    }
    cityPropertyMap[city].count += 1;
    cityPropertyMap[city].totalPrice += Number(p.pricePerNight || 0);
  });

  const cityPropertyTable = Object.entries(cityPropertyMap).map(([city, data]) => ({
    city,
    count: data.count,
    avgPrice: Math.round(data.totalPrice / data.count),
  }));

  const mostReviewedProperties = [...allProperties]
    .sort((a, b) => b._count.reviews - a._count.reviews)
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      title: p.title,
      city: p.city,
      pricePerNight: Number(p.pricePerNight || 0),
      isVerified: p.isVerified,
      status: p.status,
      reviewsCount: p._count.reviews,
    }));

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1a1208] dark:text-[#f5f0e8] tracking-tight">
            Deep Platform Analytics
          </h1>
          <p className="text-sm text-[#6b5e4e] dark:text-[#8a8278] mt-1">
            Comprehensive breakdown of revenue, users, booking metrics, and property inventory.
          </p>
        </div>
        <Suspense fallback={null}>
          <TimePeriodSelector />
        </Suspense>
      </div>

      {/* SUMMARY STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#141310] p-5 rounded-2xl border border-black/[0.08] dark:border-white/[0.06] shadow-sm">
          <p className="text-xs font-semibold text-[#6b5e4e] dark:text-[#8a8278]">Renter vs Host Ratio</p>
          <p className="text-2xl font-bold text-[#1a1208] dark:text-[#f5f0e8] mt-1">
            {hostsCount > 0 ? (rentersCount / hostsCount).toFixed(1) : rentersCount} : 1
          </p>
          <p className="text-xs text-[#9b8e7e] dark:text-[#6b6257] mt-1">
            {rentersCount} Renters / {hostsCount} Hosts
          </p>
        </div>

        <div className="bg-white dark:bg-[#141310] p-5 rounded-2xl border border-black/[0.08] dark:border-white/[0.06] shadow-sm">
          <p className="text-xs font-semibold text-[#6b5e4e] dark:text-[#8a8278]">Booking Success Rate</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {bookingSuccessRate}%
          </p>
        </div>

        <div className="bg-white dark:bg-[#141310] p-5 rounded-2xl border border-black/[0.08] dark:border-white/[0.06] shadow-sm">
          <p className="text-xs font-semibold text-[#6b5e4e] dark:text-[#8a8278]">Avg Booking Duration</p>
          <p className="text-2xl font-bold text-[#1a1208] dark:text-[#f5f0e8] mt-1">
            {avgDuration} nights
          </p>
        </div>

        <div className="bg-white dark:bg-[#141310] p-5 rounded-2xl border border-black/[0.08] dark:border-white/[0.06] shadow-sm">
          <p className="text-xs font-semibold text-[#6b5e4e] dark:text-[#8a8278]">Property Approval Rate</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            {approvalRate}%
          </p>
        </div>
      </div>

      {/* ANALYTICS TABLES CLIENT COMPONENT */}
      <AnalyticsTables
        monthlyRevenueRows={monthlyRevenueRows}
        topPropertiesTable={topPropertiesTable}
        topHostsTable={topHostsTable}
        mostActiveRenters={mostActiveRenters}
        mostActiveHosts={mostActiveHosts}
        cityPropertyTable={cityPropertyTable}
        mostReviewedProperties={mostReviewedProperties}
      />
    </div>
  );
}
