import prisma from "@/lib/prisma";
import { PLATFORM_FEE_PERCENT, calculatePlatformFee, calculateNetAmount } from "@/lib/platform";
import { DollarSign, TrendingUp, CreditCard, Building2, FileText } from "lucide-react";

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
  // Execute all database queries concurrently in a single parallel batch
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let rawPayments: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let confirmedBookingsWithoutPayment: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let withdrawals: any[] = [];

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
    ]);

    rawPayments = results[0] || [];
    confirmedBookingsWithoutPayment = results[1] || [];
    withdrawals = results[2] || [];
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

  // Calculate totals safely
  const totalVolume = payments.reduce((sum, p) => sum + safeNum(p.amount), 0);
  const totalBookingCommissions = calculatePlatformFee(totalVolume);

  const totalWithdrawalFees = withdrawals.reduce((sum, w) => sum + safeNum(w.platformFee), 0);
  const totalPlatformRevenue = Math.round((totalBookingCommissions + totalWithdrawalFees) * 100) / 100;

  // Revenue-generating hosts
  const activeHostIds = new Set(
    payments.map((p) => p.booking?.property?.host?.id).filter(Boolean)
  );
  const activeHostsCount = activeHostIds.size;

  // Monthly breakdown for last 6 months
  const monthlyData: { [key: string]: number } = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    monthlyData[key] = 0;
  }

  // Populate monthly commission totals safely
  payments.forEach((p) => {
    if (!p || !p.createdAt) return;
    try {
      const d = new Date(p.createdAt);
      if (isNaN(d.getTime())) return;
      const monthIdx = d.getMonth();
      const year = d.getFullYear();
      if (monthIdx >= 0 && monthIdx < 12) {
        const key = `${monthNames[monthIdx]} ${year}`;
        if (key in monthlyData) {
          monthlyData[key] += calculatePlatformFee(safeNum(p.amount));
        }
      }
    } catch {
      // ignore date parse errors
    }
  });

  const chartEntries = Object.entries(monthlyData);
  const maxMonthlyRevenue = Math.max(...Object.values(monthlyData).map(safeNum), 1);

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-[#f5f0e8] tracking-tight">
          Revenue Overview
        </h1>
        <p className="text-sm text-neutral-500 dark:text-[#8a8278] mt-0.5">
          Platform earnings, commission history, and host withdrawal fees.
        </p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Platform Revenue */}
        <div className="bg-white dark:bg-[#141310] rounded-2xl border border-neutral-200 dark:border-[#fff8dc]/[0.06] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#b8943d] dark:text-[#c9a84c] uppercase tracking-wider">
              Total Platform Revenue
            </span>
            <div className="p-2 rounded-xl bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c]">
              <DollarSign className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#b8943d] dark:text-[#c9a84c] mt-3">
            {totalPlatformRevenue.toLocaleString()} ETB
          </p>
          <p className="text-[10px] text-neutral-500 dark:text-[#8a8278] mt-1 font-medium">
            Booking Commissions + Withdrawal Fees
          </p>
        </div>

        {/* Card 2: Total Booking Volume */}
        <div className="bg-white dark:bg-[#141310] rounded-2xl border border-neutral-200 dark:border-[#fff8dc]/[0.06] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-[#8a8278] uppercase tracking-wider">
              Total Booking Volume
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-[#60a5fa]/10 text-blue-600 dark:text-[#93c5fd]">
              <CreditCard className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-neutral-900 dark:text-[#f5f0e8] mt-3">
            {totalVolume.toLocaleString()} ETB
          </p>
          <p className="text-[10px] text-neutral-500 dark:text-[#8a8278] mt-1 font-medium">
            Gross transaction volume processed
          </p>
        </div>

        {/* Card 3: Withdrawal Fees */}
        <div className="bg-white dark:bg-[#141310] rounded-2xl border border-neutral-200 dark:border-[#fff8dc]/[0.06] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-[#fcd34d] uppercase tracking-wider">
              Withdrawal Fees Collected
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-[#f59e0b]/10 text-amber-600 dark:text-[#fcd34d]">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-700 dark:text-[#fcd34d] mt-3">
            {totalWithdrawalFees.toLocaleString()} ETB
          </p>
          <p className="text-[10px] text-neutral-500 dark:text-[#8a8278] mt-1 font-medium">
            Fees collected from host cash-outs
          </p>
        </div>

        {/* Card 4: Active Hosts */}
        <div className="bg-white dark:bg-[#141310] rounded-2xl border border-neutral-200 dark:border-[#fff8dc]/[0.06] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#b8943d] dark:text-[#c9a84c] uppercase tracking-wider">
              Revenue-Generating Hosts
            </span>
            <div className="p-2 rounded-xl bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c]">
              <Building2 className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#b8943d] dark:text-[#c9a84c] mt-3">
            {activeHostsCount}
          </p>
          <p className="text-[10px] text-neutral-500 dark:text-[#8a8278] mt-1 font-medium">
            Hosts with active earnings
          </p>
        </div>
      </div>

      {/* Revenue Breakdown Chart */}
      <div className="bg-white dark:bg-[#141310] rounded-2xl border border-neutral-200 dark:border-[#fff8dc]/[0.06] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-neutral-900 dark:text-[#f5f0e8] text-base">
              Monthly Commissions (Last 6 Months)
            </h2>
            <p className="text-xs text-neutral-500 dark:text-[#8a8278]">
              Breakdown of {PLATFORM_FEE_PERCENT}% booking commissions over time
            </p>
          </div>
          <span className="text-xs font-bold text-[#b8943d] dark:text-[#c9a84c] bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 border border-[#b8943d]/20 dark:border-[#c9a84c]/20 px-3 py-1 rounded-full">
            {PLATFORM_FEE_PERCENT}% Service Fee
          </span>
        </div>

        <div className="h-48 pt-6 flex items-end justify-between gap-3 border-b border-neutral-200 dark:border-[#fff8dc]/[0.06] px-4">
          {chartEntries.map(([month, amount]) => {
            const rawHeight = (safeNum(amount) / (maxMonthlyRevenue || 1)) * 100;
            const heightPercent = Math.max(8, Math.min(100, Math.round(isNaN(rawHeight) ? 8 : rawHeight)));

            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <span className="text-[10px] font-extrabold text-neutral-900 dark:text-[#f5f0e8] opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-100 dark:bg-[#1c1a16] px-2 py-0.5 rounded-md border border-neutral-200 dark:border-[#fff8dc]/[0.06]">
                  {safeNum(amount).toLocaleString()} ETB
                </span>
                <div
                  className="w-full max-w-[48px] bg-gradient-to-t from-[#a07830] to-[#c9a84c] rounded-t-lg transition-all group-hover:brightness-110"
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-[10px] font-semibold text-neutral-500 dark:text-[#8a8278] mt-1">
                  {month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Commission Earnings Table */}
      <div className="bg-white dark:bg-[#141310] border border-neutral-200 dark:border-[#fff8dc]/[0.06] rounded-2xl shadow-xs overflow-hidden space-y-4">
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-[#fff8dc]/[0.05]">
          <h2 className="font-bold text-neutral-900 dark:text-[#f5f0e8] text-base">Booking Commission History</h2>
          <p className="text-xs text-neutral-500 dark:text-[#8a8278]">All successful booking payments and calculated platform commissions.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-100 dark:bg-[#1c1a16] text-neutral-600 dark:text-[#524d47] uppercase font-bold text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Booking ID</th>
                <th className="px-5 py-3.5">Renter</th>
                <th className="px-5 py-3.5">Property</th>
                <th className="px-5 py-3.5">Host</th>
                <th className="px-5 py-3.5">Booking Amount</th>
                <th className="px-5 py-3.5">Platform Commission ({PLATFORM_FEE_PERCENT}%)</th>
                <th className="px-5 py-3.5">Host Net Earnings</th>
                <th className="px-5 py-3.5">Chapa Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-[#fff8dc]/[0.04]">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-neutral-500 dark:text-[#8a8278] text-xs">
                    No successful booking payments recorded yet.
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
                  const key = p.id || `pmt-${idx}`;

                  return (
                    <tr key={key} className="hover:bg-neutral-50 dark:hover:bg-[#fff8dc]/[0.02] transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap text-neutral-500 dark:text-[#8a8278] font-medium">
                        {formatDate(p.createdAt)}
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-neutral-900 dark:text-[#f5f0e8]">
                        {bookingId}
                      </td>
                      <td className="px-5 py-4 font-semibold text-neutral-900 dark:text-[#f5f0e8]">
                        {renterName}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-neutral-900 dark:text-[#f5f0e8] line-clamp-1">{propertyTitle}</p>
                        {propertyCity && <p className="text-[10px] text-neutral-500 dark:text-[#8a8278]">{propertyCity}</p>}
                      </td>
                      <td className="px-5 py-4 text-neutral-600 dark:text-[#8a8278]">
                        {hostName}
                      </td>
                      <td className="px-5 py-4 font-bold text-neutral-900 dark:text-[#f5f0e8] whitespace-nowrap">
                        {gross.toLocaleString()} ETB
                      </td>
                      <td className="px-5 py-4 font-extrabold text-[#b8943d] dark:text-[#c9a84c] whitespace-nowrap bg-[#b8943d]/5 dark:bg-[#c9a84c]/10">
                        +{fee.toLocaleString()} ETB
                      </td>
                      <td className="px-5 py-4 font-semibold text-neutral-600 dark:text-[#8a8278] whitespace-nowrap">
                        {net.toLocaleString()} ETB
                      </td>
                      <td className="px-5 py-4 font-mono text-[10px] text-neutral-500 dark:text-[#8a8278] whitespace-nowrap">
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

      {/* Host Withdrawal Fees Table */}
      <div className="bg-white dark:bg-[#141310] border border-neutral-200 dark:border-[#fff8dc]/[0.06] rounded-2xl shadow-xs overflow-hidden space-y-4">
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-[#fff8dc]/[0.05]">
          <h2 className="font-bold text-neutral-900 dark:text-[#f5f0e8] text-base">Withdrawal Fee History</h2>
          <p className="text-xs text-neutral-500 dark:text-[#8a8278]">Fees collected when hosts withdraw earnings to their bank/telebirr accounts.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-100 dark:bg-[#1c1a16] text-neutral-600 dark:text-[#524d47] uppercase font-bold text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Host Name</th>
                <th className="px-5 py-3.5">Requested Amount</th>
                <th className="px-5 py-3.5">Platform Fee ({PLATFORM_FEE_PERCENT}%)</th>
                <th className="px-5 py-3.5">Net Transferred</th>
                <th className="px-5 py-3.5">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-[#fff8dc]/[0.04]">
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500 dark:text-[#8a8278] text-xs">
                    No host withdrawal transactions recorded yet.
                  </td>
                </tr>
              ) : (
                withdrawals.map((w, idx) => {
                  const hostDisplayName = w.host?.name || w.host?.email || "Host";
                  const key = w.id || `wd-${idx}`;
                  const amount = safeNum(w.amount);
                  const fee = safeNum(w.platformFee);
                  const net = safeNum(w.netAmount);

                  return (
                    <tr key={key} className="hover:bg-neutral-50 dark:hover:bg-[#fff8dc]/[0.02] transition-colors">
                      <td className="px-5 py-4 text-neutral-500 dark:text-[#8a8278] font-medium whitespace-nowrap">
                        {formatDate(w.createdAt)}
                      </td>
                      <td className="px-5 py-4 font-semibold text-neutral-900 dark:text-[#f5f0e8]">
                        {hostDisplayName}
                      </td>
                      <td className="px-5 py-4 font-bold text-neutral-900 dark:text-[#f5f0e8] whitespace-nowrap">
                        {amount.toLocaleString()} ETB
                      </td>
                      <td className="px-5 py-4 font-extrabold text-[#b8943d] dark:text-[#c9a84c] whitespace-nowrap bg-[#b8943d]/5 dark:bg-[#c9a84c]/10">
                        +{fee.toLocaleString()} ETB
                      </td>
                      <td className="px-5 py-4 font-semibold text-neutral-600 dark:text-[#8a8278] whitespace-nowrap">
                        {net.toLocaleString()} ETB
                      </td>
                      <td className="px-5 py-4 font-mono text-[10px] text-neutral-500 dark:text-[#8a8278] whitespace-nowrap">
                        {w.chapaReference || formatShortId(w.id, "BOKRA-WD-")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-[#1c1a16] to-[#141310] border border-[#fff8dc]/[0.08] text-[#f5f0e8] rounded-2xl p-6 shadow-md max-w-xl ml-auto space-y-4">
        <h3 className="font-extrabold text-base border-b border-[#fff8dc]/[0.06] pb-3 flex items-center gap-2">
          <FileText className="size-4 text-[#c9a84c]" />
          <span>Platform Revenue Summary</span>
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-[#8a8278]">
            <span>Booking Commissions ({PLATFORM_FEE_PERCENT}%):</span>
            <span className="font-mono font-bold text-[#f5f0e8]">{totalBookingCommissions.toLocaleString()} ETB</span>
          </div>
          <div className="flex justify-between text-[#8a8278]">
            <span>Withdrawal Fees Collected:</span>
            <span className="font-mono font-bold text-[#f5f0e8]">{totalWithdrawalFees.toLocaleString()} ETB</span>
          </div>
          <div className="pt-3 border-t border-[#fff8dc]/[0.06] flex justify-between items-center text-sm font-extrabold text-[#c9a84c]">
            <span>Total Platform Revenue:</span>
            <span className="text-xl font-mono text-[#c9a84c]">{totalPlatformRevenue.toLocaleString()} ETB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
