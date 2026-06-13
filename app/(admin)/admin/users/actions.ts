"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

export async function updateUserRole(userId: string, role: Role) {
  const session = await auth();

  // Only admins can change user roles
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized. Only admins can perform this action.");
  }

  // Prevent admin from changing their own role
  if (session.user.id === userId) {
    throw new Error("You cannot change your own role.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/dashboard");
}

export async function toggleUserVerification(userId: string, isVerified: boolean) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isVerified },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/dashboard");
}
