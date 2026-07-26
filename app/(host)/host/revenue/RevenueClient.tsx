"use client";

import { useState } from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  CreditCard,
  Smartphone,
  Plus,
} from "lucide-react";
import WithdrawalModal from "@/components/dashboard/WithdrawalModal";

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
    <div className="space-y-8">
      {/* Header & Withdraw Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-800 dark:text-white tracking-tight">
            Revenue & Payouts 💰
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Track deposit earnings from guest bookings and manage payout withdrawals.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-md shadow-teal-600/10 transition-all cursor-pointer"
        >
          <ArrowUpRight className="size-4" />
          Withdraw Funds
        </button>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="bg-gradient-to-br from-teal-900 to-teal-950 text-white rounded-2xl p-5 shadow-sm border border-teal-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-300">
              Available Balance
            </span>
            <div className="p-2 bg-teal-500/20 rounded-xl text-teal-300">
              <Wallet className="size-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-white">
              {stats.availableBalance.toLocaleString()}{" "}
              <span className="text-sm font-semibold text-teal-300">ETB</span>
            </p>
            <p className="text-[10px] text-teal-300/80 mt-1">Ready for transfer</p>
          </div>
        </div>

        {/* Total Earned */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-xs border border-neutral-100 dark:border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Total Earned
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeft className="size-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-neutral-800 dark:text-white">
              {stats.totalEarned.toLocaleString()}{" "}
              <span className="text-xs font-semibold text-neutral-400">ETB</span>
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
              All-time gross booking payouts
            </p>
          </div>
        </div>

        {/* Total Withdrawn */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-xs border border-neutral-100 dark:border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Total Withdrawn
            </span>
            <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded-xl text-orange-600 dark:text-orange-400">
              <ArrowUpRight className="size-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-neutral-800 dark:text-white">
              {stats.totalWithdrawn.toLocaleString()}{" "}
              <span className="text-xs font-semibold text-neutral-400">ETB</span>
            </p>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">
              Completed payouts to bank/wallet
            </p>
          </div>
        </div>

        {/* Pending Withdrawals */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-xs border border-neutral-100 dark:border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Pending Payouts
            </span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-amber-600 dark:text-amber-400">
              <Clock className="size-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-neutral-800 dark:text-white">
              {stats.pendingWithdrawals.toLocaleString()}{" "}
              <span className="text-xs font-semibold text-neutral-400">ETB</span>
            </p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
              Processing in gateway queue
            </p>
          </div>
        </div>
      </div>

      {/* Deposit History Section */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-neutral-800 dark:text-white text-sm">
              Payment Deposits
            </h2>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              Successful payments received from guests via Chapa gateway
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-lg">
            {deposits.length} Received
          </span>
        </div>

        {deposits.length === 0 ? (
          <div className="py-12 text-center space-y-1">
            <ArrowDownLeft className="size-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
              No deposit history yet
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              Deposits will show up here automatically when guests pay for bookings.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/70 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Renter</th>
                  <th className="px-6 py-3">Property</th>
                  <th className="px-6 py-3">Stay Duration</th>
                  <th className="px-6 py-3">Amount (ETB)</th>
                  <th className="px-6 py-3">Chapa Ref</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-medium text-neutral-700 dark:text-neutral-200">
                {deposits.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-neutral-500 dark:text-neutral-400">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                      {item.renterName || item.renterEmail}
                    </td>
                    <td className="px-6 py-4 max-w-[200px] truncate">
                      {item.propertyTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.nights} {item.nights === 1 ? "night" : "nights"}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      +{item.amount.toLocaleString()} ETB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-[10px] text-neutral-400">
                      {item.chapaReference || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                        <CheckCircle2 className="size-3" /> SUCCESS
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Withdrawal History Section */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-neutral-800 dark:text-white text-sm">
              Withdrawal Requests
            </h2>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              History of payout transfer requests to your bank account, Telebirr, or Chapa wallet
            </p>
          </div>
          <span className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 px-2.5 py-1 rounded-lg">
            {withdrawals.length} Requests
          </span>
        </div>

        {withdrawals.length === 0 ? (
          <div className="py-12 text-center space-y-1">
            <ArrowUpRight className="size-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
              No withdrawal requests yet
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              Click "Withdraw Funds" above to request a payout transfer.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/70 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Date Requested</th>
                  <th className="px-6 py-3">Amount (ETB)</th>
                  <th className="px-6 py-3">Account Type</th>
                  <th className="px-6 py-3">Account Number</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-medium text-neutral-700 dark:text-neutral-200">
                {withdrawals.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-neutral-500 dark:text-neutral-400">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-orange-600 dark:text-orange-400 whitespace-nowrap">
                      -{item.amount.toLocaleString()} ETB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize font-semibold">
                      {item.accountType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-neutral-600 dark:text-neutral-350">
                      {maskAccountNumber(item.accountNumber)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === "COMPLETED"
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40"
                            : item.status === "PROCESSING"
                            ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40"
                            : item.status === "PENDING"
                            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40"
                            : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-[180px] truncate text-neutral-400 text-[11px]">
                      {item.note || "—"}
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
