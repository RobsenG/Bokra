"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getRevenueStats(hostId?: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const targetHostId = hostId || session.user.id;

  // 1. Total Earned from SUCCESS payments for this host's properties
  const earningsResult = await prisma.payment.aggregate({
    where: {
      status: "SUCCESS",
      booking: {
        property: { hostId: targetHostId },
      },
    },
    _sum: { amount: true },
  });
  const totalEarned = Number(earningsResult._sum.amount || 0);

  // 2. Total Withdrawn from COMPLETED withdrawal requests
  const completedWithdrawals = await prisma.withdrawalRequest.aggregate({
    where: {
      hostId: targetHostId,
      status: "COMPLETED",
    },
    _sum: { amount: true },
  });
  const totalWithdrawn = Number(completedWithdrawals._sum.amount || 0);

  // 3. Pending / Processing withdrawals
  const pendingWithdrawalsResult = await prisma.withdrawalRequest.aggregate({
    where: {
      hostId: targetHostId,
      status: { in: ["PENDING", "PROCESSING"] },
    },
    _sum: { amount: true },
  });
  const pendingWithdrawals = Number(pendingWithdrawalsResult._sum.amount || 0);

  // Available Balance = Total Earned - Completed Withdrawn - Pending/Processing Withdrawn
  const availableBalance = Math.max(0, totalEarned - totalWithdrawn - pendingWithdrawals);

  return {
    totalEarned,
    totalWithdrawn,
    pendingWithdrawals,
    availableBalance,
  };
}

export async function requestWithdrawal(formData: {
  amount: number;
  accountType: string;
  accountNumber: string;
  accountName: string;
  note?: string;
}) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const hostId = session.user.id;
  const { amount, accountType, accountNumber, accountName, note } = formData;

  if (!amount || amount < 100) {
    throw new Error("Minimum withdrawal amount is 100 ETB.");
  }

  if (!accountType || !accountNumber || !accountName) {
    throw new Error("Please fill in all required account details.");
  }

  // Check available balance
  const stats = await getRevenueStats(hostId);
  if (amount > stats.availableBalance) {
    throw new Error(`Insufficient available balance. You can withdraw up to ${stats.availableBalance.toLocaleString()} ETB.`);
  }

  const chapaRef = `transfer-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Create withdrawal request in database
  const withdrawal = await prisma.withdrawalRequest.create({
    data: {
      hostId,
      amount,
      accountType,
      accountNumber,
      accountName,
      note: note || null,
      status: "PENDING",
      chapaReference: chapaRef,
    },
  });

  // Mock Chapa Transfer API processing: simulate async processing transition
  // In demo sandbox, mark as PROCESSING after creation
  await prisma.withdrawalRequest.update({
    where: { id: withdrawal.id },
    data: {
      status: "PROCESSING",
    },
  });

  revalidatePath("/host/revenue");
  revalidatePath("/host/dashboard");

  return {
    success: true,
    withdrawalId: withdrawal.id,
    message: "Withdrawal request submitted! Funds will be transferred within 24 hours.",
  };
}
