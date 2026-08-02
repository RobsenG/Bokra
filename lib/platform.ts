import prisma from "@/lib/prisma";

export const PLATFORM_FEE_PERCENT = 3; // 3% platform service fee

export function calculatePlatformFee(amount: number): number {
  return Math.round(((amount * PLATFORM_FEE_PERCENT) / 100) * 100) / 100;
}

export function calculateNetAmount(amount: number): number {
  return Math.round((amount - calculatePlatformFee(amount)) * 100) / 100;
}

export async function getHostAvailableBalance(hostId: string): Promise<{
  totalEarned: number;
  platformFeesDeducted: number;
  hostEarnings: number;
  totalWithdrawn: number;
  availableBalance: number;
  pendingWithdrawals: number;
}> {
  // 1. Total Earned from SUCCESS payments for this host's properties
  const earningsResult = await prisma.payment.aggregate({
    where: {
      status: "SUCCESS",
      booking: {
        property: { hostId },
      },
    },
    _sum: { amount: true },
  });
  const totalEarned = Number(earningsResult._sum.amount || 0);

  // 2. Platform fees (3%) and host earnings (97%)
  const platformFeesDeducted = calculatePlatformFee(totalEarned);
  const hostEarnings = calculateNetAmount(totalEarned);

  // 3. Total Withdrawn from COMPLETED withdrawal requests (using netAmount)
  const completedWithdrawals = await prisma.withdrawalRequest.aggregate({
    where: {
      hostId,
      status: "COMPLETED",
    },
    _sum: { netAmount: true },
  });
  const totalWithdrawn = Number(completedWithdrawals._sum.netAmount || 0);

  // 4. Pending withdrawals sum
  const pendingWithdrawalsResult = await prisma.withdrawalRequest.aggregate({
    where: {
      hostId,
      status: { in: ["PENDING", "PROCESSING"] },
    },
    _sum: { netAmount: true },
  });
  const pendingWithdrawals = Number(pendingWithdrawalsResult._sum.netAmount || 0);

  // Available Balance = hostEarnings (97%) - totalWithdrawn - pendingWithdrawals
  const availableBalance = Math.max(0, Math.round((hostEarnings - totalWithdrawn - pendingWithdrawals) * 100) / 100);

  return {
    totalEarned,
    platformFeesDeducted,
    hostEarnings,
    totalWithdrawn,
    availableBalance,
    pendingWithdrawals,
  };
}
