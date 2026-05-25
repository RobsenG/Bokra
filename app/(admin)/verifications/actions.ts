"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function approveProperty(propertyId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.property.update({
    where: { id: propertyId },
    data: { isVerified: true },
  });

  revalidatePath("/(admin)/verifications");
}

export async function rejectProperty(propertyId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  // In a real scenario, you might want to delete it or add a rejection reason
  await prisma.property.delete({
    where: { id: propertyId },
  });

  revalidatePath("/(admin)/verifications");
}
