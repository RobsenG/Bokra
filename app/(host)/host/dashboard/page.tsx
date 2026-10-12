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
  TrendingUp,
  Minus,
  FileText,
  BarChart2,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default async function HostDashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const hostId = session.user.id;
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalProperties,
    confirmedBookings,
    pendingBookings,
    revenueResult,
    monthlyRevenueResult,
    recentBookings,
    rejectedProperties,
    hostProperties,
    hostUser,
  ] = await Promise.all([
    prisma.property.count({ where: { hostId } }),
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
        booking: { property: { hostId } },
      },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: "SUCCESS",
        booking: { property: { hostId } },
        createdAt: { gte: firstDayOfMonth },
      },
      _sum: { amount: true },
    }),
    prisma.booking.findMany({
      where: { property: { hostId } },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        renter: { select: { name: true, email: true, avatar: true } },
        property: { select: { id: true, title: true, images: true, city: true } },
        payment: { select: { status: true } },
      },
    }),
    prisma.property.findMany({
      where: { hostId, status: "REJECTED" },
      select: {
        id: true,
        title: true,
        city: true,
        rejectionReason: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.property.findMany({
      where: { hostId },
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        city: true,
        pricePerNight: true,
        images: true,
        status: true,
        isVerified: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: hostId },
      select: { isVerified: true, selfieUrl: true },
    }),
  ]);

  const totalRevenue = Number(revenueResult._sum.amount || 0);
  const monthRevenue = Number(monthlyRevenueResult._sum.amount || 0);
  const pendingValue = pendingBookings * 1500; // estimated pending value

  const hostName = session.user.name?.split(" ")[0] || "Host";
  const formattedDate = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* REJECTED PROPERTIES ALERT AT VERY TOP */}
      {rejectedProperties.length > 0 && (
        <div className="bg-gradient-to-r from-red-500/10 to-transparent dark:from-red-500/15 border-l-4 border-l-red-500 rounded-r-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-red-700 dark:text-red-300 font-extrabold text-sm">
            <AlertTriangle className="size-5 text-red-600 dark:text-red-400 shrink-0" />
            <span>
              Action Required — {rejectedProperties.length}{" "}
              {rejectedProperties.length === 1 ? "property listing rejected" : "property listings rejected"}
            </span>
          </div>

          <div className="space-y-3">
            {rejectedProperties.map((prop) => (
              <div
                key={prop.id}
                className="bg-white dark:bg-[#141310] rounded-2xl p-4 border border-black/[0.08] dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <h4 className="font-extrabold text-[#1a1208] dark:text-[#f5f0e8] text-sm">
                    {prop.title} — <span className="font-normal text-[#6b5e4e] dark:text-[#8a8278]">{prop.city}</span>
                  </h4>
                  {prop.rejectionReason && (
                    <p className="text-xs text-red-600 dark:text-red-400 italic font-medium">
                      Reason: &quot;{prop.rejectionReason}&quot;
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/host/properties/${prop.id}/edit`}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors"
                  >
                    Edit &amp; Resubmit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TOP BAR (Inside main content) */}
      <div className="p-6 bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1208] dark:text-[#f5f0e8] tracking-tight">
            Good morning, {hostName} 👋
          </h1>
          <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278] mt-0.5">
            Here&apos;s what&apos;s happening with your properties today
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-[#9b8e7e] dark:text-[#8a8278] bg-[#faf9f7] dark:bg-[#1c1a16] px-3.5 py-2 rounded-xl border border-black/[0.05] dark:border-[#fff8dc]/[0.05]">
            {formattedDate}
          </span>
          <Link
            href="/host/properties/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#b8943d] dark:bg-[#c9a84c] hover:bg-[#d4b458] text-white dark:text-[#0c0b09] shadow-xs transition-all cursor-pointer"
          >
            <Plus className="size-4" />
            <span>List New Property</span>
          </Link>
        </div>
      </div>

      {/* STATS ROW (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Properties */}
        <Link
          href="/host/properties"
          className="bg-white dark:bg-[#141310] rounded-2xl border border-black/[0.06] dark:border-white/[0.05] p-6 relative overflow-hidden group hover:border-[#b8943d]/40 transition-all shadow-xs"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#b8943d]" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9b8e7e] dark:text-[#8a8278]">
              Properties Listed
            </span>
            <Building2 className="size-5 text-[#9b8e7e] group-hover:text-[#b8943d] transition-colors" />
          </div>
          <div className="my-3">
            <span className="text-4xl font-black text-[#1a1208] dark:text-[#f5f0e8]">
              {totalProperties}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <TrendingUp className="size-3.5" />
            <span>Active hosting inventory</span>
          </div>
        </Link>

        {/* Card 2: Bookings */}
        <Link
          href="/host/bookings"
          className="bg-white dark:bg-[#141310] rounded-2xl border border-black/[0.06] dark:border-white/[0.05] p-6 relative overflow-hidden group hover:border-emerald-500/40 transition-all shadow-xs"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9b8e7e] dark:text-[#8a8278]">
              Confirmed Bookings
            </span>
            <CalendarDays className="size-5 text-[#9b8e7e] group-hover:text-emerald-500 transition-colors" />
          </div>
          <div className="my-3">
            <span className="text-4xl font-black text-[#1a1208] dark:text-[#f5f0e8]">
              {confirmedBookings}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <TrendingUp className="size-3.5" />
            <span>vs last month</span>
          </div>
        </Link>

        {/* Card 3: Total Earnings */}
        <Link
          href="/host/revenue"
          className="bg-white dark:bg-[#141310] rounded-2xl border border-black/[0.06] dark:border-white/[0.05] p-6 relative overflow-hidden group hover:border-[#b8943d]/40 transition-all shadow-xs"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#b8943d]" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9b8e7e] dark:text-[#8a8278]">
              Total Revenue
            </span>
            <Wallet className="size-5 text-[#9b8e7e] group-hover:text-[#b8943d] transition-colors" />
          </div>
          <div className="my-3">
            <span className="text-3xl font-black text-[#b8943d] dark:text-[#c9a84c]">
              {totalRevenue.toLocaleString()} ETB
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#b8943d] dark:text-[#c9a84c] font-semibold">
            <TrendingUp className="size-3.5" />
            <span>Payout balance clean</span>
          </div>
        </Link>

        {/* Card 4: Pending Bookings */}
        <Link
          href="/host/bookings?filter=pending"
          className="bg-white dark:bg-[#141310] rounded-2xl border border-black/[0.06] dark:border-white/[0.05] p-6 relative overflow-hidden group hover:border-amber-500/40 transition-all shadow-xs"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9b8e7e] dark:text-[#8a8278]">
              Pending Requests
            </span>
            <Clock className="size-5 text-[#9b8e7e] group-hover:text-amber-500 transition-colors" />
          </div>
          <div className="my-3">
            <span className="text-4xl font-black text-[#1a1208] dark:text-[#f5f0e8]">
              {pendingBookings}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold">
            <Minus className="size-3.5" />
            <span>Requires response</span>
          </div>
        </Link>
      </div>

      {/* MAIN CONTENT — TWO COLUMN LAYOUT (65% / 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN (65%) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Card: Recent Bookings */}
          <div className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-black/[0.06] dark:border-[#fff8dc]/0.05 flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-[#1a1208] dark:text-[#f5f0e8] text-base">
                  Recent Bookings
                </h2>
                <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278]">
                  Incoming guest reservations &amp; payment status
                </p>
              </div>
              <Link
                href="/host/bookings"
                className="text-xs font-bold text-[#b8943d] dark:text-[#c9a84c] hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {recentBookings.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#6b5e4e] dark:text-[#8a8278]">
                <CalendarDays className="size-8 mx-auto text-[#9b8e7e] mb-2 opacity-50" />
                <p className="font-bold text-sm text-[#1a1208] dark:text-[#f5f0e8]">No bookings yet</p>
                <p className="mt-0.5">Reservations will appear here once guests book your places.</p>
              </div>
            ) : (
              <div className="divide-y divide-black/[0.05] dark:divide-white/[0.04]">
                {recentBookings.map((b) => {
                  const propImages = (b.property.images as string[]) || [];
                  const thumb = propImages[0] || null;
                  const renterName = b.renter.name || b.renter.email || "Guest";

                  return (
                    <div
                      key={b.id}
                      className="flex items-center gap-4 p-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Left: Thumbnail */}
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#faf9f7] dark:bg-[#1c1a16] border border-black/[0.06] dark:border-white/[0.06] shrink-0">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={b.property.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#b8943d]">
                            STAY
                          </div>
                        )}
                      </div>

                      {/* Center: Details Stack */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p className="font-bold text-sm text-[#1a1208] dark:text-[#f5f0e8] truncate">
                          {b.property.title}
                        </p>
                        <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278] truncate">
                          Renter: <span className="font-semibold text-[#1a1208] dark:text-[#d4cfc7]">{renterName}</span>
                        </p>
                        <p className="text-[11px] text-[#9b8e7e] font-mono">
                          {new Date(b.checkIn).toLocaleDateString(undefined, { month: "short", day: "numeric" })} - {new Date(b.checkOut).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </p>
                      </div>

                      {/* Right: Amount & Status Badge */}
                      <div className="text-right shrink-0 space-y-1">
                        <p className="font-black text-sm text-[#b8943d] dark:text-[#c9a84c]">
                          {Number(b.totalPrice).toLocaleString()} ETB
                        </p>
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            b.status === "CONFIRMED" || b.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200"
                              : b.status === "PENDING"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200"
                              : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200"
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card: Properties Overview */}
          <div className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-[#fff8dc]/0.05 pb-4">
              <h2 className="font-extrabold text-[#1a1208] dark:text-[#f5f0e8] text-base">
                Your Properties Overview
              </h2>
              <Link
                href="/host/properties"
                className="text-xs font-bold text-[#b8943d] dark:text-[#c9a84c] hover:underline"
              >
                Manage all
              </Link>
            </div>

            {hostProperties.length === 0 ? (
              <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278] italic text-center py-6">
                No properties listed yet.
              </p>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                {hostProperties.map((p) => {
                  const imgs = (p.images as string[]) || [];
                  const thumb = imgs[0] || null;

                  return (
                    <div
                      key={p.id}
                      className="w-56 shrink-0 bg-[#faf9f7] dark:bg-[#1c1a16] rounded-2xl border border-black/[0.05] dark:border-[#fff8dc]/[0.05] p-3 space-y-2.5"
                    >
                      <div className="aspect-video rounded-xl overflow-hidden bg-black/10 relative">
                        {thumb ? (
                          <img src={thumb} alt={p.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-[#9b8e7e]">
                            No Image
                          </div>
                        )}
                        <span
                          className={`absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            p.isVerified
                              ? "bg-emerald-500 text-white"
                              : "bg-amber-500 text-white"
                          }`}
                        >
                          {p.isVerified ? "Verified" : p.status}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#1a1208] dark:text-[#f5f0e8] truncate">
                          {p.title}
                        </h4>
                        <p className="text-[11px] text-[#6b5e4e] dark:text-[#8a8278]">{p.city}</p>
                        <p className="text-xs font-black text-[#b8943d] dark:text-[#c9a84c] mt-1">
                          {Number(p.pricePerNight).toLocaleString()} ETB / night
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (35%) */}
        <div className="space-y-8">
          {/* Card: Quick Actions */}
          <div className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] shadow-xs p-6 space-y-4">
            <h2 className="font-extrabold text-[#1a1208] dark:text-[#f5f0e8] text-base border-b border-black/[0.06] dark:border-[#fff8dc]/0.05 pb-3">
              Quick Actions
            </h2>

            <div className="space-y-2.5">
              <Link
                href="/host/properties/new"
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#b8943d] dark:bg-[#c9a84c] hover:bg-[#d4b458] text-white dark:text-[#0c0b09] font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="size-4" />
                  <span>Add New Property</span>
                </div>
                <ArrowRight className="size-4" />
              </Link>

              <Link
                href="/host/verification"
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#faf9f7] dark:bg-[#1c1a16] hover:bg-black/5 dark:hover:bg-white/5 border border-black/[0.06] dark:border-white/[0.06] text-[#1a1208] dark:text-[#f5f0e8] font-bold text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="size-4 text-[#b8943d] dark:text-[#c9a84c]" />
                  <span>Upload Documents</span>
                </div>
                <ArrowRight className="size-4 text-[#9b8e7e]" />
              </Link>

              <Link
                href="/host/revenue"
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#faf9f7] dark:bg-[#1c1a16] hover:bg-black/5 dark:hover:bg-white/5 border border-black/[0.06] dark:border-white/[0.06] text-[#1a1208] dark:text-[#f5f0e8] font-bold text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <BarChart2 className="size-4 text-[#b8943d] dark:text-[#c9a84c]" />
                  <span>View Revenue Analytics</span>
                </div>
                <ArrowRight className="size-4 text-[#9b8e7e]" />
              </Link>

              <Link
                href="/host/revenue"
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#faf9f7] dark:bg-[#1c1a16] hover:bg-black/5 dark:hover:bg-white/5 border border-black/[0.06] dark:border-white/[0.06] text-[#1a1208] dark:text-[#f5f0e8] font-bold text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Wallet className="size-4 text-[#b8943d] dark:text-[#c9a84c]" />
                  <span>Withdraw Funds</span>
                </div>
                <ArrowUpRight className="size-4 text-[#9b8e7e]" />
              </Link>
            </div>
          </div>

          {/* Card: Earnings Summary */}
          <div className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] shadow-xs p-6 space-y-4">
            <h2 className="font-extrabold text-[#1a1208] dark:text-[#f5f0e8] text-base border-b border-black/[0.06] dark:border-[#fff8dc]/0.05 pb-3">
              Earnings Summary
            </h2>

            <div className="space-y-3">
              <div>
                <span className="text-xs text-[#9b8e7e] dark:text-[#8a8278] block font-medium">
                  Available Payout Balance
                </span>
                <span className="text-3xl font-black text-[#b8943d] dark:text-[#c9a84c]">
                  {totalRevenue.toLocaleString()} ETB
                </span>
              </div>

              <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.05] space-y-2 text-xs">
                <div className="flex justify-between text-[#6b5e4e] dark:text-[#8a8278]">
                  <span>This Month Earned:</span>
                  <span className="font-bold text-[#1a1208] dark:text-[#f5f0e8]">
                    {monthRevenue.toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex justify-between text-[#6b5e4e] dark:text-[#8a8278]">
                  <span>Pending Value:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {pendingValue.toLocaleString()} ETB
                  </span>
                </div>
              </div>

              <Link
                href="/host/revenue"
                className="w-full inline-block text-center mt-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#b8943d] dark:bg-[#c9a84c] text-white dark:text-[#0c0b09] shadow-xs"
              >
                Withdraw Earnings
              </Link>
            </div>
          </div>

          {/* Card: Verification Status (Mini) */}
          <div className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] shadow-xs p-6 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-[#b8943d] dark:text-[#c9a84c]" />
              <h3 className="font-bold text-sm text-[#1a1208] dark:text-[#f5f0e8]">
                Verification Status
              </h3>
            </div>
            <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278]">
              {hostUser?.isVerified
                ? "Your host account is fully verified."
                : "Complete verification to gain host trust badge."}
            </p>
            <Link
              href="/host/verification"
              className="text-xs font-bold text-[#b8943d] dark:text-[#c9a84c] hover:underline block pt-1"
            >
              {hostUser?.isVerified ? "View Verification Badge →" : "Complete Verification Now →"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
