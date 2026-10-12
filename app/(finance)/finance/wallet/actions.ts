"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function verifyFinanceOrSuperAdmin() {
  const session = await auth();
  if (
    !session ||
    (session.user?.role !== "FINANCE_ADMIN" && session.user?.role !== "SUPER_ADMIN")
  ) {
    throw new Error("Unauthorized: Finance Admin or Super Admin rights required.");
  }
  return session.user;
}

export async function withdrawPlatformFunds(
  amount: number,
  accountType: string,
  accountNumber: string,
  accountName: string,
  note?: string
) {
  const user = await verifyFinanceOrSuperAdmin();

  if (!amount || amount <= 0) {
    return { success: false, error: "Please specify a valid positive withdrawal amount." };
  }
  if (!accountType || !accountNumber || !accountName) {
    return { success: false, error: "All account details (type, number, name) are required." };
  }

  // Calculate current platform wallet balance
  const [paymentsAgg, withdrawalsAgg] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true },
    }),
    prisma.platformWithdrawal.aggregate({
      where: { status: "COMPLETED" },
      _sum: { netAmount: true },
    }),
  ]);

  const totalVolume = Number(paymentsAgg._sum?.amount || 0);
  const totalCommission = totalVolume * 0.03;
  const totalPlatformWithdrawn = Number(withdrawalsAgg._sum?.netAmount || 0);
  const walletBalance = totalCommission - totalPlatformWithdrawn;

  if (amount > walletBalance) {
    return {
      success: false,
      error: `Insufficient wallet balance. Max available: ${walletBalance.toLocaleString()} ETB.`,
    };
  }

  // Generate Mock Chapa Reference
  const mockChapaReference = `CHAPA_PLATFORM_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  // Create PlatformWithdrawal record (0 fee for platform withdrawal)
  const withdrawal = await prisma.platformWithdrawal.create({
    data: {
      amount,
      fee: 0,
      netAmount: amount,
      accountType,
      accountNumber,
      accountName,
      chapaReference: mockChapaReference,
      status: "COMPLETED",
      processedBy: user.name || user.email || "Finance Admin",
      note: note || "Platform commission withdrawal via mock Chapa",
    },
  });

  revalidatePath("/finance/wallet");
  revalidatePath("/finance/dashboard");
  revalidatePath("/superadmin/dashboard");

  return {
    success: true,
    message: "Platform funds withdrawn successfully via mock Chapa transfer!",
    reference: mockChapaReference,
    withdrawal,
  };
}
