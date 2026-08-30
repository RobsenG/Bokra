import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PLATFORM_FEE_PERCENT, calculatePlatformFee, calculateNetAmount } from "@/lib/platform";
import { DollarSign, TrendingUp, CreditCard, Building2, FileText } from "lucide-react";

export default async function AdminRevenuePage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  // All successful payments
  const payments = await prisma.payment.findMany({
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
  });

  // All completed withdrawals
  const withdrawals = await prisma.withdrawalRequest.findMany({
    where: { status: "COMPLETED" },
    include: {
      host: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate totals
  const totalVolume = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalBookingCommissions = calculatePlatformFee(totalVolume);

  const totalWithdrawalFees = withdrawals.reduce((sum, w) => sum + Number(w.platformFee), 0);
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

  // Populate monthly commission totals
  payments.forEach((p) => {
    const d = new Date(p.createdAt);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    if (key in monthlyData) {
      monthlyData[key] += calculatePlatformFee(Number(p.amount));
    }
  });

  const chartEntries = Object.entries(monthlyData);
  const maxMonthlyRevenue = Math.max(...Object.values(monthlyData), 1);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-800 dark:text-white tracking-tight">
          Revenue
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Platform earnings overview.
        </p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Platform Revenue */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7c3aed] uppercase tracking-wider">
              Total Platform Revenue
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-[#7c3aed]">
              <DollarSign className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#7c3aed] mt-3">
            {totalPlatformRevenue.toLocaleString()} ETB
          </p>
          <p className="text-[10px] text-neutral-400 mt-1 font-medium">
            Booking Commissions + Withdrawal Fees
          </p>
        </div>

        {/* Card 2: Total Booking Volume */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Total Booking Volume
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <CreditCard className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-neutral-800 dark:text-white mt-3">
            {totalVolume.toLocaleString()} ETB
          </p>
          <p className="text-[10px] text-neutral-400 mt-1 font-medium">
            Gross transaction volume processed
          </p>
        </div>

        {/* Card 3: Withdrawal Fees */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Withdrawal Fees Collected
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-700 dark:text-amber-300 mt-3">
            {totalWithdrawalFees.toLocaleString()} ETB
          </p>
          <p className="text-[10px] text-neutral-400 mt-1 font-medium">
            Fees collected from host cash-outs
          </p>
        </div>

        {/* Card 4: Active Hosts */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
              Revenue-Generating Hosts
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-[#7c3aed]">
              <Building2 className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#7c3aed] mt-3">
            {activeHostsCount}
          </p>
          <p className="text-[10px] text-neutral-400 mt-1 font-medium">
            Hosts with active earnings
          </p>
        </div>
      </div>

      {/* Revenue Breakdown Chart */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-neutral-800 dark:text-white text-base">
              Monthly Commissions (Last 6 Months)
            </h2>
            <p className="text-xs text-neutral-400">
              Breakdown of {PLATFORM_FEE_PERCENT}% booking commissions over time
            </p>
          </div>
          <span className="text-xs font-bold text-[#7c3aed] bg-purple-50 px-3 py-1 rounded-full">
            {PLATFORM_FEE_PERCENT}% Service Fee
          </span>
        </div>

        <div className="h-48 pt-6 flex items-end justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 px-4">
          {chartEntries.map(([month, amount]) => {
            const heightPercent = Math.max(8, Math.round((amount / maxMonthlyRevenue) * 100));

            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <span className="text-[10px] font-extrabold text-neutral-700 dark:text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
                  {amount.toLocaleString()} ETB
                </span>
                <div
                  className="w-full max-w-[48px] bg-gradient-to-t from-[#7c3aed] to-[#5b21b6] rounded-t-lg transition-all group-hover:brightness-110"
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 mt-1">
                  {month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Commission Earnings Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-xs overflow-hidden space-y-4">
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h2 className="font-bold text-neutral-800 dark:text-white text-base">Booking Commission History</h2>
          <p className="text-xs text-neutral-400">All successful booking payments and calculated platform commissions.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/70 dark:bg-neutral-800/50 text-neutral-400 uppercase font-bold text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Booking ID</th>
                <th className="px-5 py-3.5">Renter</th>
                <th className="px-5 py-3.5">Property</th>
                <th className="px-5 py-3.5">Host</th>
                <th className="px-5 py-3.5">Booking Amount</th>
                <th className="px-5 py-3.5">Platform Commission ({PLATFORM_FEE_PERCENT}%)</th>
                <th className="px-5 py-3.5">Host Earnings (97%)</th>
                <th className="px-5 py-3.5">Chapa Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-neutral-400 text-xs">
                    No successful booking payments recorded yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const gross = Number(p.amount);
                  const fee = calculatePlatformFee(gross);
                  const net = calculateNetAmount(gross);

                  return (
                    <tr key={p.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap text-neutral-500 font-medium">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-neutral-700 dark:text-neutral-300">
                        #{p.booking.id.substring(0, 8)}
                      </td>
                      <td className="px-5 py-4 font-semibold text-neutral-800 dark:text-white">
                        {p.booking.renter.name || p.booking.renter.email}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-neutral-800 dark:text-white line-clamp-1">{p.booking.property.title}</p>
                        <p className="text-[10px] text-neutral-400">{p.booking.property.city}</p>
                      </td>
                      <td className="px-5 py-4 text-neutral-700 dark:text-neutral-300">
                        {p.booking.property.host.name || p.booking.property.host.email}
                      </td>
                      <td className="px-5 py-4 font-bold text-neutral-800 dark:text-white whitespace-nowrap">
                        {gross.toLocaleString()} ETB
                      </td>
                      <td className="px-5 py-4 font-extrabold text-[#7c3aed] whitespace-nowrap bg-purple-50/40">
                        +{fee.toLocaleString()} ETB
                      </td>
                      <td className="px-5 py-4 font-semibold text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                        {net.toLocaleString()} ETB
                      </td>
                      <td className="px-5 py-4 font-mono text-[10px] text-neutral-400 whitespace-nowrap">
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
      <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-xs overflow-hidden space-y-4">
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h2 className="font-bold text-neutral-800 dark:text-white text-base">Withdrawal Fee History</h2>
          <p className="text-xs text-neutral-400">Fees collected when hosts withdraw earnings to their bank/telebirr accounts.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/70 dark:bg-neutral-800/50 text-neutral-400 uppercase font-bold text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Host Name</th>
                <th className="px-5 py-3.5">Requested Amount</th>
                <th className="px-5 py-3.5">Platform Fee ({PLATFORM_FEE_PERCENT}%)</th>
                <th className="px-5 py-3.5">Net Transferred</th>
                <th className="px-5 py-3.5">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400 text-xs">
                    No host withdrawal transactions recorded yet.
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="px-5 py-4 text-neutral-500 font-medium whitespace-nowrap">
                      {new Date(w.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 font-semibold text-neutral-800 dark:text-white">
                      {w.host.name || w.host.email}
                    </td>
                    <td className="px-5 py-4 font-bold text-neutral-800 dark:text-white whitespace-nowrap">
                      {Number(w.amount).toLocaleString()} ETB
                    </td>
                    <td className="px-5 py-4 font-extrabold text-[#7c3aed] whitespace-nowrap bg-purple-50/40">
                      +{Number(w.platformFee).toLocaleString()} ETB
                    </td>
                    <td className="px-5 py-4 font-semibold text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                      {Number(w.netAmount).toLocaleString()} ETB
                    </td>
                    <td className="px-5 py-4 font-mono text-[10px] text-neutral-400 whitespace-nowrap">
                      {w.chapaReference || `BOKRA-WD-${w.id.substring(0, 6)}`}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-2xl p-6 shadow-md max-w-xl ml-auto space-y-4">
        <h3 className="font-extrabold text-base border-b border-neutral-700 pb-3 flex items-center gap-2">
          <FileText className="size-4 text-[#7c3aed]" />
          <span>Platform Revenue Summary</span>
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-neutral-300">
            <span>Booking Commissions ({PLATFORM_FEE_PERCENT}%):</span>
            <span className="font-mono font-bold text-white">{totalBookingCommissions.toLocaleString()} ETB</span>
          </div>
          <div className="flex justify-between text-neutral-300">
            <span>Withdrawal Fees Collected:</span>
            <span className="font-mono font-bold text-white">{totalWithdrawalFees.toLocaleString()} ETB</span>
          </div>
          <div className="pt-3 border-t border-neutral-700 flex justify-between items-center text-sm font-extrabold text-purple-300">
            <span>Total Platform Revenue:</span>
            <span className="text-xl font-mono text-purple-300">{totalPlatformRevenue.toLocaleString()} ETB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
