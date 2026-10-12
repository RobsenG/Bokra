"use client";

import React, { useState } from "react";
import { Printer, FileText, BarChart2, Users, DollarSign } from "lucide-react";

interface UserReportRow {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  status: string;
}

interface PropertyReportRow {
  id: string;
  title: string;
  city: string;
  hostName: string;
  status: string;
  pricePerNight: number;
  bookingsCount: number;
}

interface FinancialReportRow {
  id: string;
  type: string;
  amount: number;
  commissionOrFee: number;
  status: string;
  date: string;
}

interface ReportsClientProps {
  usersData: UserReportRow[];
  propertiesData: PropertyReportRow[];
  financialData: FinancialReportRow[];
  summaryStats: {
    totalRevenue: number;
    totalCommission: number;
    newUsers: number;
    newBookings: number;
  };
}

export default function ReportsClient({
  usersData,
  propertiesData,
  financialData,
  summaryStats,
}: ReportsClientProps) {
  const [activeTab, setActiveTab] = useState<"monthly" | "users" | "properties" | "financial">("monthly");

  // Filters
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-10");

  const handlePrint = () => {
    window.print();
  };

  // Filtered Data
  const filteredUsers = usersData.filter((u) => {
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
    return true;
  });

  const filteredProperties = propertiesData.filter((p) => {
    if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
    return true;
  });

  const tabs = [
    { key: "monthly", label: "Monthly Summary", icon: BarChart2 },
    { key: "users", label: "User Directory", icon: Users },
    { key: "properties", label: "Property Inventory", icon: FileText },
    { key: "financial", label: "Financial Audit", icon: DollarSign },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Report Type Selector Tabs - Hidden on Print */}
      <div className="no-print flex items-center justify-between border-b border-black/[0.08] dark:border-[#fff8dc]/[0.06] pb-4 overflow-x-auto gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === key
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
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a1208] dark:bg-[#f5f0e8] text-white dark:text-[#080806] font-semibold text-xs shadow-md hover:brightness-110 transition-all cursor-pointer shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>Print Report</span>
        </button>
      </div>

      {/* REPORT PREVIEW CONTAINER */}
      <div className="bg-white dark:bg-[#111009] text-[#1a1208] dark:text-[#f5f0e8] p-8 rounded-2xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] shadow-md dark:shadow-[0_4px_32px_rgba(0,0,0,0.4)] space-y-6 print:shadow-none print:border-none print:p-0">
        {/* Printable Header */}
        <div className="border-b border-black/[0.08] dark:border-[#fff8dc]/[0.06] pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#1a1208] dark:text-[#f5f0e8]">
              Bokra Stay Executive Platform Report
            </h2>
            <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278] mt-1">
              Generated on {new Date().toLocaleDateString("en-US", { dateStyle: "full" })} | Official Document
            </p>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-[#b8943d] dark:text-[#c9a84c]">Bokra Stay</span>
            <p className="text-[10px] text-[#9b8e7e] dark:text-[#6b6460] uppercase font-bold tracking-wider">
              Super Admin System
            </p>
          </div>
        </div>

        {/* TAB 1: MONTHLY SUMMARY REPORT */}
        {activeTab === "monthly" && (
          <div className="space-y-6">
            <div className="no-print flex items-center gap-3">
              <label className="text-xs font-semibold text-[#1a1208] dark:text-[#d4cfc7]">
                Select Report Month:
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-black/[0.08] dark:border-[#fff8dc]/[0.07] bg-white dark:bg-[#1c1a16] text-[#1a1208] dark:text-[#d4cfc7] text-xs outline-none focus:border-[#b8943d] dark:focus:border-[#c9a84c]/40"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#1c1a16] border border-neutral-200 dark:border-[#fff8dc]/[0.06]">
                <p className="text-xs text-neutral-500 dark:text-[#8a8278] font-semibold">Gross Revenue</p>
                <p className="text-xl font-bold text-neutral-900 dark:text-[#f5f0e8] mt-1">
                  {summaryStats.totalRevenue.toLocaleString()} ETB
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 dark:bg-[#c9a84c]/[0.08] border border-amber-200 dark:border-[#c9a84c]/20">
                <p className="text-xs text-amber-800 dark:text-[#c9a84c] font-semibold">Platform Commission (3%)</p>
                <p className="text-xl font-bold text-[#b8943d] dark:text-[#c9a84c] mt-1">
                  {summaryStats.totalCommission.toLocaleString()} ETB
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/[0.15] border border-blue-200 dark:border-blue-500/20">
                <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold">New Registrations</p>
                <p className="text-xl font-bold text-blue-900 dark:text-blue-300 mt-1">
                  {summaryStats.newUsers}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/[0.15] border border-emerald-200 dark:border-emerald-500/20">
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">New Bookings</p>
                <p className="text-xl font-bold text-emerald-900 dark:text-emerald-300 mt-1">
                  {summaryStats.newBookings}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold mb-2 text-[#1a1208] dark:text-[#f5f0e8]">Executive Summary Note</h3>
              <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278] leading-relaxed">
                This monthly summary reflects all recorded transactions, user onboarding activities, and net commission revenue earned by Bokra Stay during the selected period. All financial values are rounded to standard ETB currency denominations.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: USER DIRECTORY REPORT */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="no-print flex items-center gap-3">
              <label className="text-xs font-semibold text-[#1a1208] dark:text-[#d4cfc7]">Filter by Role:</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-black/[0.08] dark:border-[#fff8dc]/[0.07] bg-white dark:bg-[#1c1a16] text-[#1a1208] dark:text-[#d4cfc7] text-xs outline-none focus:border-[#b8943d] dark:focus:border-[#c9a84c]/40"
              >
                <option value="ALL">All Roles</option>
                <option value="RENTER">Renter</option>
                <option value="HOST">Host</option>
                <option value="ADMIN">Verification Admin</option>
                <option value="FINANCE_ADMIN">Finance Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>

            <div className="overflow-x-auto rounded-xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06]">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 dark:bg-[#1c1a16] font-bold border-b border-neutral-200 dark:border-[#fff8dc]/[0.06] text-neutral-700 dark:text-[#d4cfc7]">
                  <tr>
                    <th className="p-3">User Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Join Date</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-[#fff8dc]/[0.04]">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-[#fff8dc]/[0.02] transition-colors">
                      <td className="p-3 font-semibold text-[#1a1208] dark:text-[#f5f0e8]">{u.name}</td>
                      <td className="p-3 text-[#6b5e4e] dark:text-[#8a8278]">{u.email}</td>
                      <td className="p-3 font-bold text-[#b8943d] dark:text-[#c9a84c]">{u.role}</td>
                      <td className="p-3 text-[#6b5e4e] dark:text-[#8a8278]">{u.createdAt}</td>
                      <td className="p-3 text-[#1a1208] dark:text-[#d4cfc7]">{u.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PROPERTY INVENTORY REPORT */}
        {activeTab === "properties" && (
          <div className="space-y-4">
            <div className="no-print flex items-center gap-3">
              <label className="text-xs font-semibold text-[#1a1208] dark:text-[#d4cfc7]">Filter by Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-black/[0.08] dark:border-[#fff8dc]/[0.07] bg-white dark:bg-[#1c1a16] text-[#1a1208] dark:text-[#d4cfc7] text-xs outline-none focus:border-[#b8943d] dark:focus:border-[#c9a84c]/40"
              >
                <option value="ALL">All Statuses</option>
                <option value="APPROVED">Approved / Verified</option>
                <option value="PENDING">Pending Review</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="overflow-x-auto rounded-xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06]">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 dark:bg-[#1c1a16] font-bold border-b border-neutral-200 dark:border-[#fff8dc]/[0.06] text-neutral-700 dark:text-[#d4cfc7]">
                  <tr>
                    <th className="p-3">Title</th>
                    <th className="p-3">City</th>
                    <th className="p-3">Host</th>
                    <th className="p-3">Price / Night</th>
                    <th className="p-3">Bookings</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-[#fff8dc]/[0.04]">
                  {filteredProperties.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-[#fff8dc]/[0.02] transition-colors">
                      <td className="p-3 font-semibold text-[#1a1208] dark:text-[#f5f0e8]">{p.title}</td>
                      <td className="p-3 text-[#1a1208] dark:text-[#d4cfc7]">{p.city}</td>
                      <td className="p-3 text-[#6b5e4e] dark:text-[#8a8278]">{p.hostName}</td>
                      <td className="p-3 font-bold text-[#1a1208] dark:text-[#f5f0e8]">{p.pricePerNight.toLocaleString()} ETB</td>
                      <td className="p-3 text-[#1a1208] dark:text-[#d4cfc7]">{p.bookingsCount}</td>
                      <td className="p-3 font-bold text-[#b8943d] dark:text-[#c9a84c]">{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: FINANCIAL AUDIT REPORT */}
        {activeTab === "financial" && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06]">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 dark:bg-[#1c1a16] font-bold border-b border-neutral-200 dark:border-[#fff8dc]/[0.06] text-neutral-700 dark:text-[#d4cfc7]">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Transaction Type</th>
                    <th className="p-3">Gross Amount</th>
                    <th className="p-3">Platform Commission</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-[#fff8dc]/[0.04]">
                  {financialData.map((f) => (
                    <tr key={f.id} className="hover:bg-neutral-50 dark:hover:bg-[#fff8dc]/[0.02] transition-colors">
                      <td className="p-3 text-[#6b5e4e] dark:text-[#8a8278]">{f.date}</td>
                      <td className="p-3 font-semibold text-[#1a1208] dark:text-[#f5f0e8]">{f.type}</td>
                      <td className="p-3 font-bold text-[#1a1208] dark:text-[#f5f0e8]">{f.amount.toLocaleString()} ETB</td>
                      <td className="p-3 text-[#b8943d] dark:text-[#c9a84c] font-bold">
                        {f.commissionOrFee.toLocaleString()} ETB
                      </td>
                      <td className="p-3 font-semibold text-[#1a1208] dark:text-[#d4cfc7]">{f.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Printable Footer */}
        <div className="pt-6 border-t border-black/[0.08] dark:border-[#fff8dc]/[0.06] flex justify-between text-[11px] text-[#9b8e7e] dark:text-[#6b6460]">
          <p>Confidential — Bokra Stay Internal Executive Report</p>
          <p>Page 1 of 1</p>
        </div>
      </div>
    </div>
  );
}
