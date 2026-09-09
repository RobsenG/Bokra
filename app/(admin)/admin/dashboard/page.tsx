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
    orange: "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400",
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#1a1208] dark:text-[#f8f6f0] tracking-tight">
          Admin dashboard
        </h1>
        <p className="text-sm text-[#6b5e4e] dark:text-[#9b9080] mt-0.5">
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
              className="group bg-white dark:bg-[#12121a] rounded-2xl border border-black/[0.08] dark:border-white/[0.06] p-5 shadow-xs hover:border-[#b8943d]/40 dark:hover:border-[#c9a84c]/40 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl ${colorMap[stat.color]}`}>
                  <Icon className="size-5" />
                </div>
                <ArrowRight className="size-4 text-neutral-400 group-hover:text-[#b8943d] dark:group-hover:text-[#c9a84c] transition-colors mt-1" />
              </div>
              <div className="mt-4">
                <p className="text-xs font-medium text-[#6b5e4e] dark:text-[#9b9080]">
                  {stat.label}
                </p>
                <p className="text-2xl font-extrabold text-[#1a1208] dark:text-[#f8f6f0] mt-0.5">
                  {stat.value}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pending Verifications Alert */}
      {pendingVerifications > 0 && (
        <div className="flex items-start sm:items-center justify-between gap-4 p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 rounded-2xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-orange-900 dark:text-orange-300">
                {pendingVerifications} propert{pendingVerifications === 1 ? "y" : "ies"} awaiting verification
              </p>
              <p className="text-xs text-orange-700/80 dark:text-orange-400/80 mt-0.5">
                Review submitted properties and ownership documents.
              </p>
            </div>
          </div>
          <Link
            href="/admin/verifications"
            className="shrink-0 px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#b8943d] dark:bg-[#c9a84c] hover:brightness-110 text-white dark:text-[#0a0a0f] shadow-xs transition-colors"
          >
            Review
          </Link>
        </div>
      )}

      {/* Recent Users */}
      <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-black/[0.08] dark:border-white/[0.06] shadow-xs">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.06]">
          <h2 className="font-bold text-[#1a1208] dark:text-[#f8f6f0] text-sm">
            Recent users
          </h2>
          <Link
            href="/admin/users"
            className="text-xs font-semibold text-[#b8943d] dark:text-[#c9a84c] hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
          {recentUsers.map((user, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-6 py-3.5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-full bg-[#b8943d] dark:bg-[#c9a84c] flex items-center justify-center text-white dark:text-[#0a0a0f] font-bold text-xs shrink-0">
                  {(user.name || user.email || "U").substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1a1208] dark:text-[#f8f6f0] truncate">
                    {user.name || "—"}
                  </p>
                  <p className="text-xs text-[#6b5e4e] dark:text-[#9b9080] truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 pl-4 space-y-1">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    user.role === "ADMIN"
                      ? "bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] border border-[#b8943d]/20 dark:border-[#c9a84c]/20"
                      : user.role === "HOST"
                      ? "bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] border border-[#b8943d]/20 dark:border-[#c9a84c]/20"
                      : "bg-black/5 dark:bg-white/5 text-[#6b5e4e] dark:text-[#9b9080]"
                  }`}
                >
                  {user.role}
                </span>
                <p className="text-[10px] text-[#6b5e4e] dark:text-[#9b9080]">
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
