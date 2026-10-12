import React from "react";
import prisma from "@/lib/prisma";
import {
  DollarSign,
  Award,
  Wallet,
  ArrowUpRight,
  Clock,
  TrendingUp,
  ArrowLeftRight,
  CreditCard,
  Activity,
  ArrowRight,
  Zap,
} from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function FinanceDashboardPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalRevenueAgg,
    thisMonthRevenueAgg,
    hostPaidAgg,
    platformWithdrawnAgg,
    pendingWithdrawalsCount,
    recentPayments,
    recentWithdrawals,
  ] = await Promise.all([
    prisma.payment
      .aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true } })
      .catch(() => ({ _sum: { amount: null } })),

    prisma.payment
      .aggregate({
        where: { status: "SUCCESS", createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
      })
      .catch(() => ({ _sum: { amount: null } })),

    prisma.withdrawalRequest
      .aggregate({ where: { status: "COMPLETED" }, _sum: { netAmount: true } })
      .catch(() => ({ _sum: { netAmount: null } })),

    prisma.platformWithdrawal
      .aggregate({ where: { status: "COMPLETED" }, _sum: { netAmount: true } })
      .catch(() => ({ _sum: { netAmount: null } })),

    prisma.withdrawalRequest.count({ where: { status: "PENDING" } }).catch(() => 0),

    prisma.payment
      .findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          booking: {
            include: {
              renter: { select: { name: true, email: true } },
              property: { select: { title: true } },
            },
          },
        },
      })
      .catch(() => []),

    prisma.withdrawalRequest
      .findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { host: { select: { name: true, email: true } } },
      })
      .catch(() => []),
  ]);

  const totalRevenue = Number(totalRevenueAgg._sum?.amount || 0);
  const thisMonthRevenue = Number(thisMonthRevenueAgg._sum?.amount || 0);
  const totalCommission = totalRevenue * 0.03;
  const totalPaidToHosts = Number(hostPaidAgg._sum?.netAmount || 0);
  const totalPlatformWithdrawn = Number(platformWithdrawnAgg._sum?.netAmount || 0);
  const walletBalance = Math.max(0, totalCommission - totalPlatformWithdrawn);

  // Status pills
  const statusPills = [
    {
      label: "Gross Revenue",
      value: `${totalRevenue.toLocaleString()} ETB`,
      icon: DollarSign,
      color: "text-blue-500",
    },
    {
      label: "Commission (3%)",
      value: `${totalCommission.toFixed(0)} ETB`,
      icon: Award,
      color: "text-[#b8943d] dark:text-[#c9a84c]",
    },
    {
      label: "MTD Revenue",
      value: `${thisMonthRevenue.toLocaleString()} ETB`,
      icon: TrendingUp,
      color: "text-[#b8943d] dark:text-[#c9a84c]",
    },
    {
      label: "Wallet Balance",
      value: `${walletBalance.toLocaleString()} ETB`,
      icon: Wallet,
      color: "text-emerald-500",
    },
    {
      label: "Pending Withdrawals",
      value: String(pendingWithdrawalsCount),
      icon: Clock,
      color: "text-amber-500",
    },
  ];

  // Stat grid cards with sparklines
  const gridStats = [
    {
      label: "Total Platform Revenue",
      value: `${totalRevenue.toLocaleString()} ETB`,
      sub: "Gross processed volume (all time)",
      href: "/finance/transactions",
      icon: DollarSign,
      color: "#3b82f6",
      sparkline: [12000, 28000, 45000, 60000, totalRevenue || 80000],
    },
    {
      label: "Commission Earned (3%)",
      value: `${totalCommission.toFixed(0)} ETB`,
      sub: "Total 3% platform share",
      href: "/finance/wallet",
      icon: Award,
      color: "#b8943d",
      sparkline: [360, 840, 1350, 1800, totalCommission || 2400],
    },
    {
      label: "Paid Out to Hosts",
      value: `${totalPaidToHosts.toLocaleString()} ETB`,
      sub: "Completed host payouts",
      href: "/finance/withdrawals",
      icon: ArrowUpRight,
      color: "#8b5cf6",
      sparkline: [5000, 12000, 20000, 30000, totalPaidToHosts || 40000],
    },
    {
      label: "Platform Wallet",
      value: `${walletBalance.toLocaleString()} ETB`,
      sub: "Available for withdrawal",
      href: "/finance/wallet",
      icon: Wallet,
      color: "#10b981",
      sparkline: [800, 1200, 2000, 2800, walletBalance || 3500],
    },
    {
      label: "Pending Host Requests",
      value: String(pendingWithdrawalsCount),
      sub: "Awaiting payout approval",
      href: "/finance/withdrawals",
      icon: Clock,
      color: "#f59e0b",
      sparkline: [2, 5, 3, 7, pendingWithdrawalsCount || 4],
    },
    {
      label: "This Month Revenue",
      value: `${thisMonthRevenue.toLocaleString()} ETB`,
      sub: "MTD processed volume",
      href: "/finance/transactions",
      icon: TrendingUp,
      color: "#c9a84c",
      sparkline: [1000, 3000, 5000, 8000, thisMonthRevenue || 10000],
    },
  ];

  return (
    <div className="space-y-8 font-[Manrope,sans-serif] pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#1a1208] dark:text-[#f5f0e8] tracking-tight">
          Finance Command Center
        </h1>
        <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278] mt-1">
          Real-time revenue flows, commission tracking, host payout management, and platform liquidity.
        </p>
      </div>

      {/* STATUS PILLS ROW */}
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
                {pill.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* PENDING WITHDRAWALS BANNER */}
      {pendingWithdrawalsCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Zap className="size-6 animate-pulse" />
            </div>
            <div>
              <p className="font-extrabold text-base text-amber-900 dark:text-[#fcd34d]">
                ⚡ {pendingWithdrawalsCount} host withdrawal{pendingWithdrawalsCount === 1 ? "" : "s"} awaiting approval
              </p>
              <p className="text-xs text-amber-800/80 dark:text-[#fcd34d]/80 mt-0.5">
                Review and process host payout requests to maintain platform trust.
              </p>
            </div>
          </div>
          <Link
            href="/finance/withdrawals"
            className="shrink-0 px-6 py-2.5 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors"
          >
            Review Now →
          </Link>
        </div>
      )}

      {/* 3×2 STATS GRID WITH CSS SPARKLINES */}
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
                <p className="text-[11px] text-[#9b8e7e] dark:text-[#6b6257] mt-1">
                  {stat.sub}
                </p>
              </div>

              {/* CSS Sparkline */}
              <div className="flex items-end justify-between pt-2 border-t border-black/[0.04] dark:border-white/[0.04]">
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

      {/* RECENT ACTIVITY — TRANSACTIONS & WITHDRAWALS SIDE BY SIDE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] shadow-xs p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-[#fff8dc]/[0.05] pb-4">
            <div className="flex items-center gap-2.5">
              <Activity className="size-5 text-[#b8943d] dark:text-[#c9a84c]" />
              <h2 className="font-extrabold text-[#1a1208] dark:text-[#f5f0e8] text-base">
                Recent Transactions
              </h2>
            </div>
            <Link
              href="/finance/transactions"
              className="text-xs font-bold text-[#b8943d] dark:text-[#c9a84c] hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="space-y-2">
            {recentPayments.length > 0 ? (
              recentPayments.map((p, idx) => {
                const amt = Number(p.amount || 0);
                const isEven = idx % 2 === 0;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs ${isEven ? "bg-[#faf9f7] dark:bg-[#1c1a16]" : "bg-transparent"} border border-transparent hover:border-black/[0.05] dark:hover:border-white/[0.05] transition-colors`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-extrabold text-[#1a1208] dark:text-[#f5f0e8] truncate">
                        {p.booking?.renter?.name || "Renter"}
                      </p>
                      <p className="text-[11px] text-[#9b8e7e] dark:text-[#6b6257] truncate">
                        {p.booking?.property?.title || "Property"} ·{" "}
                        {new Date(p.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right shrink-0 space-y-0.5 pl-3">
                      <p className="font-black text-[#1a1208] dark:text-[#f5f0e8]">
                        {amt.toLocaleString()} ETB
                      </p>
                      <p className="text-[10px] font-bold text-[#b8943d] dark:text-[#c9a84c]">
                        +{(amt * 0.03).toFixed(0)} comm.
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-[#9b8e7e] dark:text-[#8a8278]">
                <CreditCard className="size-8 mx-auto mb-2 opacity-40" />
                No transaction records yet.
              </div>
            )}
          </div>
        </div>

        {/* Recent Host Withdrawals */}
        <div className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] shadow-xs p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-[#fff8dc]/[0.05] pb-4">
            <div className="flex items-center gap-2.5">
              <Wallet className="size-5 text-[#b8943d] dark:text-[#c9a84c]" />
              <h2 className="font-extrabold text-[#1a1208] dark:text-[#f5f0e8] text-base">
                Host Withdrawals
              </h2>
            </div>
            <Link
              href="/finance/withdrawals"
              className="text-xs font-bold text-[#b8943d] dark:text-[#c9a84c] hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="space-y-2">
            {recentWithdrawals.length > 0 ? (
              recentWithdrawals.map((w, idx) => {
                const isEven = idx % 2 === 0;
                const statusColor =
                  w.status === "COMPLETED"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40"
                    : w.status === "PENDING"
                    ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40"
                    : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/40";

                return (
                  <div
                    key={w.id}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs ${isEven ? "bg-[#faf9f7] dark:bg-[#1c1a16]" : "bg-transparent"} border border-transparent hover:border-black/[0.05] dark:hover:border-white/[0.05] transition-colors`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-extrabold text-[#1a1208] dark:text-[#f5f0e8] truncate">
                        {w.host?.name || "Host"}
                      </p>
                      <p className="text-[11px] text-[#9b8e7e] dark:text-[#6b6257]">
                        {new Date(w.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right shrink-0 space-y-1 pl-3">
                      <p className="font-black text-[#1a1208] dark:text-[#f5f0e8]">
                        {Number(w.netAmount).toLocaleString()} ETB
                      </p>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${statusColor}`}
                      >
                        {w.status}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-[#9b8e7e] dark:text-[#8a8278]">
                <Wallet className="size-8 mx-auto mb-2 opacity-40" />
                No withdrawal records yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
