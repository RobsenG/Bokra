import React from "react";
import prisma from "@/lib/prisma";
import {
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
} from "lucide-react";
import WithdrawalsClient from "@/components/finance/WithdrawalsClient";

export const revalidate = 0;

function maskAccountNumber(acc: string) {
  if (!acc || acc.length <= 4) return acc || "****";
  const visible = acc.slice(-4);
  return "*".repeat(acc.length - 4) + visible;
}

export default async function HostWithdrawalsPage() {
  const requestsRaw = await prisma.withdrawalRequest
    .findMany({
      orderBy: { createdAt: "desc" },
      include: { host: { select: { name: true, email: true } } },
    })
    .catch(() => []);

  const withdrawals = requestsRaw.map((w) => ({
    id: w.id,
    date: new Date(w.createdAt).toLocaleDateString(),
    hostName: w.host?.name || "Host",
    hostEmail: w.host?.email || "",
    amount: Number(w.amount || 0),
    platformFee: Number(w.platformFee || 0),
    netAmount: Number(w.netAmount || 0),
    accountType: w.accountType,
    accountNumberMasked: maskAccountNumber(w.accountNumber),
    reference: w.chapaReference || "MOCK_REF",
    status: w.status,
  }));

  const pending = withdrawals.filter((w) => w.status === "PENDING").length;
  const completed = withdrawals.filter((w) => w.status === "COMPLETED").length;
  const failed = withdrawals.filter((w) => w.status === "FAILED").length;
  const totalPaid = withdrawals
    .filter((w) => w.status === "COMPLETED")
    .reduce((s, w) => s + w.netAmount, 0);

  return (
    <div className="space-y-8 font-[Manrope,sans-serif] pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#1a1208] dark:text-[#f5f0e8] tracking-tight">
          Host Withdrawals Audit
        </h1>
        <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278] mt-1">
          Complete transparent registry of automated host payout disbursements and fee deductions.
        </p>
      </div>

      {/* Pending banner */}
      {pending > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-3xl p-5 flex items-center gap-4 shadow-xs">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-500 shrink-0">
            <Clock className="size-5 animate-pulse" />
          </div>
          <div>
            <p className="font-extrabold text-amber-900 dark:text-[#fcd34d]">
              {pending} host withdrawal{pending === 1 ? "" : "s"} pending your review
            </p>
            <p className="text-xs text-amber-800/70 dark:text-[#fcd34d]/70 mt-0.5">
              Process these requests to release funds to verified hosts.
            </p>
          </div>
        </div>
      )}

      {/* Hero stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Paid Out",
            value: `${totalPaid.toLocaleString()} ETB`,
            icon: ArrowUpRight,
            colorBg: "bg-emerald-500/10",
            colorText: "text-emerald-500",
            valueColor: "text-emerald-600 dark:text-emerald-400",
          },
          {
            label: "Pending",
            value: String(pending),
            icon: Clock,
            colorBg: "bg-amber-500/10",
            colorText: "text-amber-500",
            valueColor: "text-amber-600 dark:text-amber-400",
          },
          {
            label: "Completed",
            value: String(completed),
            icon: CheckCircle2,
            colorBg: "bg-blue-500/10",
            colorText: "text-blue-500",
            valueColor: "text-blue-600 dark:text-blue-400",
          },
          {
            label: "Failed",
            value: String(failed),
            icon: XCircle,
            colorBg: "bg-red-500/10",
            colorText: "text-red-500",
            valueColor: "text-red-600 dark:text-red-400",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-white/[0.06] p-5 shadow-xs flex items-center gap-3"
            >
              <div className={`p-2.5 rounded-2xl shrink-0 ${s.colorBg} ${s.colorText}`}>
                <Icon className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#9b8e7e] dark:text-[#8a8278]">
                  {s.label}
                </p>
                <p className={`text-xl font-black ${s.valueColor}`}>{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] shadow-xs p-6">
        <div className="flex items-center gap-2.5 border-b border-black/[0.06] dark:border-[#fff8dc]/[0.05] pb-4 mb-5">
          <Wallet className="size-5 text-[#b8943d] dark:text-[#c9a84c]" />
          <h2 className="font-extrabold text-[#1a1208] dark:text-[#f5f0e8] text-base">
            All Withdrawal Requests
          </h2>
        </div>
        <WithdrawalsClient withdrawals={withdrawals} />
      </div>
    </div>
  );
}
