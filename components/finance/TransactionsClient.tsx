"use client";

import React, { useState } from "react";
import { Search, Printer, Calendar, Filter } from "lucide-react";

interface TransactionRow {
  id: string;
  bookingId: string;
  date: string;
  createdAt: string;
  renterName: string;
  renterEmail: string;
  propertyTitle: string;
  propertyCity: string;
  hostName: string;
  amount: number;
  commission: number;
  hostEarnings: number;
  paymentMethod: string;
  status: string;
  chapaReference: string;
}

interface Props {
  transactions: TransactionRow[];
}

export default function TransactionsClient({ transactions }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filtered = transactions.filter((t) => {
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchRenter = t.renterName.toLowerCase().includes(q) || t.renterEmail.toLowerCase().includes(q);
      const matchProperty = t.propertyTitle.toLowerCase().includes(q) || t.propertyCity.toLowerCase().includes(q);
      if (!matchRenter && !matchProperty) return false;
    }

    if (startDate) {
      const d = new Date(t.createdAt).getTime();
      const s = new Date(startDate).getTime();
      if (d < s) return false;
    }

    if (endDate) {
      const d = new Date(t.createdAt).getTime();
      const e = new Date(endDate).getTime();
      if (d > e + 86400000) return false;
    }

    return true;
  });

  const totalAmount = filtered.reduce((acc, item) => acc + item.amount, 0);
  const totalCommission = filtered.reduce((acc, item) => acc + item.commission, 0);
  const totalHostEarnings = filtered.reduce((acc, item) => acc + item.hostEarnings, 0);

  return (
    <div className="space-y-6">
      {/* FILTER BAR AT TOP */}
      <div className="no-print bg-white dark:bg-[#141310] p-4 rounded-2xl border border-black/[0.08] dark:border-white/[0.06] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 flex flex-wrap items-center gap-3 text-xs">
          {/* Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#9b8e7e]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search renter or property..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-[#0a0908] text-[#1a1208] dark:text-[#f5f0e8] focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[#6b5e4e] dark:text-[#8a8278]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-[#0a0908] text-[#1a1208] dark:text-[#f5f0e8]"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {/* Date Pickers */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[#6b5e4e] dark:text-[#8a8278]">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-[#0a0908] text-[#1a1208] dark:text-[#f5f0e8]"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[#6b5e4e] dark:text-[#8a8278]">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-[#0a0908] text-[#1a1208] dark:text-[#f5f0e8]"
            />
          </div>
        </div>

        {/* Print / Export Button */}
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1208] dark:bg-[#f5f0e8] text-white dark:text-[#09090f] font-semibold text-xs shadow hover:brightness-110 cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Export / Print</span>
        </button>
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="overflow-x-auto rounded-2xl border border-black/[0.08] dark:border-white/[0.06] bg-white dark:bg-[#141310] shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/[0.08] dark:border-white/[0.06] text-[#6b5e4e] dark:text-[#8a8278] uppercase font-bold">
            <tr>
              <th className="px-4 py-3.5">Date & Time</th>
              <th className="px-4 py-3.5">Booking ID</th>
              <th className="px-4 py-3.5">Renter</th>
              <th className="px-4 py-3.5">Property & City</th>
              <th className="px-4 py-3.5">Host Name</th>
              <th className="px-4 py-3.5">Booking Amount</th>
              <th className="px-4 py-3.5">Commission (3%)</th>
              <th className="px-4 py-3.5">Host Earnings (97%)</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Chapa Ref</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06] text-[#1a1208] dark:text-[#f5f0e8]">
            {filtered.length > 0 ? (
              filtered.map((t) => (
                <tr key={t.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                  <td className="px-4 py-3.5 text-[#6b5e4e] dark:text-[#8a8278]">
                    {t.date}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px] font-bold text-[#b8943d]">
                    {t.bookingId.substring(0, 8)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-semibold block">{t.renterName}</span>
                    <span className="text-[10px] text-[#9b8e7e]">{t.renterEmail}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-semibold block">{t.propertyTitle}</span>
                    <span className="text-[10px] text-[#9b8e7e]">{t.propertyCity}</span>
                  </td>
                  <td className="px-4 py-3.5 text-[#6b5e4e] dark:text-[#8a8278]">
                    {t.hostName}
                  </td>
                  <td className="px-4 py-3.5 font-bold">
                    {t.amount.toLocaleString()} ETB
                  </td>
                  <td className="px-4 py-3.5 font-bold text-[#b8943d]">
                    {t.commission.toLocaleString()} ETB
                  </td>
                  <td className="px-4 py-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                    {t.hostEarnings.toLocaleString()} ETB
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === "SUCCESS"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : t.status === "PENDING"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[10px] text-[#9b8e7e]">
                    {t.chapaReference}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-[#9b8e7e]">
                  No matching transaction records found.
                </td>
              </tr>
            )}
          </tbody>

          {/* SUMMARY ROW AT BOTTOM */}
          {filtered.length > 0 && (
            <tfoot className="bg-black/[0.03] dark:bg-white/[0.03] font-bold border-t-2 border-black/[0.1] dark:border-white/[0.1] text-xs">
              <tr>
                <td colSpan={5} className="px-4 py-3.5 text-right uppercase">
                  Summary Total:
                </td>
                <td className="px-4 py-3.5 text-black dark:text-white">
                  {totalAmount.toLocaleString()} ETB
                </td>
                <td className="px-4 py-3.5 text-[#b8943d]">
                  {totalCommission.toLocaleString()} ETB
                </td>
                <td className="px-4 py-3.5 text-emerald-600 dark:text-emerald-400">
                  {totalHostEarnings.toLocaleString()} ETB
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
