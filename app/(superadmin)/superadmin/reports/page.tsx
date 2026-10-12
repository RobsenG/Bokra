import React from "react";
import prisma from "@/lib/prisma";
import ReportsClient from "@/components/superadmin/ReportsClient";

export const revalidate = 0;

export default async function SuperAdminReportsPage() {
  const [usersRaw, propertiesRaw, paymentsRaw, withdrawalsRaw] = await Promise.all([
    prisma.user
      .findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      })
      .catch(() => []),
    prisma.property
      .findMany({
        include: { host: { select: { name: true } }, _count: { select: { bookings: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
      .catch(() => []),
    prisma.payment
      .findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      })
      .catch(() => []),
    prisma.platformWithdrawal
      .findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      })
      .catch(() => []),
  ]);

  const usersData = usersRaw.map((u) => ({
    id: u.id,
    name: u.name || "User",
    email: u.email,
    role: u.role,
    createdAt: new Date(u.createdAt).toLocaleDateString(),
    status: u.isVerified ? "Active" : "Pending / Suspended",
  }));

  const propertiesData = propertiesRaw.map((p) => ({
    id: p.id,
    title: p.title,
    city: p.city,
    hostName: p.host.name || "Host",
    status: p.isVerified ? "Approved" : p.status,
    pricePerNight: Number(p.pricePerNight || 0),
    bookingsCount: p._count.bookings,
  }));

  const financialData = paymentsRaw.map((pay) => ({
    id: pay.id,
    type: "Booking Payment",
    amount: Number(pay.amount || 0),
    commissionOrFee: Number(pay.amount || 0) * 0.03,
    status: pay.status,
    date: new Date(pay.createdAt).toLocaleDateString(),
  }));

  const totalVol = paymentsRaw
    .filter((p) => p.status === "SUCCESS")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const summaryStats = {
    totalRevenue: totalVol,
    totalCommission: totalVol * 0.03,
    newUsers: usersRaw.length,
    newBookings: paymentsRaw.length,
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-[#1a1208] dark:text-[#f5f0e8] tracking-tight">
          Executive Reports Center
        </h1>
        <p className="text-sm text-[#6b5e4e] dark:text-[#8a8278] mt-1">
          Generate, preview, and print monthly summaries, user audits, inventory records, and financial statements.
        </p>
      </div>

      <ReportsClient
        usersData={usersData}
        propertiesData={propertiesData}
        financialData={financialData}
        summaryStats={summaryStats}
      />
    </div>
  );
}
