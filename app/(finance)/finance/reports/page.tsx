import React from "react";
import prisma from "@/lib/prisma";
import FinanceReportsClient from "@/components/finance/FinanceReportsClient";
import { FileText, DollarSign, Award, ArrowUpRight, Wallet } from "lucide-react";

export const revalidate = 0;

export default async function FinanceReportsPage() {
  const [paymentsRaw, hostWithdrawalsRaw, platformWithdrawalsRaw] = await Promise.all([
    prisma.payment
      .findMany({ orderBy: { createdAt: "desc" }, take: 50 })
      .catch(() => []),

    prisma.withdrawalRequest
      .findMany({
        orderBy: { createdAt: "desc" },
        include: { host: { select: { name: true } } },
        take: 50,
      })
      .catch(() => []),

    prisma.platformWithdrawal
      .findMany({ orderBy: { createdAt: "desc" }, take: 50 })
      .catch(() => []),
  ]);

  const payments = paymentsRaw.map((p) => ({
    id: p.id,
    date: new Date(p.createdAt).toLocaleDateString(),
    amount: Number(p.amount || 0),
    commission: Number(p.amount || 0) * 0.03,
    status: p.status,
  }));

  const hostWithdrawals = hostWithdrawalsRaw.map((w) => ({
    id: w.id,
    date: new Date(w.createdAt).toLocaleDateString(),
    hostName: w.host?.name || "Host",
    amount: Number(w.amount || 0),
    netSent: Number(w.netAmount || 0),
    reference: w.chapaReference || "MOCK_REF",
  }));

  const platformWithdrawals = platformWithdrawalsRaw.map((pw) => ({
    id: pw.id,
    date: new Date(pw.createdAt).toLocaleDateString(),
    amount: Number(pw.netAmount || 0),
    account: `${pw.accountType} - ${pw.accountNumber} (${pw.accountName})`,
    reference: pw.chapaReference || "MOCK_REF",
  }));

  const totalVol = paymentsRaw
    .filter((p) => p.status === "SUCCESS")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const totalComm = totalVol * 0.03;
  const totalHostPayouts = hostWithdrawalsRaw
    .filter((w) => w.status === "COMPLETED")
    .reduce((sum, w) => sum + Number(w.netAmount || 0), 0);

  const totalPlatformWithdrawn = platformWithdrawalsRaw
    .filter((pw) => pw.status === "COMPLETED")
    .reduce((sum, pw) => sum + Number(pw.netAmount || 0), 0);

  const walletBalance = Math.max(0, totalComm - totalPlatformWithdrawn);

  const totals = {
    totalRevenue: totalVol,
    totalCommission: totalComm,
    totalHostPayouts,
    totalPlatformWithdrawn,
    walletBalance,
  };

  const summaryCards = [
    {
      label: "Gross Revenue",
      value: `${totalVol.toLocaleString()} ETB`,
      icon: DollarSign,
      colorBg: "bg-blue-500/10",
      colorIcon: "text-blue-500",
      colorVal: "text-[#1a1208] dark:text-[#f5f0e8]",
    },
    {
      label: "Platform Commission",
      value: `${totalComm.toFixed(0)} ETB`,
      icon: Award,
      colorBg: "bg-[#b8943d]/10 dark:bg-[#c9a84c]/10",
      colorIcon: "text-[#b8943d] dark:text-[#c9a84c]",
      colorVal: "text-[#b8943d] dark:text-[#c9a84c]",
    },
    {
      label: "Host Payouts",
      value: `${totalHostPayouts.toLocaleString()} ETB`,
      icon: ArrowUpRight,
      colorBg: "bg-purple-500/10",
      colorIcon: "text-purple-500",
      colorVal: "text-purple-600 dark:text-purple-400",
    },
    {
      label: "Wallet Balance",
      value: `${walletBalance.toLocaleString()} ETB`,
      icon: Wallet,
      colorBg: "bg-emerald-500/10",
      colorIcon: "text-emerald-500",
      colorVal: "text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <div className="space-y-8 font-[Manrope,sans-serif] pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#1a1208] dark:text-[#f5f0e8] tracking-tight">
          Financial Reports
        </h1>
        <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278] mt-1">
          Detailed financial audits, commission accounting, withdrawal histories, and printable statements.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-white/[0.06] p-5 shadow-xs flex items-center gap-3"
            >
              <div className={`p-3 rounded-2xl shrink-0 ${s.colorBg} ${s.colorIcon}`}>
                <Icon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#9b8e7e] dark:text-[#8a8278] truncate">
                  {s.label}
                </p>
                <p className={`text-base font-black truncate ${s.colorVal}`}>{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reports Client (tabbed detailed tables) */}
      <div className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] shadow-xs p-6">
        <div className="flex items-center gap-2.5 border-b border-black/[0.06] dark:border-[#fff8dc]/[0.05] pb-4 mb-5">
          <FileText className="size-5 text-[#b8943d] dark:text-[#c9a84c]" />
          <h2 className="font-extrabold text-[#1a1208] dark:text-[#f5f0e8] text-base">
            Detailed Financial Statements
          </h2>
        </div>
        <FinanceReportsClient
          payments={payments}
          hostWithdrawals={hostWithdrawals}
          platformWithdrawals={platformWithdrawals}
          totals={totals}
        />
      </div>
    </div>
  );
}
