"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  getHostAvailableBalance,
  calculatePlatformFee,
  calculateNetAmount,
} from "@/lib/platform";

export async function getRevenueStats(hostId?: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const targetHostId = hostId || session.user.id;
  return getHostAvailableBalance(targetHostId);
}

export async function requestWithdrawal(
  amount: number,
  accountType: string,
  accountNumber: string,
  accountName: string,
  note?: string
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "HOST") {
    return { error: "Unauthorized. Host access required." };
  }

  const hostId = session.user.id;

  if (!amount || amount <= 0) {
    return { error: "Please enter a valid withdrawal amount." };
  }

  if (amount < 100) {
    return { error: "Minimum withdrawal amount is 100 ETB." };
  }

  if (!accountType || !accountNumber || !accountName) {
    return { error: "Please fill in all required account details." };
  }

  // Calculate available balance
  const balance = await getHostAvailableBalance(hostId);
  if (amount > balance.availableBalance) {
    return {
      error: `Insufficient balance. Your available balance is ${balance.availableBalance.toLocaleString()} ETB.`,
    };
  }

  // Calculate fees (3% platform fee, 97% net amount transferred)
  const platformFee = calculatePlatformFee(amount);
  const netAmount = calculateNetAmount(amount);

  const chapaReference = `BOKRA-WD-${Date.now()}`;

  // Mock Chapa Transfer API processing log
  console.log(`[Mock Chapa Transfer] Sending ${netAmount} ETB to ${accountName} (${accountType}: ${accountNumber}) with ref ${chapaReference}`);

  // Create auto-approved COMPLETED WithdrawalRequest
  const withdrawal = await prisma.withdrawalRequest.create({
    data: {
      hostId,
      amount,
      platformFee,
      netAmount,
      accountType,
      accountNumber,
      accountName,
      note: note || null,
      status: "COMPLETED",
      chapaReference,
      processedAt: new Date(),
    },
  });

  revalidatePath("/host/revenue");
  revalidatePath("/host/dashboard");

  return {
    success: true,
    message: "Withdrawal processed successfully!",
    netAmount,
    platformFee,
    chapaReference,
    withdrawalId: withdrawal.id,
  };
}
