import prisma from "@/lib/prisma";
import { PLATFORM_FEE_PERCENT, calculatePlatformFee, calculateNetAmount } from "@/lib/platform";
import { DollarSign, TrendingUp, CreditCard, Building2, FileText, Calendar, Wallet } from "lucide-react";

function formatDate(d: any): string {
  if (!d) return "—";
  try {
    const date = new Date(d);
    return isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
  } catch {
    return "—";
  }
}

function formatShortId(id: any, prefix = "#"): string {
  if (!id || typeof id !== "string") return `${prefix}—`;
  return `${prefix}${id.substring(0, 8)}`;
}

function safeNum(val: any): number {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

export default async function AdminRevenuePage() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const dayOfWeek = now.getDay();
  const diffToMonday = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const startOfWeek = new Date(now.setDate(diffToMonday));
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let rawPayments: any[] = [];
  let confirmedBookingsWithoutPayment: any[] = [];
  let withdrawals: any[] = [];
  let todayRevenueAgg: any = { _sum: { amount: null } };
  let weekRevenueAgg: any = { _sum: { amount: null } };
  let monthRevenueAgg: any = { _sum: { amount: null } };

  try {
    const results = await Promise.all([
      // Query 1: Successful payments
      prisma.payment.findMany({
        where: { status: "SUCCESS" },
        include: {
          booking: {
            include: {
              renter: { select: { name: true, email: true } },
              property: {
                select: {
                  title: true,
                  city: true,
                  host: { select: { id: true, name: true, email: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      // Query 2: Confirmed/completed bookings without payment record
      prisma.booking.findMany({
        where: {
          status: { in: ["CONFIRMED", "COMPLETED"] },
          payment: null,
        },
        include: {
          renter: { select: { name: true, email: true } },
          property: {
            select: {
              title: true,
              city: true,
              host: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      // Query 3: Completed host withdrawal requests
      prisma.withdrawalRequest.findMany({
        where: { status: "COMPLETED" },
        include: {
          host: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      // Query 4: Today revenue
      prisma.payment.aggregate({
        where: { status: "SUCCESS", createdAt: { gte: startOfToday } },
        _sum: { amount: true },
      }),
      // Query 5: This week revenue
      prisma.payment.aggregate({
        where: { status: "SUCCESS", createdAt: { gte: startOfWeek } },
        _sum: { amount: true },
      }),
      // Query 6: This month revenue
      prisma.payment.aggregate({
        where: { status: "SUCCESS", createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
    ]);

    rawPayments = results[0] || [];
    confirmedBookingsWithoutPayment = results[1] || [];
    withdrawals = results[2] || [];
    todayRevenueAgg = results[3];
    weekRevenueAgg = results[4];
    monthRevenueAgg = results[5];
  } catch (err) {
    console.error("[Admin Revenue DB Error]", err);
  }

  // Map un-linked confirmed bookings as synthetic payment entries
  const fallbackPayments = confirmedBookingsWithoutPayment.map((b) => ({
    id: `fallback-${b.id}`,
    amount: b.totalPrice,
    currency: "ETB",
    status: "SUCCESS",
    chapaReference: "CONFIRMED-BOOKING",
    createdAt: b.createdAt,
    booking: b,
  }));

  const payments = [...rawPayments, ...fallbackPayments].sort((a, b) => {
    const timeA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
    return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
  });

  // Calculate totals
  const totalVolume = payments.reduce((sum, p) => sum + safeNum(p.amount), 0);
  const totalBookingCommissions = calculatePlatformFee(totalVolume);
  const totalWithdrawalFees = withdrawals.reduce((sum, w) => sum + safeNum(w.platformFee), 0);
  const totalPlatformRevenue = Math.round((totalBookingCommissions + totalWithdrawalFees) * 100) / 100;

  const todayVol = safeNum(todayRevenueAgg._sum?.amount);
  const todayCommission = calculatePlatformFee(todayVol);

  const weekVol = safeNum(weekRevenueAgg._sum?.amount);
  const weekCommission = calculatePlatformFee(weekVol);

  const monthVol = safeNum(monthRevenueAgg._sum?.amount);
  const monthCommission = calculatePlatformFee(monthVol);

  const activeHostIds = new Set(
    payments.map((p) => p.booking?.property?.host?.id).filter(Boolean)
  );
  const activeHostsCount = activeHostIds.size;

  // Last 7 days revenue trend calculation
  const last7DaysData: { day: string; amount: number; isToday: boolean }[] = [];
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);

    const nextD = new Date(d);
    nextD.setDate(nextD.getDate() + 1);

    const dayName = dayLabels[d.getDay()];
    const isToday = i === 0;

    const dayPayments = payments.filter((p) => {
      if (!p.createdAt) return false;
      const pTime = new Date(p.createdAt).getTime();
      return pTime >= d.getTime() && pTime < nextD.getTime();
    });

    const dayVol = dayPayments.reduce((sum, p) => sum + safeNum(p.amount), 0);
    const dayFee = calculatePlatformFee(dayVol);

    last7DaysData.push({
      day: dayName,
      amount: dayFee,
      isToday,
    });
  }

  const max7DaysAmount = Math.max(...last7DaysData.map((d) => d.amount), 1);

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#1a1208] dark:text-[#f5f0e8] tracking-tight">
          Platform Revenue Analytics
        </h1>
        <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278] mt-1">
          Detailed platform commission history, transaction volume, and cash-out fee tracking.
        </p>
      </div>

      {/* TOP SECTION — REVENUE SUMMARY BANNER */}
      <div className="bg-gradient-to-br from-[#faf7f0] to-[#f0ebe0] dark:from-[#1c1a14] dark:to-[#141310] border border-[#b8943d]/20 dark:border-[#c9a84c]/20 rounded-3xl p-8 shadow-sm flex flex-col lg:flex-row items-stretch justify-between gap-8">
        {/* Left Side */}
        <div className="space-y-3 flex-1">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#b8943d] dark:text-[#c9a84c]">
            PLATFORM REVENUE
          </span>
          <h2 className="text-5xl font-black text-[#b8943d] dark:text-[#c9a84c]">
            {totalPlatformRevenue.toLocaleString()} ETB
          </h2>
          <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278] font-medium">
            All time earnings (3% Booking Commissions + Host Withdrawal Fees)
          </p>
        </div>

        {/* Right Side breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:w-[45%]">
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#141310]/70 border border-black/[0.06] dark:border-[#fff8dc]/[0.06] space-y-1">
            <span className="text-[11px] font-bold text-[#6b5e4e] dark:text-[#8a8278] uppercase">
              Today
            </span>
            <p className="text-lg font-black text-[#1a1208] dark:text-[#f5f0e8]">
              {todayCommission.toLocaleString()} ETB
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#141310]/70 border border-black/[0.06] dark:border-[#fff8dc]/[0.06] space-y-1">
            <span className="text-[11px] font-bold text-[#6b5e4e] dark:text-[#8a8278] uppercase">
              This Week
            </span>
            <p className="text-lg font-black text-[#1a1208] dark:text-[#f5f0e8]">
              {weekCommission.toLocaleString()} ETB
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#141310]/70 border border-black/[0.06] dark:border-[#fff8dc]/[0.06] space-y-1">
            <span className="text-[11px] font-bold text-[#6b5e4e] dark:text-[#8a8278] uppercase">
              This Month
            </span>
            <p className="text-lg font-black text-[#b8943d] dark:text-[#c9a84c]">
              {monthCommission.toLocaleString()} ETB
            </p>
          </div>
        </div>
      </div>

      {/* STATS CARDS (PREMIUM GRADIENTS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-gradient-to-br from-white to-[#faf9f7] dark:from-[#141310] dark:to-[#0f0e0c] rounded-2xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#b8943d] dark:text-[#c9a84c] uppercase tracking-wider">
              Total Platform Revenue
            </span>
            <div className="w-12 h-12 rounded-2xl bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] flex items-center justify-center">
              <DollarSign className="size-6" />
            </div>
          </div>
          <p className="text-4xl font-black text-[#b8943d] dark:text-[#c9a84c]">
            {totalPlatformRevenue.toLocaleString()} ETB
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-gradient-to-br from-white to-[#faf9f7] dark:from-[#141310] dark:to-[#0f0e0c] rounded-2xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6b5e4e] dark:text-[#8a8278] uppercase tracking-wider">
              Total Booking Volume
            </span>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CreditCard className="size-6" />
            </div>
          </div>
          <p className="text-4xl font-black text-[#1a1208] dark:text-[#f5f0e8]">
            {totalVolume.toLocaleString()} ETB
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-gradient-to-br from-white to-[#faf9f7] dark:from-[#141310] dark:to-[#0f0e0c] rounded-2xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Withdrawal Fees
            </span>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <TrendingUp className="size-6" />
            </div>
          </div>
          <p className="text-4xl font-black text-amber-700 dark:text-amber-400">
            {totalWithdrawalFees.toLocaleString()} ETB
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-gradient-to-br from-white to-[#faf9f7] dark:from-[#141310] dark:to-[#0f0e0c] rounded-2xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#b8943d] dark:text-[#c9a84c] uppercase tracking-wider">
              Active Hosts
            </span>
            <div className="w-12 h-12 rounded-2xl bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] flex items-center justify-center">
              <Building2 className="size-6" />
            </div>
          </div>
          <p className="text-4xl font-black text-[#b8943d] dark:text-[#c9a84c]">
            {activeHostsCount}
          </p>
        </div>
      </div>

      {/* REVENUE TREND LINE (LAST 7 DAYS CSS BAR CHART) */}
      <div className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-[#1a1208] dark:text-[#f5f0e8] text-base">
              7-Day Revenue Trend (CSS Sparkline)
            </h2>
            <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278]">
              Daily commission fees earned over the past week
            </p>
          </div>
          <span className="text-xs font-bold text-[#b8943d] dark:text-[#c9a84c] bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 border border-[#b8943d]/20 px-3 py-1 rounded-full">
            Live Daily Feed
          </span>
        </div>

        <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-black/[0.06] dark:border-white/[0.06] px-4">
          {last7DaysData.map((d, idx) => {
            const heightPct = Math.max(10, Math.round((d.amount / max7DaysAmount) * 100));

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                {/* Tooltip */}
                <span className="text-[10px] font-bold text-[#b8943d] dark:text-[#c9a84c] opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-100 dark:bg-[#1c1a16] px-2 py-0.5 rounded-md border border-black/[0.08]">
                  {d.amount.toLocaleString()} ETB
                </span>
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full max-w-[42px] rounded-t-lg transition-all duration-300 ${
                    d.isToday
                      ? "bg-[#b8943d] dark:bg-[#c9a84c] ring-2 ring-[#b8943d]/40"
                      : "bg-[#b8943d]/40 dark:bg-[#c9a84c]/40 hover:bg-[#b8943d]"
                  }`}
                />
                <span className={`text-[11px] font-semibold ${d.isToday ? "text-[#b8943d] dark:text-[#c9a84c] font-bold" : "text-[#6b5e4e] dark:text-[#8a8278]"}`}>
                  {d.day} {d.isToday && "(Today)"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* PAYMENTS TABLE WITH ALTERNATING ROWS & GOLD COMMISSION HIGHLIGHT */}
      <div className="bg-white dark:bg-[#141310] border border-black/[0.08] dark:border-[#fff8dc]/[0.06] rounded-3xl shadow-xs overflow-hidden space-y-4">
        <div className="px-6 py-5 border-b border-black/[0.06] dark:border-[#fff8dc]/[0.05]">
          <h2 className="font-extrabold text-[#1a1208] dark:text-[#f5f0e8] text-base">
            Booking Commission Transactions
          </h2>
          <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278]">
            Detailed breakdown of guest payments and calculated {PLATFORM_FEE_PERCENT}% service fees.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf9f7] dark:bg-[#1c1a16] text-[#6b5e4e] dark:text-[#8a8278] uppercase font-bold text-[10px]">
              <tr>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Booking ID</th>
                <th className="px-5 py-4">Renter</th>
                <th className="px-5 py-4">Property</th>
                <th className="px-5 py-4">Host</th>
                <th className="px-5 py-4">Booking Amount</th>
                <th className="px-5 py-4 text-right">Commission ({PLATFORM_FEE_PERCENT}%)</th>
                <th className="px-5 py-4 text-right">Host Net</th>
                <th className="px-5 py-4">Chapa Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.04]">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#b8943d]/10 text-[#b8943d] flex items-center justify-center mx-auto opacity-70">
                      <CreditCard className="size-6" />
                    </div>
                    <p className="font-extrabold text-sm text-[#1a1208] dark:text-[#f5f0e8]">
                      No revenue recorded yet
                    </p>
                    <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278] max-w-sm mx-auto">
                      Revenue will appear here automatically once renters complete booking payments.
                    </p>
                    <div className="w-12 h-0.5 bg-[#b8943d] mx-auto rounded-full mt-2" />
                  </td>
                </tr>
              ) : (
                payments.map((p, idx) => {
                  const gross = safeNum(p.amount);
                  const fee = calculatePlatformFee(gross);
                  const net = calculateNetAmount(gross);
                  const bookingId = p.booking?.id ? formatShortId(p.booking.id) : formatShortId(p.id);
                  const renterName = p.booking?.renter?.name || p.booking?.renter?.email || "Renter";
                  const propertyTitle = p.booking?.property?.title || "Property Stay";
                  const propertyCity = p.booking?.property?.city || "";
                  const hostName = p.booking?.property?.host?.name || p.booking?.property?.host?.email || "Host";
                  const isOdd = idx % 2 === 1;

                  return (
                    <tr
                      key={p.id || idx}
                      className={`transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.03] ${
                        isOdd ? "bg-black/[0.01] dark:bg-white/[0.01]" : "bg-transparent"
                      }`}
                    >
                      <td className="px-5 py-4 whitespace-nowrap text-[#6b5e4e] dark:text-[#8a8278] font-medium">
                        {formatDate(p.createdAt)}
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-[#1a1208] dark:text-[#f5f0e8]">
                        {bookingId}
                      </td>
                      <td className="px-5 py-4 font-semibold text-[#1a1208] dark:text-[#f5f0e8]">
                        {renterName}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#1a1208] dark:text-[#f5f0e8] line-clamp-1">
                          {propertyTitle}
                        </p>
                        {propertyCity && (
                          <p className="text-[10px] text-[#6b5e4e] dark:text-[#8a8278]">
                            {propertyCity}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-[#6b5e4e] dark:text-[#8a8278]">
                        {hostName}
                      </td>
                      <td className="px-5 py-4 font-bold text-[#1a1208] dark:text-[#f5f0e8] whitespace-nowrap">
                        {gross.toLocaleString()} ETB
                      </td>
                      <td className="px-5 py-4 font-black text-[#b8943d] dark:text-[#c9a84c] whitespace-nowrap bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-right">
                        +{fee.toLocaleString()} ETB
                      </td>
                      <td className="px-5 py-4 font-semibold text-[#6b5e4e] dark:text-[#8a8278] whitespace-nowrap text-right">
                        {net.toLocaleString()} ETB
                      </td>
                      <td className="px-5 py-4 font-mono text-[10px] text-[#9b8e7e] whitespace-nowrap">
                        {p.chapaReference || "MOCK-REF"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
