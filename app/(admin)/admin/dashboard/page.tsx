import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { getUnreadNotifications } from "@/lib/notifications";
import {
  Users,
  Building2,
  CalendarDays,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CreditCard,
  Zap,
  Activity,
  UserCheck,
  Building,
  Clock,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;

  const [
    userCount,
    hostCount,
    propertyCount,
    pendingVerifications,
    bookingCount,
    recentUsers,
    totalRevenue,
    unreadNotifications,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "RENTER" } }),
    prisma.user.count({ where: { role: "HOST" } }),
    prisma.property.count({ where: { isVerified: true } }),
    prisma.property.count({ where: { isVerified: false, status: "PENDING" } }),
    prisma.booking.count(),
    prisma.user.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: { name: true, email: true, role: true, createdAt: true, isVerified: true },
    }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "SUCCESS" } }),
    getUnreadNotifications(),
  ]);

  const revenue = Number(totalRevenue._sum.amount || 0);

  // Status Overview Pills
  const statusPills = [
    { label: "Active Renters", count: userCount, icon: Users, color: "text-blue-500" },
    { label: "Registered Hosts", count: hostCount, icon: Building2, color: "text-[#b8943d] dark:text-[#c9a84c]" },
    { label: "Verified Stays", count: propertyCount, icon: ShieldCheck, color: "text-emerald-500" },
    { label: "Pending Review", count: pendingVerifications, icon: AlertCircle, color: "text-amber-500" },
    { label: "Total Bookings", count: bookingCount, icon: CalendarDays, color: "text-purple-500" },
    { label: "Unread Alerts", count: unreadNotifications.length, icon: Zap, color: "text-[#b8943d] dark:text-[#c9a84c]" },
  ];

  // 3x2 Grid Stats Cards with CSS Sparklines
  const gridStats = [
    {
      label: "Total Renters",
      value: userCount.toLocaleString(),
      href: "/admin/users",
      icon: Users,
      color: "#3b82f6",
      sparkline: [40, 55, 65, 80, userCount || 90],
    },
    {
      label: "Property Hosts",
      value: hostCount.toLocaleString(),
      href: "/admin/users",
      icon: Building2,
      color: "#b8943d",
      sparkline: [12, 18, 25, 30, hostCount || 35],
    },
    {
      label: "Verified Listings",
      value: propertyCount.toLocaleString(),
      href: "/properties",
      icon: ShieldCheck,
      color: "#10b981",
      sparkline: [20, 32, 45, 60, propertyCount || 75],
    },
    {
      label: "Pending Verifications",
      value: pendingVerifications.toLocaleString(),
      href: "/admin/verifications",
      icon: AlertCircle,
      color: "#f59e0b",
      sparkline: [8, 12, 5, 10, pendingVerifications || 14],
    },
    {
      label: "Total Bookings",
      value: bookingCount.toLocaleString(),
      href: "/admin/bookings",
      icon: CalendarDays,
      color: "#8b5cf6",
      sparkline: [30, 45, 60, 90, bookingCount || 110],
    },
    {
      label: "Platform Revenue",
      value: `${revenue.toLocaleString()} ETB`,
      href: "/admin/revenue",
      icon: CreditCard,
      color: "#b8943d",
      sparkline: [5000, 12000, 28000, 45000, revenue || 60000],
    },
  ];

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#1a1208] dark:text-[#f5f0e8] tracking-tight">
          Admin Command Center
        </h1>
        <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278] mt-1">
          Real-time operations dashboard, user verifications, and system activity logs.
        </p>
      </div>

      {/* TOP SECTION — Status Overview (Pill Row) */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {statusPills.map((pill) => {
          const Icon = pill.icon;
          return (
            <div
              key={pill.label}
              className="inline-flex items-center gap-2 bg-white dark:bg-[#141310] border border-black/[0.08] dark:border-white/[0.06] rounded-full px-4 py-2 text-sm font-semibold shadow-xs shrink-0"
            >
              <Icon className={`size-4 ${pill.color}`} />
              <span className="text-[#6b5e4e] dark:text-[#8a8278] text-xs font-medium">
                {pill.label}:
              </span>
              <span className="font-extrabold text-[#1a1208] dark:text-[#f5f0e8]">
                {pill.count}
              </span>
            </div>
          );
        })}
      </div>

      {/* PENDING VERIFICATIONS HIGHLIGHT BANNER */}
      {pendingVerifications > 0 && (
        <div className="bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/25 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Zap className="size-6 animate-pulse" />
            </div>
            <div>
              <p className="font-extrabold text-base text-amber-900 dark:text-[#fcd34d]">
                ⚡ {pendingVerifications} {pendingVerifications === 1 ? "property" : "properties"} waiting for verification
              </p>
              <p className="text-xs text-amber-800/80 dark:text-[#fcd34d]/80 mt-0.5">
                Review host documents and property details to publish live stays on Bokra Stay.
              </p>
            </div>
          </div>
          <Link
            href="/admin/verifications"
            className="shrink-0 px-6 py-2.5 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors"
          >
            Review Now →
          </Link>
        </div>
      )}

      {/* STATS BELOW IN A 3x2 GRID WITH CSS SPARKLINES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {gridStats.map((stat) => {
          const Icon = stat.icon;
          const maxSparkle = Math.max(...stat.sparkline, 1);

          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-white/[0.06] p-6 shadow-xs group hover:border-[#b8943d]/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9b8e7e] dark:text-[#8a8278]">
                  {stat.label}
                </span>
                <div className="p-2.5 rounded-2xl bg-[#faf9f7] dark:bg-[#1c1a16] border border-black/[0.05] dark:border-[#fff8dc]/[0.05]">
                  <Icon className="size-5 text-[#b8943d] dark:text-[#c9a84c]" />
                </div>
              </div>

              <div>
                <span className="text-3xl font-black text-[#1a1208] dark:text-[#f5f0e8]">
                  {stat.value}
                </span>
              </div>

              {/* CSS Sparkline & Action link */}
              <div className="flex items-end justify-between pt-2 border-t border-black/[0.04] dark:border-white/[0.04]">
                {/* 5 data points as CSS bars */}
                <div className="flex items-end gap-1.5 h-7">
                  {stat.sparkline.map((val, idx) => {
                    const hPct = Math.max(15, Math.round((val / maxSparkle) * 100));
                    return (
                      <div
                        key={idx}
                        className="w-2 rounded-t-md bg-[#b8943d] dark:bg-[#c9a84c] opacity-60 group-hover:opacity-100 transition-opacity"
                        style={{ height: `${hPct}%` }}
                      />
                    );
                  })}
                </div>

                <span className="text-xs font-bold text-[#b8943d] dark:text-[#c9a84c] group-hover:underline flex items-center gap-1">
                  <span>Manage</span>
                  <ArrowRight className="size-3" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* RECENT ACTIVITY FEED (TIMELINE DESIGN) */}
      <div className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-[#fff8dc]/[0.05] pb-4">
          <div className="flex items-center gap-2.5">
            <Activity className="size-5 text-[#b8943d] dark:text-[#c9a84c]" />
            <h2 className="font-extrabold text-[#1a1208] dark:text-[#f5f0e8] text-base">
              System Activity &amp; User Registrations Feed
            </h2>
          </div>
          <Link
            href="/admin/users"
            className="text-xs font-bold text-[#b8943d] dark:text-[#c9a84c] hover:underline"
          >
            View all users
          </Link>
        </div>

        {/* Timeline List */}
        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-black/10 dark:before:bg-white/10">
          {recentUsers.map((user: { name: string | null; email: string; role: string; createdAt: Date; isVerified: boolean }, idx: number) => {
            const timeAgo = new Date(user.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            });
            const roleColor =
              user.role === "HOST"
                ? "bg-[#b8943d] dark:bg-[#c9a84c]"
                : user.role === "ADMIN"
                ? "bg-purple-500"
                : "bg-blue-500";

            return (
              <div key={idx} className="relative flex items-start justify-between gap-4">
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-[27px] top-1.5 w-3 h-3 rounded-full ${roleColor} ring-4 ring-white dark:ring-[#141310]`}
                />

                <div className="space-y-0.5">
                  <p className="text-xs font-extrabold text-[#1a1208] dark:text-[#f5f0e8]">
                    {user.name || user.email}{" "}
                    <span className="font-normal text-[#6b5e4e] dark:text-[#8a8278]">
                      registered as a new {user.role.toLowerCase()}
                    </span>
                  </p>
                  <p className="text-[11px] text-[#9b8e7e] dark:text-[#6b6257]">
                    Account status: {user.isVerified ? "Verified" : "Unverified"}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-mono text-[#9b8e7e] dark:text-[#8a8278]">
                    {timeAgo}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
