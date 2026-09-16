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
    { label: "Renters", value: userCount, icon: Users, color: "gold", href: "/admin/users" },
    { label: "Hosts", value: hostCount, icon: Building2, color: "gold", href: "/admin/users" },
    { label: "Verified properties", value: propertyCount, icon: ShieldCheck, color: "gold", href: "/properties" },
    { label: "Pending reviews", value: pendingVerifications, icon: AlertCircle, color: "orange", href: "/admin/verifications" },
    { label: "Bookings", value: bookingCount, icon: CalendarDays, color: "gold", href: "/admin/bookings" },
    { label: "Total revenue", value: `${revenue.toLocaleString()} ETB`, icon: CreditCard, color: "gold", href: "/admin/revenue" },
  ];

  const colorMap: Record<string, string> = {
    gold: "bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c]",
    orange: "bg-amber-50 dark:bg-[#f59e0b]/10 text-amber-600 dark:text-[#fcd34d]",
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-[#f5f0e8] tracking-tight">
          Admin dashboard
        </h1>
        <p className="text-sm text-neutral-500 dark:text-[#8a8278] mt-0.5">
          Overview of users, properties, and bookings.
        </p>
      </div>

      {/* Admin Alert Feed */}
      <AdminNotificationsPanel initialNotifications={unreadNotifications} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group bg-white dark:bg-[#141310] rounded-2xl border border-neutral-200 dark:border-[#fff8dc]/[0.06] p-5 shadow-xs hover:border-[#b8943d]/40 dark:hover:border-[#c9a84c]/30 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl ${colorMap[stat.color]}`}>
                  <Icon className="size-5" />
                </div>
                <ArrowRight className="size-4 text-neutral-400 group-hover:text-[#b8943d] dark:group-hover:text-[#c9a84c] transition-colors mt-1" />
              </div>
              <div className="mt-4">
                <p className="text-xs font-medium text-neutral-500 dark:text-[#8a8278]">
                  {stat.label}
                </p>
                <p className="text-2xl font-extrabold text-neutral-900 dark:text-[#f5f0e8] mt-0.5">
                  {stat.value}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pending Verifications Alert */}
      {pendingVerifications > 0 && (
        <div className="flex items-start sm:items-center justify-between gap-4 p-4 bg-amber-50 dark:bg-[#f59e0b]/10 border border-amber-200 dark:border-[#f59e0b]/20 rounded-2xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-amber-600 dark:text-[#fcd34d] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-900 dark:text-[#fcd34d]">
                {pendingVerifications} propert{pendingVerifications === 1 ? "y" : "ies"} awaiting verification
              </p>
              <p className="text-xs text-amber-700/80 dark:text-[#fcd34d]/80 mt-0.5">
                Review submitted properties and ownership documents.
              </p>
            </div>
          </div>
          <Link
            href="/admin/verifications"
            className="shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold bg-[#b8943d] dark:bg-[#c9a84c] hover:bg-[#d4b458] text-white dark:text-[#0c0b09] shadow-xs transition-colors"
          >
            Review
          </Link>
        </div>
      )}

      {/* Recent Users */}
      <div className="bg-white dark:bg-[#141310] rounded-2xl border border-neutral-200 dark:border-[#fff8dc]/[0.06] shadow-xs">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-[#fff8dc]/[0.05]">
          <h2 className="font-bold text-neutral-900 dark:text-[#f5f0e8] text-sm">
            Recent users
          </h2>
          <Link
            href="/admin/users"
            className="text-xs font-semibold text-[#b8943d] dark:text-[#c9a84c] hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="divide-y divide-neutral-200 dark:divide-[#fff8dc]/[0.04]">
          {recentUsers.map((user, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-6 py-3.5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-full bg-[#b8943d] dark:bg-[#c9a84c] flex items-center justify-center text-white dark:text-[#080806] font-bold text-xs shrink-0">
                  {(user.name || user.email || "U").substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-[#f5f0e8] truncate">
                    {user.name || "—"}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-[#8a8278] truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 pl-4 space-y-1">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    user.role === "ADMIN"
                      ? "bg-[#b8943d]/10 dark:bg-[#fff8dc]/[0.06] text-[#b8943d] dark:text-[#d4cfc7] border border-[#b8943d]/20 dark:border-[#fff8dc]/[0.12]"
                      : user.role === "HOST"
                      ? "bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] border border-[#b8943d]/20 dark:border-[#c9a84c]/20"
                      : "bg-black/5 dark:bg-[#60a5fa]/10 text-neutral-600 dark:text-[#93c5fd]"
                  }`}
                >
                  {user.role}
                </span>
                <p className="text-[10px] text-neutral-500 dark:text-[#8a8278]">
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
