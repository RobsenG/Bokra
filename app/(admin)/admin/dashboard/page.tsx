import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { getUnreadNotifications } from "@/lib/notifications";
import AdminNotificationsPanel from "@/components/dashboard/AdminNotificationsPanel";
import {
  Users,
  Building2,
  CalendarDays,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CreditCard,
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
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { name: true, email: true, role: true, createdAt: true, isVerified: true },
    }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "SUCCESS" } }),
    getUnreadNotifications(),
  ]);

  const revenue = Number(totalRevenue._sum.amount || 0);

  const stats = [
    { label: "Total Renters", value: userCount, icon: Users, color: "teal", href: "/admin/users" },
    { label: "Total Hosts", value: hostCount, icon: Building2, color: "emerald", href: "/admin/users" },
    { label: "Verified Properties", value: propertyCount, icon: ShieldCheck, color: "violet", href: "/properties" },
    { label: "Pending Verifications", value: pendingVerifications, icon: AlertCircle, color: "orange", href: "/admin/verifications" },
    { label: "Total Bookings", value: bookingCount, icon: CalendarDays, color: "blue", href: "/admin/bookings" },
    { label: "Total Revenue (ETB)", value: revenue.toLocaleString(), icon: CreditCard, color: "rose", href: "/admin/revenue" },
  ];

  const colorMap: Record<string, string> = {
    teal: "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400",
    emerald: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
    violet: "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400",
    orange: "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400",
    blue: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
    rose: "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-800 dark:text-white tracking-tight">
          System Overview
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Platform health and activity at a glance.
        </p>
      </div>

      {/* Admin Alert Feed for Duplicate Listings and System Notifications */}
      <AdminNotificationsPanel initialNotifications={unreadNotifications} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-xs hover:shadow-md transition-all"
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

      {/* Pending Verifications Alert */}
      {pendingVerifications > 0 && (
        <div className="flex items-start sm:items-center justify-between gap-4 p-4 bg-orange-50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-orange-800 dark:text-orange-300">
                {pendingVerifications} propert{pendingVerifications === 1 ? "y" : "ies"} awaiting verification
              </p>
              <p className="text-xs text-orange-700/80 dark:text-orange-400/80 mt-0.5">
                Review submitted listings and ownership proof documents to approve or reject them.
              </p>
            </div>
          </div>
          <Link
            href="/admin/verifications"
            className="shrink-0 px-4 py-1.5 rounded-lg text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-colors"
          >
            Review Now
          </Link>
        </div>
      )}

      {/* Recent Users */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-xs">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h2 className="font-bold text-neutral-800 dark:text-white text-sm">
            Recently Joined Users
          </h2>
          <Link
            href="/admin/users"
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {recentUsers.map((user, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-6 py-3.5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {(user.name || user.email || "U").substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 truncate">
                    {user.name || "—"}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 pl-4 space-y-1">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    user.role === "ADMIN"
                      ? "bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300"
                      : user.role === "HOST"
                      ? "bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400"
                      : "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  {user.role}
                </span>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                  {user.isVerified ? "✓ Verified" : "Unverified"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
