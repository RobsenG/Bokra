"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Role change is PERMANENTLY REMOVED — roles are read-only in admin UI

export async function suspendUser(userId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  if (session.user.id === userId) {
    throw new Error("You cannot suspend your own account.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isVerified: false },
  });

  revalidatePath("/admin/users");
}

export async function activateUser(userId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isVerified: true },
  });

  revalidatePath("/admin/users");
}

export async function getUserDetails(userId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      properties: {
        select: {
          id: true,
          title: true,
          city: true,
          status: true,
          isVerified: true,
          createdAt: true,
          _count: { select: { bookings: true, reviews: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      bookings: {
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          property: { select: { title: true, city: true } },
          payment: { select: { status: true, amount: true } },
        },
      },
      documents: {
        orderBy: { uploadedAt: "desc" },
      },
      _count: {
        select: { properties: true, bookings: true, reviews: true },
      },
    },
  });
}
