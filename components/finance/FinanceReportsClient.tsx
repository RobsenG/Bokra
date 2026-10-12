"use client";

import React, { useState } from "react";
import { Printer, DollarSign, Wallet, ArrowUpRight, Award } from "lucide-react";

interface PaymentReportRow {
  id: string;
  date: string;
  amount: number;
  commission: number;
  status: string;
}

interface HostWithdrawalReportRow {
  id: string;
  date: string;
  hostName: string;
  amount: number;
  netSent: number;
  reference: string;
}

interface PlatformWithdrawalReportRow {
  id: string;
  date: string;
  amount: number;
  account: string;
  reference: string;
}

interface Props {
  payments: PaymentReportRow[];
  hostWithdrawals: HostWithdrawalReportRow[];
  platformWithdrawals: PlatformWithdrawalReportRow[];
  totals: {
    totalRevenue: number;
    totalCommission: number;
    totalHostPayouts: number;
    totalPlatformWithdrawn: number;
    walletBalance: number;
  };
}

export default function FinanceReportsClient({
  payments,
  hostWithdrawals,
  platformWithdrawals,
  totals,
}: Props) {
  const [reportType, setReportType] = useState<"monthly" | "commission" | "withdrawal" | "wallet">("monthly");

  const tabs = [
    { key: "monthly",    label: "Monthly Revenue",    icon: DollarSign },
    { key: "commission", label: "Commission Report",  icon: Award },
    { key: "withdrawal", label: "Withdrawal Audit",   icon: ArrowUpRight },
    { key: "wallet",     label: "Platform Wallet",    icon: Wallet },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Report Selector Bar */}
      <div className="no-print flex items-center justify-between border-b border-black/[0.08] dark:border-[#fff8dc]/[0.06] pb-4 overflow-x-auto gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setReportType(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                reportType === key
                  ? "bg-[#b8943d] dark:bg-[#c9a84c] text-white dark:text-[#080806] shadow-sm"
                  : "bg-white dark:bg-[#141310] text-[#6b5e4e] dark:text-[#8a8278] hover:text-[#1a1208] dark:hover:text-[#f5f0e8] border border-black/[0.08] dark:border-[#fff8dc]/[0.07]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a1208] dark:bg-[#f5f0e8] text-white dark:text-[#080806] font-semibold text-xs shadow hover:brightness-110 cursor-pointer shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>Print Financial Report</span>
        </button>
      </div>

      {/* PRINTABLE REPORT SHEET */}
      <div className="bg-white dark:bg-[#111009] text-[#1a1208] dark:text-[#f5f0e8] p-8 rounded-2xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] shadow-md dark:shadow-[0_4px_32px_rgba(0,0,0,0.4)] space-y-6 print:shadow-none print:border-none print:p-0">
        {/* Report Header */}
        <div className="border-b border-black/[0.08] dark:border-[#fff8dc]/[0.06] pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#1a1208] dark:text-[#f5f0e8]">
              Bokra Stay Financial Report
            </h2>
            <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278] mt-1">
              Generated on {new Date().toLocaleDateString("en-US", { dateStyle: "full" })} | Financial Administration
            </p>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Bokra Finance</span>
            <p className="text-[10px] text-[#9b8e7e] dark:text-[#6b6460] uppercase font-bold tracking-wider">
              Treasury Statement
            </p>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#1c1a16] border border-neutral-200 dark:border-[#fff8dc]/[0.06]">
            <p className="text-xs text-neutral-500 dark:text-[#8a8278] font-semibold">Total Revenue</p>
            <p className="text-xl font-bold text-neutral-900 dark:text-[#f5f0e8] mt-1">
              {totals.totalRevenue.toLocaleString()} ETB
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 dark:bg-[#c9a84c]/[0.08] border border-amber-200 dark:border-[#c9a84c]/20">
            <p className="text-xs text-amber-800 dark:text-[#c9a84c] font-semibold">Total 3% Commission</p>
            <p className="text-xl font-bold text-[#b8943d] dark:text-[#c9a84c] mt-1">
              {totals.totalCommission.toLocaleString()} ETB
            </p>
          </div>

          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/[0.15] border border-purple-200 dark:border-purple-500/20">
            <p className="text-xs text-purple-700 dark:text-purple-400 font-semibold">Host Payouts</p>
            <p className="text-xl font-bold text-purple-900 dark:text-purple-300 mt-1">
              {totals.totalHostPayouts.toLocaleString()} ETB
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/[0.15] border border-emerald-200 dark:border-emerald-500/20">
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">Available Wallet</p>
            <p className="text-xl font-bold text-emerald-900 dark:text-emerald-300 mt-1">
              {totals.walletBalance.toLocaleString()} ETB
            </p>
          </div>
        </div>

        {/* REPORT TYPE 1: MONTHLY & COMMISSION */}
        {(reportType === "monthly" || reportType === "commission") && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-[#d4cfc7]">
              {reportType === "monthly" ? "Processed Payments Log" : "Commission Fee Breakdown"}
            </h3>
            <div className="overflow-x-auto rounded-xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06]">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 dark:bg-[#1c1a16] font-bold border-b border-neutral-200 dark:border-[#fff8dc]/[0.06] text-neutral-700 dark:text-[#d4cfc7]">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Gross Amount</th>
                    <th className="p-3">Platform Commission (3%)</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-[#fff8dc]/[0.04]">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-[#fff8dc]/[0.02] transition-colors">
                      <td className="p-3 text-[#6b5e4e] dark:text-[#8a8278]">{p.date}</td>
                      <td className="p-3 font-bold text-[#1a1208] dark:text-[#f5f0e8]">{p.amount.toLocaleString()} ETB</td>
                      <td className="p-3 text-[#b8943d] dark:text-[#c9a84c] font-bold">
                        {p.commission.toLocaleString()} ETB
                      </td>
                      <td className="p-3 font-semibold text-[#1a1208] dark:text-[#d4cfc7]">{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT TYPE 2: WITHDRAWAL AUDIT */}
        {reportType === "withdrawal" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-[#d4cfc7]">
              Host Withdrawal Disbursements
            </h3>
            <div className="overflow-x-auto rounded-xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06]">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 dark:bg-[#1c1a16] font-bold border-b border-neutral-200 dark:border-[#fff8dc]/[0.06] text-neutral-700 dark:text-[#d4cfc7]">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Host Name</th>
                    <th className="p-3">Gross Amount</th>
                    <th className="p-3">Net Sent</th>
                    <th className="p-3">Chapa Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-[#fff8dc]/[0.04]">
                  {hostWithdrawals.map((h) => (
                    <tr key={h.id} className="hover:bg-neutral-50 dark:hover:bg-[#fff8dc]/[0.02] transition-colors">
                      <td className="p-3 text-[#6b5e4e] dark:text-[#8a8278]">{h.date}</td>
                      <td className="p-3 font-semibold text-[#1a1208] dark:text-[#f5f0e8]">{h.hostName}</td>
                      <td className="p-3 text-[#1a1208] dark:text-[#d4cfc7]">{h.amount.toLocaleString()} ETB</td>
                      <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{h.netSent.toLocaleString()} ETB</td>
                      <td className="p-3 font-mono text-[10px] text-[#9b8e7e] dark:text-[#6b6460]">{h.reference}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT TYPE 3: PLATFORM WALLET */}
        {reportType === "wallet" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-[#d4cfc7]">
              Platform Treasury Withdrawals
            </h3>
            <div className="overflow-x-auto rounded-xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06]">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 dark:bg-[#1c1a16] font-bold border-b border-neutral-200 dark:border-[#fff8dc]/[0.06] text-neutral-700 dark:text-[#d4cfc7]">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Amount Withdrawn</th>
                    <th className="p-3">Account Destination</th>
                    <th className="p-3">Chapa Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-[#fff8dc]/[0.04]">
                  {platformWithdrawals.map((pw) => (
                    <tr key={pw.id} className="hover:bg-neutral-50 dark:hover:bg-[#fff8dc]/[0.02] transition-colors">
                      <td className="p-3 text-[#6b5e4e] dark:text-[#8a8278]">{pw.date}</td>
                      <td className="p-3 font-bold text-[#b8943d] dark:text-[#c9a84c]">
                        {pw.amount.toLocaleString()} ETB
                      </td>
                      <td className="p-3 text-[#1a1208] dark:text-[#d4cfc7]">{pw.account}</td>
                      <td className="p-3 font-mono text-[10px] text-[#9b8e7e] dark:text-[#6b6460]">{pw.reference}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report Footer */}
        <div className="pt-6 border-t border-black/[0.08] dark:border-[#fff8dc]/[0.06] flex justify-between text-[11px] text-[#9b8e7e] dark:text-[#6b6460]">
          <p>Confidential — Bokra Stay Finance Administration</p>
          <p>Page 1 of 1</p>
        </div>
      </div>
    </div>
  );
}
