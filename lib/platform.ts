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
  let totalEarned = 0;
  try {
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
    totalEarned = Number(earningsResult._sum.amount || 0);

    // 2. Also check confirmed/completed bookings without payment records
    const fallbackBookings = await prisma.booking.aggregate({
      where: {
        status: { in: ["CONFIRMED", "COMPLETED"] },
        payment: null,
        property: { hostId },
      },
      _sum: { totalPrice: true },
    });
    totalEarned += Number(fallbackBookings._sum.totalPrice || 0);
  } catch (err) {
    console.error("[Platform Balance Error] Failed to aggregate earnings:", err);
  }

  // 3. Platform fees (3%) and host earnings (97%)
  const platformFeesDeducted = calculatePlatformFee(totalEarned);
  const hostEarnings = calculateNetAmount(totalEarned);

  // 4. Total Withdrawn from COMPLETED withdrawal requests
  let totalWithdrawn = 0;
  try {
    const completedWithdrawals = await prisma.withdrawalRequest.aggregate({
      where: {
        hostId,
        status: "COMPLETED",
      },
      _sum: { netAmount: true },
    });
    totalWithdrawn = Number(completedWithdrawals._sum.netAmount || 0);
  } catch (err) {
    console.error("[Platform Balance Error] Failed to aggregate withdrawals:", err);
  }

  // 5. Pending withdrawals sum
  let pendingWithdrawals = 0;
  try {
    const pendingWithdrawalsResult = await prisma.withdrawalRequest.aggregate({
      where: {
        hostId,
        status: { in: ["PENDING", "PROCESSING"] },
      },
      _sum: { netAmount: true },
    });
    pendingWithdrawals = Number(pendingWithdrawalsResult._sum.netAmount || 0);
  } catch (err) {
    console.error("[Platform Balance Error] Failed to aggregate pending withdrawals:", err);
  }

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
