import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import HostProfileClient from "./HostProfileClient";

export default async function HostProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const hostId = session.user.id;
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let user = null;
  let totalProperties = 0;
  let approvedProperties = 0;
  let totalBookings = 0;
  let avgRating = 0;
  let documentsCount = 0;
  let monthlyBookings = 0;
  let totalEarnings = 0;

  try {
    const results = await Promise.all([
      prisma.user.findUnique({
        where: { id: hostId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          role: true,
          isVerified: true,
          selfieUrl: true,
          selfieVerifiedAt: true,
          shortBio: true,
          trustBadge: true,
          createdAt: true,
        },
      }),
      prisma.property.count({ where: { hostId } }),
      prisma.property.count({ where: { hostId, isVerified: true } }),
      prisma.booking.count({ where: { property: { hostId } } }),
      prisma.review.aggregate({
        where: { property: { hostId } },
        _avg: { rating: true },
      }),
      prisma.document.count({ where: { userId: hostId } }),
      prisma.booking.count({
        where: {
          property: { hostId },
          createdAt: { gte: firstDayOfMonth },
        },
      }),
      prisma.payment.aggregate({
        where: {
          status: "SUCCESS",
          booking: { property: { hostId } },
        },
        _sum: { amount: true },
      }),
    ]);

    user = results[0];
    totalProperties = results[1] || 0;
    approvedProperties = results[2] || 0;
    totalBookings = results[3] || 0;
    avgRating = Number((results[4]?._avg?.rating || 0).toFixed(1));
    documentsCount = results[5] || 0;
    monthlyBookings = results[6] || 0;
    totalEarnings = Number(results[7]?._sum?.amount || 0);
  } catch (error) {
    console.error("[DB Error] Could not fetch host profile data:", error);
  }

  if (!user) redirect("/login");

  const stats = {
    totalProperties,
    approvedProperties,
    totalBookings,
    avgRating: avgRating > 0 ? avgRating : "New",
    documentsCount,
    monthlyBookings,
    totalEarnings,
  };

  return (
    <HostProfileClient
      user={{
        ...user,
        role: user.role?.toString() || "HOST",
      }}
      stats={stats}
    />
  );
}
