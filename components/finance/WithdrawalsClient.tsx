"use client";

import React, { useState } from "react";
import { Wallet, CheckCircle, Clock, XCircle, Search } from "lucide-react";

interface HostWithdrawalRow {
  id: string;
  date: string;
  hostName: string;
  hostEmail: string;
  amount: number;
  platformFee: number;
  netAmount: number;
  accountType: string;
  accountNumberMasked: string;
  reference: string;
  status: string;
}

interface Props {
  withdrawals: HostWithdrawalRow[];
}

export default function WithdrawalsClient({ withdrawals }: Props) {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filtered = withdrawals.filter((w) => {
    if (statusFilter !== "ALL" && w.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchHost = w.hostName.toLowerCase().includes(q) || w.hostEmail.toLowerCase().includes(q);
      const matchRef = w.reference.toLowerCase().includes(q);
      if (!matchHost && !matchRef) return false;
    }
    return true;
  });

  const totalRequests = withdrawals.length;
  const completedCount = withdrawals.filter((w) => w.status === "COMPLETED").length;
  const pendingCount = withdrawals.filter((w) => w.status === "PENDING").length;
  const totalPaidOut = withdrawals
    .filter((w) => w.status === "COMPLETED")
    .reduce((acc, item) => acc + item.netAmount, 0);

  return (
    <div className="space-y-6">
      {/* STATS AT TOP (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#141310] p-5 rounded-2xl border border-black/[0.08] dark:border-white/[0.06] shadow-sm">
          <p className="text-xs font-semibold text-[#6b5e4e] dark:text-[#8a8278]">Total Withdrawal Requests</p>
          <p className="text-2xl font-bold text-[#1a1208] dark:text-[#f5f0e8] mt-1">
            {totalRequests}
          </p>
        </div>

        <div className="bg-white dark:bg-[#141310] p-5 rounded-2xl border border-black/[0.08] dark:border-white/[0.06] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#6b5e4e] dark:text-[#8a8278]">Completed Payouts</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {completedCount}
            </p>
          </div>
          <CheckCircle className="w-6 h-6 text-emerald-500 opacity-80" />
        </div>

        <div className="bg-white dark:bg-[#141310] p-5 rounded-2xl border border-black/[0.08] dark:border-white/[0.06] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#6b5e4e] dark:text-[#8a8278]">Pending Payouts</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {pendingCount}
            </p>
          </div>
          <Clock className="w-6 h-6 text-amber-500 opacity-80" />
        </div>

        <div className="bg-white dark:bg-[#141310] p-5 rounded-2xl border border-black/[0.08] dark:border-white/[0.06] shadow-sm">
          <p className="text-xs font-semibold text-[#6b5e4e] dark:text-[#8a8278]">Total Amount Paid Out</p>
          <p className="text-2xl font-bold text-[#b8943d] dark:text-[#c9a84c] mt-1">
            {totalPaidOut.toLocaleString()} ETB
          </p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {["ALL", "COMPLETED", "PENDING", "FAILED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-[#b8943d] dark:bg-[#c9a84c] text-white dark:text-[#09090f] shadow-sm"
                  : "bg-white dark:bg-[#141310] text-[#6b5e4e] dark:text-[#8a8278] border border-black/[0.08] dark:border-white/[0.06]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#9b8e7e]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search host or reference..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-[#0a0908] text-[#1a1208] dark:text-[#f5f0e8] text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* WITHDRAWALS TABLE */}
      <div className="overflow-x-auto rounded-2xl border border-black/[0.08] dark:border-white/[0.06] bg-white dark:bg-[#141310] shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/[0.08] dark:border-white/[0.06] text-[#6b5e4e] dark:text-[#8a8278] uppercase font-bold">
            <tr>
              <th className="px-4 py-3.5">Date</th>
              <th className="px-4 py-3.5">Host Name & Email</th>
              <th className="px-4 py-3.5">Requested Amount</th>
              <th className="px-4 py-3.5">Platform Fee (3%)</th>
              <th className="px-4 py-3.5">Net Sent</th>
              <th className="px-4 py-3.5">Account Type & Number</th>
              <th className="px-4 py-3.5">Chapa Reference</th>
              <th className="px-4 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06] text-[#1a1208] dark:text-[#f5f0e8]">
            {filtered.length > 0 ? (
              filtered.map((w) => (
                <tr key={w.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                  <td className="px-4 py-3.5 text-[#6b5e4e] dark:text-[#8a8278]">
                    {w.date}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-semibold block">{w.hostName}</span>
                    <span className="text-[10px] text-[#9b8e7e]">{w.hostEmail}</span>
                  </td>
                  <td className="px-4 py-3.5 font-bold">
                    {w.amount.toLocaleString()} ETB
                  </td>
                  <td className="px-4 py-3.5 text-[#b8943d] font-bold">
                    {w.platformFee.toLocaleString()} ETB
                  </td>
                  <td className="px-4 py-3.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    {w.netAmount.toLocaleString()} ETB
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-semibold block">{w.accountType}</span>
                    <span className="text-[11px] font-mono text-[#9b8e7e]">
                      {w.accountNumberMasked}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[10px] text-[#9b8e7e]">
                    {w.reference}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        w.status === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : w.status === "PENDING"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {w.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[#9b8e7e]">
                  No withdrawal records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
