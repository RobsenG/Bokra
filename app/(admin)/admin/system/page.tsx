import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import SystemNotificationsPanel from "./SystemNotificationsPanel";
import {
  Activity,
  Users,
  Building2,
  CalendarDays,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  Cpu,
  Database,
  Globe,
  Zap,
  Server,
} from "lucide-react";

export default async function AdminSystemPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Section 1: Platform Health Stats
  const [
    totalUsers,
    totalHosts,
    totalRenters,
    totalProperties,
    approvedProperties,
    pendingProperties,
    rejectedProperties,
    totalBookings,
    confirmedBookings,
    totalPayments,
    totalRevenue,
    notifications,
    recentUsers,
    recentProperties,
    recentBookings,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "HOST" } }),
    prisma.user.count({ where: { role: "RENTER" } }),
    prisma.property.count(),
    prisma.property.count({ where: { isVerified: true } }),
    prisma.property.count({ where: { status: "PENDING" } }),
    prisma.property.count({ where: { status: "REJECTED" } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.payment.count({ where: { status: "SUCCESS" } }),
    prisma.payment.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true },
    }),
    prisma.adminNotification.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.user.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.property.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, city: true, status: true, createdAt: true },
    }),
    prisma.booking.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      select: { id: true, totalPrice: true, status: true, createdAt: true, property: { select: { title: true } } },
    }),
  ]);

  const revenueVolume = Number(totalRevenue._sum.amount || 0);

  // Combine recent events into a timeline feed (sorted by date)
  const activityFeed = [
    ...recentUsers.map((u) => ({
      id: `user-${u.id}`,
      type: "USER_REGISTERED",
      title: `New User: ${u.name || u.email}`,
      subtitle: `Role: ${u.role}`,
      date: u.createdAt,
      icon: Users,
      color: "teal",
    })),
    ...recentProperties.map((p) => ({
      id: `prop-${p.id}`,
      type: "PROPERTY_CREATED",
      title: `Property Submission: "${p.title}"`,
      subtitle: `City: ${p.city} (${p.status})`,
      date: p.createdAt,
      icon: Building2,
      color: "orange",
    })),
    ...recentBookings.map((b) => ({
      id: `book-${b.id}`,
      type: "BOOKING_CREATED",
      title: `Booking #${b.id.substring(0, 8)}: "${b.property.title}"`,
      subtitle: `${Number(b.totalPrice).toLocaleString()} ETB (${b.status})`,
      date: b.createdAt,
      icon: CalendarDays,
      color: "blue",
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-800 dark:text-[#f5f0e8] tracking-tight">
          System Health &amp; Diagnostics
        </h1>
        <p className="text-sm text-neutral-500 dark:text-[#8a8278] mt-0.5">
          Platform-wide operations, audit log feed, and infrastructure parameters.
        </p>
      </div>

      {/* SECTION 1 — Platform Health (Stats Grid) */}
      <div className="space-y-4">
        <h2 className="font-bold text-neutral-800 dark:text-[#f5f0e8] text-base flex items-center gap-2">
          <Activity className="size-4 text-teal-600 dark:text-[#c9a84c]" />
          <span>Platform Health Metrics</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5">
          <div className="bg-white dark:bg-[#141310] p-4 rounded-2xl border border-neutral-100 dark:border-[#fff8dc]/[0.06] shadow-xs">
            <p className="text-[10px] font-bold text-neutral-400 dark:text-[#8a8278] uppercase tracking-wider">Total Users</p>
            <p className="text-xl font-extrabold text-neutral-800 dark:text-[#f5f0e8] mt-1">{totalUsers}</p>
            <p className="text-[10px] text-neutral-400 dark:text-[#8a8278] mt-0.5">{totalHosts} Hosts • {totalRenters} Renters</p>
          </div>

          <div className="bg-white dark:bg-[#141310] p-4 rounded-2xl border border-neutral-100 dark:border-[#fff8dc]/[0.06] shadow-xs">
            <p className="text-[10px] font-bold text-neutral-400 dark:text-[#8a8278] uppercase tracking-wider">Total Properties</p>
            <p className="text-xl font-extrabold text-neutral-800 dark:text-[#f5f0e8] mt-1">{totalProperties}</p>
            <p className="text-[10px] text-emerald-600 dark:text-[#86efac] font-bold mt-0.5">{approvedProperties} Approved</p>
          </div>

          <div className="bg-white dark:bg-[#141310] p-4 rounded-2xl border border-neutral-100 dark:border-[#fff8dc]/[0.06] shadow-xs">
            <p className="text-[10px] font-bold text-amber-600 dark:text-[#fcd34d] uppercase tracking-wider">Pending Review</p>
            <p className="text-xl font-extrabold text-amber-700 dark:text-[#fcd34d] mt-1">{pendingProperties}</p>
            <p className="text-[10px] text-neutral-400 dark:text-[#8a8278] mt-0.5">Listings awaiting admin</p>
          </div>

          <div className="bg-white dark:bg-[#141310] p-4 rounded-2xl border border-neutral-100 dark:border-[#fff8dc]/[0.06] shadow-xs">
            <p className="text-[10px] font-bold text-red-600 dark:text-[#fca5a5] uppercase tracking-wider">Rejected Listings</p>
            <p className="text-xl font-extrabold text-red-700 dark:text-[#fca5a5] mt-1">{rejectedProperties}</p>
            <p className="text-[10px] text-neutral-400 dark:text-[#8a8278] mt-0.5">Require host edit</p>
          </div>

          <div className="bg-white dark:bg-[#141310] p-4 rounded-2xl border border-neutral-100 dark:border-[#fff8dc]/[0.06] shadow-xs">
            <p className="text-[10px] font-bold text-blue-600 dark:text-[#93c5fd] uppercase tracking-wider">Total Bookings</p>
            <p className="text-xl font-extrabold text-blue-700 dark:text-[#93c5fd] mt-1">{totalBookings}</p>
            <p className="text-[10px] text-neutral-400 dark:text-[#8a8278] mt-0.5">{confirmedBookings} Confirmed</p>
          </div>

          <div className="bg-white dark:bg-[#141310] p-4 rounded-2xl border border-neutral-100 dark:border-[#fff8dc]/[0.06] shadow-xs">
            <p className="text-[10px] font-bold text-teal-600 dark:text-[#c9a84c] uppercase tracking-wider">Payment Volume</p>
            <p className="text-xl font-extrabold text-teal-700 dark:text-[#c9a84c] mt-1">{revenueVolume.toLocaleString()} ETB</p>
            <p className="text-[10px] text-neutral-400 dark:text-[#8a8278] mt-0.5">{totalPayments} Success Payments</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 2 — Recent Activity Feed */}
        <div className="bg-white dark:bg-[#141310] rounded-2xl border border-neutral-100 dark:border-[#fff8dc]/[0.06] p-6 shadow-xs space-y-4">
          <h2 className="font-bold text-neutral-800 dark:text-[#f5f0e8] text-base flex items-center gap-2">
            <Clock className="size-4 text-teal-600 dark:text-[#c9a84c]" />
            <span>Recent Activity Feed</span>
          </h2>

          <div className="space-y-3">
            {activityFeed.map((event) => {
              const Icon = event.icon;
              return (
                <div key={event.id} className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-[#1c1a16] border border-neutral-100 dark:border-[#fff8dc]/[0.06] text-xs">
                  <div className="p-2 rounded-lg bg-teal-50 dark:bg-[#c9a84c]/10 text-teal-600 dark:text-[#c9a84c] shrink-0 mt-0.5">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-neutral-800 dark:text-[#f5f0e8] truncate">{event.title}</p>
                    <p className="text-neutral-500 dark:text-[#8a8278] text-[11px] truncate">{event.subtitle}</p>
                  </div>
                  <span className="text-[10px] text-neutral-400 dark:text-[#524d47] shrink-0 font-medium">
                    {new Date(event.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3 — Notifications Panel */}
        <SystemNotificationsPanel
          initialNotifications={notifications.map((n) => ({
            id: n.id,
            type: n.type,
            message: n.message,
            isRead: n.isRead,
            propertyId: n.propertyId,
            createdAt: n.createdAt.toISOString(),
          }))}
        />
      </div>

      {/* SECTION 4 — System Information Card */}
      <div className="bg-white dark:bg-[#141310] rounded-2xl border border-neutral-100 dark:border-[#fff8dc]/[0.06] p-6 shadow-xs space-y-4">
        <h2 className="font-bold text-neutral-800 dark:text-[#f5f0e8] text-base flex items-center gap-2">
          <Server className="size-4 text-teal-600 dark:text-[#c9a84c]" />
          <span>System Environment &amp; Infrastructure</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-neutral-50 dark:bg-[#1c1a16] rounded-xl border border-neutral-100 dark:border-[#fff8dc]/[0.06] space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 dark:text-[#8a8278] uppercase tracking-wider flex items-center gap-1">
              <Zap className="size-3 text-amber-500 dark:text-[#fcd34d]" /> Version
            </span>
            <p className="font-bold text-neutral-800 dark:text-[#f5f0e8]">v1.0.0 (Production)</p>
          </div>

          <div className="p-3.5 bg-neutral-50 dark:bg-[#1c1a16] rounded-xl border border-neutral-100 dark:border-[#fff8dc]/[0.06] space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 dark:text-[#8a8278] uppercase tracking-wider flex items-center gap-1">
              <Database className="size-3 text-blue-500 dark:text-[#93c5fd]" /> Database
            </span>
            <p className="font-bold text-neutral-800 dark:text-[#f5f0e8]">PostgreSQL (Supabase)</p>
          </div>

          <div className="p-3.5 bg-neutral-50 dark:bg-[#1c1a16] rounded-xl border border-neutral-100 dark:border-[#fff8dc]/[0.06] space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 dark:text-[#8a8278] uppercase tracking-wider flex items-center gap-1">
              <Cpu className="size-3 text-violet-500 dark:text-[#c9a84c]" /> AI Provider
            </span>
            <p className="font-bold text-neutral-800 dark:text-[#f5f0e8]">Groq (LLaMA 3.1)</p>
          </div>

          <div className="p-3.5 bg-neutral-50 dark:bg-[#1c1a16] rounded-xl border border-neutral-100 dark:border-[#fff8dc]/[0.06] space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 dark:text-[#8a8278] uppercase tracking-wider flex items-center gap-1">
              <CreditCard className="size-3 text-emerald-500 dark:text-[#86efac]" /> Payment Gateway
            </span>
            <p className="font-bold text-neutral-800 dark:text-[#f5f0e8]">Chapa (Sandbox Mode)</p>
          </div>

          <div className="p-3.5 bg-neutral-50 dark:bg-[#1c1a16] rounded-xl border border-neutral-100 dark:border-[#fff8dc]/[0.06] space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 dark:text-[#8a8278] uppercase tracking-wider flex items-center gap-1">
              <Globe className="size-3 text-teal-500 dark:text-[#c9a84c]" /> Deployment
            </span>
            <p className="font-bold text-neutral-800 dark:text-[#f5f0e8]">Vercel Edge Platform</p>
          </div>

          <div className="p-3.5 bg-neutral-50 dark:bg-[#1c1a16] rounded-xl border border-neutral-100 dark:border-[#fff8dc]/[0.06] space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 dark:text-[#8a8278] uppercase tracking-wider flex items-center gap-1">
              <Activity className="size-3 text-teal-500 dark:text-[#c9a84c]" /> Last DB Sync
            </span>
            <p className="font-mono font-bold text-neutral-800 dark:text-[#f5f0e8] text-[11px]">
              {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
