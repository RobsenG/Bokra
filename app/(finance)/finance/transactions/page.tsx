import React from "react";
import prisma from "@/lib/prisma";
import {
  ArrowLeftRight,
  CreditCard,
  Award,
  TrendingUp,
} from "lucide-react";
import TransactionsClient from "@/components/finance/TransactionsClient";

export const revalidate = 0;

export default async function TransactionsPage() {
  const paymentsRaw = await prisma.payment
    .findMany({
      orderBy: { createdAt: "desc" },
      include: {
        booking: {
          include: {
            renter: { select: { name: true, email: true } },
            property: {
              include: {
                host: { select: { name: true, email: true } },
              },
            },
          },
        },
      },
    })
    .catch(() => []);

  const transactions = paymentsRaw.map((p) => {
    const amt = Number(p.amount || 0);
    const comm = amt * 0.03;
    const hostEarn = amt * 0.97;

    return {
      id: p.id,
      bookingId: p.bookingId,
      date: new Date(p.createdAt).toLocaleString(),
      createdAt: p.createdAt.toISOString(),
      renterName: p.booking?.renter?.name || "Renter",
      renterEmail: p.booking?.renter?.email || "",
      propertyTitle: p.booking?.property?.title || "Property",
      propertyCity: p.booking?.property?.city || "",
      hostName: p.booking?.property?.host?.name || "Host",
      amount: amt,
      commission: comm,
      hostEarnings: hostEarn,
      paymentMethod: "Chapa Gateway",
      status: p.status,
      chapaReference: p.chapaReference || "MOCK_CHAPA_REF",
    };
  });

  const totalRevenue = transactions.reduce((s, t) => s + t.amount, 0);
  const totalCommission = transactions.reduce((s, t) => s + t.commission, 0);
  const successCount = transactions.filter((t) => t.status === "SUCCESS").length;

  return (
    <div className="space-y-8 font-[Manrope,sans-serif] pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#1a1208] dark:text-[#f5f0e8] tracking-tight">
          Platform Transactions Audit
        </h1>
        <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278] mt-1">
          Complete transparent log of all booking payments, 3% platform commission splits, and 97% host earnings.
        </p>
      </div>

      {/* Hero Banner Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-white/[0.06] p-6 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 shrink-0">
            <CreditCard className="size-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9b8e7e] dark:text-[#8a8278]">
              Total Volume
            </p>
            <p className="text-2xl font-black text-[#1a1208] dark:text-[#f5f0e8]">
              {totalRevenue.toLocaleString()} ETB
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-white/[0.06] p-6 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] shrink-0">
            <Award className="size-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9b8e7e] dark:text-[#8a8278]">
              Commission (3%)
            </p>
            <p className="text-2xl font-black text-[#b8943d] dark:text-[#c9a84c]">
              {totalCommission.toFixed(0)} ETB
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-white/[0.06] p-6 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 shrink-0">
            <TrendingUp className="size-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9b8e7e] dark:text-[#8a8278]">
              Successful Payments
            </p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {successCount}
            </p>
          </div>
        </div>
      </div>

      {/* Transactions Table (client component for filtering/search) */}
      <div className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] shadow-xs p-6">
        <div className="flex items-center gap-2.5 border-b border-black/[0.06] dark:border-[#fff8dc]/[0.05] pb-4 mb-5">
          <ArrowLeftRight className="size-5 text-[#b8943d] dark:text-[#c9a84c]" />
          <h2 className="font-extrabold text-[#1a1208] dark:text-[#f5f0e8] text-base">
            All Transactions
          </h2>
        </div>
        <TransactionsClient transactions={transactions} />
      </div>
    </div>
  );
}
