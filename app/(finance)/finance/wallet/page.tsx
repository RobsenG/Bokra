import React from "react";
import prisma from "@/lib/prisma";
import PlatformWithdrawModal from "@/components/finance/PlatformWithdrawModal";
import { Wallet, DollarSign, Award, ArrowUpRight, History } from "lucide-react";

export const revalidate = 0;

export default async function PlatformWalletPage() {
  const [paymentsAgg, platformWithdrawalsAgg, historyRaw] = await Promise.all([
    prisma.payment
      .aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true } })
      .catch(() => ({ _sum: { amount: null } })),

    prisma.platformWithdrawal
      .aggregate({ where: { status: "COMPLETED" }, _sum: { netAmount: true } })
      .catch(() => ({ _sum: { netAmount: null } })),

    prisma.platformWithdrawal
      .findMany({ orderBy: { createdAt: "desc" } })
      .catch(() => []),
  ]);

  const totalVolume = Number(paymentsAgg._sum?.amount || 0);
  const totalCommission = totalVolume * 0.03;
  const totalPlatformWithdrawn = Number(platformWithdrawalsAgg._sum?.netAmount || 0);
  const walletBalance = Math.max(0, totalCommission - totalPlatformWithdrawn);

  return (
    <div className="space-y-8 font-[Manrope,sans-serif] pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#1a1208] dark:text-[#f5f0e8] tracking-tight">
          Platform Wallet
        </h1>
        <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278] mt-1">
          Direct platform commission treasury management and mock Chapa fund withdrawals.
        </p>
      </div>

      {/* HERO WALLET BALANCE CARD */}
      <div className="max-w-2xl mx-auto bg-white dark:bg-[#141310] rounded-3xl border border-[#b8943d]/30 dark:border-[#c9a84c]/20 shadow-xl p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] flex items-center justify-center mx-auto ring-4 ring-[#b8943d]/20 dark:ring-[#c9a84c]/15">
          <Wallet className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#6b5e4e] dark:text-[#8a8278]">
            Available Platform Balance
          </span>
          <p className="text-5xl sm:text-6xl font-black text-[#b8943d] dark:text-[#c9a84c] mt-2 tracking-tight">
            {walletBalance.toLocaleString()}
            <span className="text-2xl ml-2 font-bold opacity-70">ETB</span>
          </p>
          <p className="text-xs text-[#9b8e7e] dark:text-[#6b6257] mt-1">
            Commissions earned minus funds already withdrawn
          </p>
        </div>

        {/* Mini Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/[0.08] dark:border-[#fff8dc]/[0.06] text-left">
          <div className="p-4 rounded-2xl bg-[#faf9f7] dark:bg-[#1c1a16] space-y-1">
            <div className="flex items-center gap-1.5 text-[#b8943d] dark:text-[#c9a84c]">
              <Award className="size-4" />
              <span className="text-[11px] font-bold uppercase tracking-wide text-[#6b5e4e] dark:text-[#8a8278]">
                Total Commission
              </span>
            </div>
            <p className="text-lg font-black text-[#1a1208] dark:text-[#f5f0e8]">
              {totalCommission.toFixed(0)} ETB
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#faf9f7] dark:bg-[#1c1a16] space-y-1">
            <div className="flex items-center gap-1.5">
              <ArrowUpRight className="size-4 text-purple-500" />
              <span className="text-[11px] font-bold uppercase tracking-wide text-[#6b5e4e] dark:text-[#8a8278]">
                Total Withdrawn
              </span>
            </div>
            <p className="text-lg font-black text-purple-600 dark:text-purple-400">
              {totalPlatformWithdrawn.toLocaleString()} ETB
            </p>
          </div>
        </div>

        {/* Withdraw Button */}
        <div className="pt-2">
          <PlatformWithdrawModal maxBalance={walletBalance} />
        </div>
      </div>

      {/* WITHDRAWAL HISTORY TABLE */}
      <div className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] shadow-xs p-6 space-y-5">
        <div className="flex items-center gap-2.5 border-b border-black/[0.06] dark:border-[#fff8dc]/[0.05] pb-4">
          <History className="size-5 text-[#b8943d] dark:text-[#c9a84c]" />
          <h2 className="font-extrabold text-[#1a1208] dark:text-[#f5f0e8] text-base">
            Platform Withdrawal History
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#faf9f7] dark:bg-[#1c1a16] text-[#6b5e4e] dark:text-[#8a8278] text-[10px] font-extrabold uppercase tracking-wider border-b border-black/[0.06] dark:border-[#fff8dc]/[0.05]">
                <th className="px-4 py-3.5 rounded-tl-xl">Date & Time</th>
                <th className="px-4 py-3.5">Net Withdrawn</th>
                <th className="px-4 py-3.5">Account</th>
                <th className="px-4 py-3.5">Chapa Reference</th>
                <th className="px-4 py-3.5">Processed By</th>
                <th className="px-4 py-3.5 rounded-tr-xl">Status</th>
              </tr>
            </thead>
            <tbody>
              {historyRaw.length > 0 ? (
                historyRaw.map((rec, idx) => (
                  <tr
                    key={rec.id}
                    className={`text-xs transition-colors ${idx % 2 === 0 ? "bg-[#faf9f7] dark:bg-[#1c1a16]" : "bg-white dark:bg-[#141310]"} hover:bg-[#b8943d]/5 dark:hover:bg-[#c9a84c]/5`}
                  >
                    <td className="px-4 py-3.5 text-[#6b5e4e] dark:text-[#8a8278]">
                      {new Date(rec.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 font-extrabold text-[#b8943d] dark:text-[#c9a84c]">
                      {Number(rec.netAmount).toLocaleString()} ETB
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-[#1a1208] dark:text-[#f5f0e8] block">
                        {rec.accountType}
                      </span>
                      <span className="text-[11px] text-[#9b8e7e] dark:text-[#6b6257]">
                        {rec.accountNumber} ({rec.accountName})
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[10px] text-[#9b8e7e] dark:text-[#6b6257]">
                      {rec.chapaReference || "MOCK_REF"}
                    </td>
                    <td className="px-4 py-3.5 text-[#6b5e4e] dark:text-[#8a8278]">
                      {rec.processedBy}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[#9b8e7e] dark:text-[#6b6257]">
                    <DollarSign className="size-8 mx-auto mb-2 opacity-30" />
                    No platform withdrawal history yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
