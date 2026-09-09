"use client";

import { useState } from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Percent,
} from "lucide-react";
import WithdrawalModal from "@/components/dashboard/WithdrawalModal";
import { calculatePlatformFee, calculateNetAmount } from "@/lib/platform";

interface DepositItem {
  id: string;
  createdAt: Date;
  amount: number;
  chapaReference: string | null;
  status: string;
  renterName: string;
  renterEmail: string;
  propertyTitle: string;
  nights: number;
}

interface WithdrawalItem {
  id: string;
  createdAt: Date;
  amount: number;
  platformFee: number;
  netAmount: number;
  accountType: string;
  accountNumber: string;
  accountName: string;
  status: string;
  note: string | null;
  chapaReference: string | null;
}

interface RevenueClientProps {
  stats: {
    totalEarned: number;
    platformFeesDeducted: number;
    hostEarnings: number;
    totalWithdrawn: number;
    pendingWithdrawals: number;
    availableBalance: number;
  };
  deposits: DepositItem[];
  withdrawals: WithdrawalItem[];
}

export default function RevenueClient({
  stats,
  deposits,
  withdrawals,
}: RevenueClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const maskAccountNumber = (acc: string) => {
    if (!acc || acc.length <= 4) return acc;
    return `•••• ${acc.slice(-4)}`;
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header & Withdraw Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1208] dark:text-[#f8f6f0] tracking-tight">
            Earnings &amp; payouts 💰
          </h1>
          <p className="text-sm text-[#6b5e4e] dark:text-[#9b9080] mt-0.5">
            Track your earnings and manage payouts.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={stats.availableBalance <= 0}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#b8943d] dark:bg-[#c9a84c] hover:brightness-110 text-white dark:text-[#0a0a0f] shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <ArrowUpRight className="size-4" />
          Withdraw earnings
        </button>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Earned */}
        <div className="bg-white dark:bg-[#12121a] rounded-2xl p-4.5 shadow-xs border border-black/[0.08] dark:border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6b5e4e] dark:text-[#9b9080]">
              Total Earned
            </span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-blue-600 dark:text-blue-400">
              <ArrowDownLeft className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl font-black text-[#1a1208] dark:text-[#f8f6f0]">
              {stats.totalEarned.toLocaleString()}{" "}
              <span className="text-xs font-semibold text-[#6b5e4e] dark:text-[#9b9080]">ETB</span>
            </p>
            <p className="text-[10px] text-[#6b5e4e] dark:text-[#9b9080] mt-0.5">
              Gross booking payments
            </p>
          </div>
        </div>

        {/* Platform Fee (3%) */}
        <div className="bg-white dark:bg-[#12121a] rounded-2xl p-4.5 shadow-xs border border-black/[0.08] dark:border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Platform Fee (3%)
            </span>
            <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded-xl text-orange-600 dark:text-orange-400">
              <Percent className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl font-black text-orange-600 dark:text-orange-400">
              - {stats.platformFeesDeducted.toLocaleString()}{" "}
              <span className="text-xs font-semibold text-orange-400">ETB</span>
            </p>
            <p className="text-[10px] text-orange-600/80 dark:text-orange-400/80 mt-0.5">
              Deducted service fee
            </p>
          </div>
        </div>

        {/* Your Earnings (97%) */}
        <div className="bg-white dark:bg-[#12121a] rounded-2xl p-4.5 shadow-xs border border-[#b8943d]/20 dark:border-[#c9a84c]/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#b8943d] dark:text-[#c9a84c]">
              Your Earnings (97%)
            </span>
            <div className="p-2 bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 rounded-xl text-[#b8943d] dark:text-[#c9a84c]">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl font-black text-[#b8943d] dark:text-[#c9a84c]">
              {stats.hostEarnings.toLocaleString()}{" "}
              <span className="text-xs font-semibold text-[#b8943d] dark:text-[#c9a84c]">ETB</span>
            </p>
            <p className="text-[10px] text-[#b8943d]/80 dark:text-[#c9a84c]/80 mt-0.5 font-medium">
              Net revenue earned
            </p>
          </div>
        </div>

        {/* Total Withdrawn */}
        <div className="bg-white dark:bg-[#12121a] rounded-2xl p-4.5 shadow-xs border border-black/[0.08] dark:border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6b5e4e] dark:text-[#9b9080]">
              Total Withdrawn
            </span>
            <div className="p-2 bg-black/5 dark:bg-white/5 rounded-xl text-[#6b5e4e] dark:text-[#9b9080]">
              <ArrowUpRight className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl font-black text-[#1a1208] dark:text-[#f8f6f0]">
              - {stats.totalWithdrawn.toLocaleString()}{" "}
              <span className="text-xs font-semibold text-[#6b5e4e] dark:text-[#9b9080]">ETB</span>
            </p>
            <p className="text-[10px] text-[#6b5e4e] dark:text-[#9b9080] mt-0.5">
              Transferred to accounts
            </p>
          </div>
        </div>

        {/* Available Balance */}
        <div className="bg-gradient-to-br from-[#12121a] to-[#0a0a0f] text-white rounded-2xl p-4.5 shadow-md border border-[#c9a84c]/30 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#c9a84c]">
              Available Balance
            </span>
            <div className="p-2 bg-[#c9a84c]/20 rounded-xl text-[#c9a84c]">
              <Wallet className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-white">
              {stats.availableBalance.toLocaleString()}{" "}
              <span className="text-xs font-semibold text-[#c9a84c]">ETB</span>
            </p>
            <p className="text-[10px] text-[#9b9080] mt-0.5 font-medium">Ready for instant payout</p>
          </div>
        </div>
      </div>

      {/* Deposit History Section */}
      <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-black/[0.08] dark:border-white/[0.06] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
          <div>
            <h2 className="font-bold text-[#1a1208] dark:text-[#f8f6f0] text-sm">
              Payment Deposits &amp; Revenue Breakdown
            </h2>
            <p className="text-xs text-[#6b5e4e] dark:text-[#9b9080]">
              Successful guest booking payments with 3% platform fee and net earnings calculation
            </p>
          </div>
          <span className="text-xs font-bold text-[#b8943d] dark:text-[#c9a84c] bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 px-2.5 py-1 rounded-lg">
            {deposits.length} Received
          </span>
        </div>

        {deposits.length === 0 ? (
          <div className="py-12 text-center space-y-1">
            <ArrowDownLeft className="size-8 text-[#6b5e4e] dark:text-[#9b9080] mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#1a1208] dark:text-[#f8f6f0]">
              No deposit history yet
            </p>
            <p className="text-xs text-[#6b5e4e] dark:text-[#9b9080]">
              Deposits will show up here automatically when guests pay for bookings.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f5f3ef] dark:bg-[#1a1a2e] text-[#6b5e4e] dark:text-[#9b9080] border-b border-black/[0.06] dark:border-white/[0.06] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Renter</th>
                  <th className="px-6 py-3">Property</th>
                  <th className="px-6 py-3">Stay</th>
                  <th className="px-6 py-3">Total Paid</th>
                  <th className="px-6 py-3 text-orange-600 dark:text-orange-400">Platform Fee (3%)</th>
                  <th className="px-6 py-3 text-[#b8943d] dark:text-[#c9a84c]">Your Earnings (97%)</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06] font-medium text-[#1a1208] dark:text-[#f8f6f0]">
                {deposits.map((item) => {
                  const fee = calculatePlatformFee(item.amount);
                  const net = calculateNetAmount(item.amount);

                  return (
                    <tr key={item.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-[#6b5e4e] dark:text-[#9b9080]">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 font-semibold text-[#1a1208] dark:text-[#f8f6f0]">
                        {item.renterName || item.renterEmail}
                      </td>
                      <td className="px-6 py-4 max-w-[180px] truncate">
                        {item.propertyTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.nights} {item.nights === 1 ? "night" : "nights"}
                      </td>
                      <td className="px-6 py-4 font-extrabold text-[#1a1208] dark:text-[#f8f6f0] whitespace-nowrap">
                        {item.amount.toLocaleString()} ETB
                      </td>
                      <td className="px-6 py-4 font-semibold text-orange-600 dark:text-orange-400 whitespace-nowrap">
                        - {fee.toLocaleString()} ETB
                      </td>
                      <td className="px-6 py-4 font-extrabold text-[#b8943d] dark:text-[#c9a84c] whitespace-nowrap">
                        + {net.toLocaleString()} ETB
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] border border-[#b8943d]/20 dark:border-[#c9a84c]/20">
                          <CheckCircle2 className="size-3" /> SUCCESS
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Withdrawal History Section */}
      <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-black/[0.08] dark:border-white/[0.06] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
          <div>
            <h2 className="font-bold text-[#1a1208] dark:text-[#f8f6f0] text-sm">
              Withdrawal History
            </h2>
            <p className="text-xs text-[#6b5e4e] dark:text-[#9b9080]">
              Payout transfer requests
            </p>
          </div>
          <span className="text-xs font-bold text-[#b8943d] dark:text-[#c9a84c] bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 px-2.5 py-1 rounded-lg">
            {withdrawals.length} Requests
          </span>
        </div>

        {withdrawals.length === 0 ? (
          <div className="py-12 text-center space-y-1">
            <ArrowUpRight className="size-8 text-[#6b5e4e] dark:text-[#9b9080] mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#1a1208] dark:text-[#f8f6f0]">
              No withdrawal requests yet
            </p>
            <p className="text-xs text-[#6b5e4e] dark:text-[#9b9080]">
              Click &quot;Withdraw earnings&quot; above to request a payout transfer.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f5f3ef] dark:bg-[#1a1a2e] text-[#6b5e4e] dark:text-[#9b9080] border-b border-black/[0.06] dark:border-white/[0.06] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Date Requested</th>
                  <th className="px-6 py-3">Requested</th>
                  <th className="px-6 py-3 text-orange-600 dark:text-orange-400">Fee (3%)</th>
                  <th className="px-6 py-3 text-[#b8943d] dark:text-[#c9a84c]">Net Transferred</th>
                  <th className="px-6 py-3">Destination</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Chapa Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06] font-medium text-[#1a1208] dark:text-[#f8f6f0]">
                {withdrawals.map((item) => (
                  <tr key={item.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-[#6b5e4e] dark:text-[#9b9080]">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#1a1208] dark:text-[#f8f6f0] whitespace-nowrap">
                      {item.amount.toLocaleString()} ETB
                    </td>
                    <td className="px-6 py-4 font-semibold text-orange-600 dark:text-orange-400 whitespace-nowrap">
                      - {item.platformFee.toLocaleString()} ETB
                    </td>
                    <td className="px-6 py-4 font-extrabold text-[#b8943d] dark:text-[#c9a84c] whitespace-nowrap">
                      {item.netAmount.toLocaleString()} ETB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="capitalize font-semibold text-[#1a1208] dark:text-[#f8f6f0]">{item.accountType}</span>{" "}
                      <span className="text-[#6b5e4e] dark:text-[#9b9080] font-mono">({maskAccountNumber(item.accountNumber)})</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] border border-[#b8943d]/20 dark:border-[#c9a84c]/20">
                        <CheckCircle2 className="size-3" /> COMPLETED
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-[150px] truncate text-[#6b5e4e] dark:text-[#9b9080] font-mono text-[10px]">
                      {item.chapaReference || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Withdrawal Modal Component */}
      <WithdrawalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableBalance={stats.availableBalance}
      />
    </div>
  );
}
