"use client";

import React, { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, DollarSign, Users, Home, Calendar } from "lucide-react";

interface MonthlyRevenueRow {
  month: string;
  transactions: number;
  volume: number;
  commission: number;
}

interface TopPropertyRow {
  title: string;
  city: string;
  revenue: number;
  bookings: number;
}

interface TopHostRow {
  name: string;
  email: string;
  earnings: number;
  bookings: number;
}

interface ActiveUserRow {
  id: string;
  name: string | null;
  email: string;
  count: number;
}

interface CityPropertyRow {
  city: string;
  count: number;
  avgPrice: number;
}

interface ReviewedPropertyRow {
  id: string;
  title: string;
  city: string;
  pricePerNight: number;
  isVerified: boolean;
  status: string;
  reviewsCount: number;
}

interface AnalyticsTablesProps {
  monthlyRevenueRows: MonthlyRevenueRow[];
  topPropertiesTable: TopPropertyRow[];
  topHostsTable: TopHostRow[];
  mostActiveRenters: ActiveUserRow[];
  mostActiveHosts: ActiveUserRow[];
  cityPropertyTable: CityPropertyRow[];
  mostReviewedProperties: ReviewedPropertyRow[];
}

// Reusable Client Table Component with sorting
function ClientTable<T>({
  columns,
  data,
  emptyMessage = "No records found",
}: {
  columns: {
    key: string;
    label: string;
    accessor: (item: T) => React.ReactNode;
    sortValue?: (item: T) => string | number;
  }[];
  data: T[];
  emptyMessage?: string;
}) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("desc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    const col = columns.find((c) => c.key === sortColumn);
    if (!col) return 0;

    const valA = col.sortValue ? col.sortValue(a) : (a as any)[sortColumn];
    const valB = col.sortValue ? col.sortValue(b) : (b as any)[sortColumn];

    if (valA === valB) return 0;
    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;

    if (typeof valA === "number" && typeof valB === "number") {
      return sortDirection === "asc" ? valA - valB : valB - valA;
    }

    return sortDirection === "asc"
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  return (
    <div className="overflow-x-auto rounded-3xl border border-black/[0.08] dark:border-white/[0.06] bg-white dark:bg-[#141310] shadow-xs">
      <table className="w-full text-left text-xs">
        <thead className="bg-[#faf9f7] dark:bg-[#1c1a16] border-b border-black/[0.08] dark:border-white/[0.06] text-[#6b5e4e] dark:text-[#8a8278] uppercase font-bold text-[10px]">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className="px-5 py-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>{col.label}</span>
                  {sortColumn === col.key ? (
                    sortDirection === "asc" ? (
                      <ArrowUp className="size-3.5 text-[#b8943d]" />
                    ) : (
                      <ArrowDown className="size-3.5 text-[#b8943d]" />
                    )
                  ) : (
                    <ArrowUpDown className="size-3.5 opacity-40 hover:opacity-100" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06] text-[#1a1208] dark:text-[#f5f0e8]">
          {sortedData.length > 0 ? (
            sortedData.map((row, idx) => (
              <tr key={idx} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-4">
                    {col.accessor(row)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-5 py-8 text-center text-[#9b8e7e] italic">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function AnalyticsTables({
  monthlyRevenueRows,
  topPropertiesTable,
  topHostsTable,
  mostActiveRenters,
  mostActiveHosts,
  cityPropertyTable,
  mostReviewedProperties,
}: AnalyticsTablesProps) {
  const [activeTab, setActiveTab] = useState<"revenue" | "users" | "properties" | "bookings">("revenue");

  const tabs = [
    { id: "revenue", label: "Tab 1: Revenue Analytics", icon: DollarSign },
    { id: "users", label: "Tab 2: User Analytics", icon: Users },
    { id: "properties", label: "Tab 3: Property Analytics", icon: Home },
    { id: "bookings", label: "Tab 4: Booking Analytics", icon: Calendar },
  ] as const;

  return (
    <div className="space-y-8 font-sans">
      {/* TAB PILLS AT TOP */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white dark:bg-[#141310] border border-black/[0.08] dark:border-white/[0.06] rounded-2xl w-fit shadow-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#b8943d] dark:bg-[#c9a84c] text-white dark:text-[#0c0b09] shadow-xs"
                  : "text-[#6b5e4e] dark:text-[#8a8278] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Icon className="size-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: REVENUE */}
      {activeTab === "revenue" && (
        <div className="space-y-8 animate-fade-in">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#b8943d] dark:text-[#c9a84c] uppercase tracking-widest">
              Monthly Transaction Volume &amp; 3% Commission
            </h3>
            <ClientTable<MonthlyRevenueRow>
              columns={[
                { key: "month", label: "Month", accessor: (r) => r.month },
                { key: "transactions", label: "Transactions", accessor: (r) => r.transactions },
                {
                  key: "volume",
                  label: "Gross Booking Volume",
                  accessor: (r) => `${r.volume.toLocaleString()} ETB`,
                  sortValue: (r) => r.volume,
                },
                {
                  key: "commission",
                  label: "Platform Commission (3%)",
                  accessor: (r) => (
                    <span className="font-extrabold text-[#b8943d] dark:text-[#c9a84c]">
                      +{r.commission.toLocaleString()} ETB
                    </span>
                  ),
                  sortValue: (r) => r.commission,
                },
              ]}
              data={monthlyRevenueRows}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#6b5e4e] dark:text-[#8a8278] uppercase tracking-widest">
                Top Earning Properties
              </h3>
              <ClientTable<TopPropertyRow>
                columns={[
                  { key: "title", label: "Property Title", accessor: (r) => r.title },
                  { key: "city", label: "City", accessor: (r) => r.city },
                  { key: "bookings", label: "Bookings", accessor: (r) => r.bookings },
                  {
                    key: "revenue",
                    label: "Gross Revenue",
                    accessor: (r) => `${r.revenue.toLocaleString()} ETB`,
                    sortValue: (r) => r.revenue,
                  },
                ]}
                data={topPropertiesTable}
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#6b5e4e] dark:text-[#8a8278] uppercase tracking-widest">
                Top Earning Hosts
              </h3>
              <ClientTable<TopHostRow>
                columns={[
                  { key: "name", label: "Host Name", accessor: (r) => r.name },
                  { key: "email", label: "Email", accessor: (r) => r.email },
                  { key: "bookings", label: "Bookings", accessor: (r) => r.bookings },
                  {
                    key: "earnings",
                    label: "Host Net (97%)",
                    accessor: (r) => (
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        {r.earnings.toLocaleString()} ETB
                      </span>
                    ),
                    sortValue: (r) => r.earnings,
                  },
                ]}
                data={topHostsTable}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS */}
      {activeTab === "users" && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#6b5e4e] dark:text-[#8a8278] uppercase tracking-widest">
                Most Active Renters (Booking Volume)
              </h3>
              <ClientTable<ActiveUserRow>
                columns={[
                  { key: "name", label: "Renter Name", accessor: (r) => r.name || "User" },
                  { key: "email", label: "Email", accessor: (r) => r.email },
                  { key: "count", label: "Total Bookings", accessor: (r) => r.count },
                ]}
                data={mostActiveRenters}
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#6b5e4e] dark:text-[#8a8278] uppercase tracking-widest">
                Most Active Hosts (Listings Inventory)
              </h3>
              <ClientTable<ActiveUserRow>
                columns={[
                  { key: "name", label: "Host Name", accessor: (r) => r.name || "Host" },
                  { key: "email", label: "Email", accessor: (r) => r.email },
                  { key: "count", label: "Properties Listed", accessor: (r) => r.count },
                ]}
                data={mostActiveHosts}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PROPERTIES */}
      {activeTab === "properties" && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#6b5e4e] dark:text-[#8a8278] uppercase tracking-widest">
                Properties &amp; Avg Pricing by City
              </h3>
              <ClientTable<CityPropertyRow>
                columns={[
                  { key: "city", label: "City Location", accessor: (r) => r.city },
                  { key: "count", label: "Listed Stays", accessor: (r) => r.count },
                  {
                    key: "avgPrice",
                    label: "Avg Nightly Rate",
                    accessor: (r) => `${r.avgPrice.toLocaleString()} ETB`,
                    sortValue: (r) => r.avgPrice,
                  },
                ]}
                data={cityPropertyTable}
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#6b5e4e] dark:text-[#8a8278] uppercase tracking-widest">
                Most Reviewed Properties
              </h3>
              <ClientTable<ReviewedPropertyRow>
                columns={[
                  { key: "title", label: "Property Title", accessor: (r) => r.title },
                  { key: "city", label: "City", accessor: (r) => r.city },
                  { key: "reviewsCount", label: "Reviews Count", accessor: (r) => r.reviewsCount },
                  {
                    key: "status",
                    label: "Verification Status",
                    accessor: (r) => (
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          r.isVerified
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200"
                            : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200"
                        }`}
                      >
                        {r.isVerified ? "Verified" : "Pending"}
                      </span>
                    ),
                  },
                ]}
                data={mostReviewedProperties}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BOOKINGS */}
      {activeTab === "bookings" && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-white/[0.06] p-8 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-[#1a1208] dark:text-[#f5f0e8]">
              Booking Analytics &amp; Conversion Overview
            </h3>
            <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278]">
              Reservation health and host payout fulfillment tracking across Bokra Stay.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="p-5 rounded-2xl bg-[#faf9f7] dark:bg-[#1c1a16] border border-black/[0.05] dark:border-[#fff8dc]/[0.05] space-y-1">
                <span className="text-xs font-bold text-[#6b5e4e] dark:text-[#8a8278] uppercase">
                  Total Monthly Revenue
                </span>
                <p className="text-2xl font-black text-[#b8943d] dark:text-[#c9a84c]">
                  {monthlyRevenueRows.reduce((acc, r) => acc + r.commission, 0).toLocaleString()} ETB
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#faf9f7] dark:bg-[#1c1a16] border border-black/[0.05] dark:border-[#fff8dc]/[0.05] space-y-1">
                <span className="text-xs font-bold text-[#6b5e4e] dark:text-[#8a8278] uppercase">
                  Top Property Bookings
                </span>
                <p className="text-2xl font-black text-[#1a1208] dark:text-[#f5f0e8]">
                  {topPropertiesTable.reduce((acc, r) => acc + r.bookings, 0)} Total
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#faf9f7] dark:bg-[#1c1a16] border border-black/[0.05] dark:border-[#fff8dc]/[0.05] space-y-1">
                <span className="text-xs font-bold text-[#6b5e4e] dark:text-[#8a8278] uppercase">
                  Cities Represented
                </span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {cityPropertyTable.length} Cities
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
