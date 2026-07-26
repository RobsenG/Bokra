import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getRevenueStats } from "./actions";
import RevenueClient from "./RevenueClient";
import { redirect } from "next/navigation";

export default async function HostRevenuePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const hostId = session.user.id;

  // 1. Get stats
  const stats = await getRevenueStats(hostId);

  // 2. Fetch deposit history (SUCCESS payments for host's properties)
  const rawDeposits = await prisma.payment.findMany({
    where: {
      status: "SUCCESS",
      booking: {
        property: { hostId },
      },
    },
    include: {
      booking: {
        include: {
          renter: { select: { name: true, email: true } },
          property: { select: { title: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const deposits = rawDeposits.map((d) => {
    const checkIn = new Date(d.booking.checkIn);
    const checkOut = new Date(d.booking.checkOut);
    const nights = Math.max(
      1,
      Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    );

    return {
      id: d.id,
      createdAt: d.createdAt,
      amount: Number(d.amount),
      chapaReference: d.chapaReference,
      status: d.status,
      renterName: d.booking.renter.name || "Guest",
      renterEmail: d.booking.renter.email,
      propertyTitle: d.booking.property.title,
      nights,
    };
  });

  // 3. Fetch withdrawal requests history
  const rawWithdrawals = await prisma.withdrawalRequest.findMany({
    where: { hostId },
    orderBy: { createdAt: "desc" },
  });

  const withdrawals = rawWithdrawals.map((w) => ({
    id: w.id,
    createdAt: w.createdAt,
    amount: Number(w.amount),
    accountType: w.accountType,
    accountNumber: w.accountNumber,
    accountName: w.accountName,
    status: w.status,
    note: w.note,
    chapaReference: w.chapaReference,
  }));

  return (
    <RevenueClient
      stats={stats}
      deposits={deposits}
      withdrawals={withdrawals}
    />
  );
}
