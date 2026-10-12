"use client";

import React, { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export interface Column<T> {
  key: string;
  label: string;
  accessor: (item: T) => string | number | React.ReactNode;
  sortValue?: (item: T) => string | number;
}

interface SortableTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export default function SortableTable<T>({
  columns,
  data,
  emptyMessage = "No data available",
}: SortableTableProps<T>) {
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
    <div className="overflow-x-auto rounded-xl border border-black/[0.08] dark:border-white/[0.06] bg-white dark:bg-[#141310]">
      <table className="w-full text-left text-xs">
        <thead className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/[0.08] dark:border-white/[0.06] text-[#6b5e4e] dark:text-[#8a8278] uppercase font-bold">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className="px-4 py-3.5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>{col.label}</span>
                  {sortColumn === col.key ? (
                    sortDirection === "asc" ? (
                      <ArrowUp className="w-3.5 h-3.5 text-[#b8943d]" />
                    ) : (
                      <ArrowDown className="w-3.5 h-3.5 text-[#b8943d]" />
                    )
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06] text-[#1a1208] dark:text-[#f5f0e8]">
          {sortedData.length > 0 ? (
            sortedData.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3.5">
                    {col.accessor(row)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-[#9b8e7e] dark:text-[#6b6257]"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
