"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendVerificationStatusEmail } from "@/lib/email";

export async function approveProperty(propertyId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.property.update({
    where: { id: propertyId },
    data: { isVerified: true },
  });

  revalidatePath("/(admin)/admin/verifications");
  revalidatePath("/");
}

export async function rejectProperty(propertyId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.property.delete({
    where: { id: propertyId },
  });

  revalidatePath("/(admin)/admin/verifications");
  revalidatePath("/");
}

export async function approveDocument(documentId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  const doc = await prisma.document.update({
    where: { id: documentId },
    data: { status: "APPROVED" },
  });

  // Verify the host user automatically once their document is approved
  await prisma.user.update({
    where: { id: doc.userId },
    data: { isVerified: true },
  });

  revalidatePath("/(admin)/admin/verifications");
  revalidatePath("/(host)/host/dashboard");
  revalidatePath("/(host)/host/verification");
}

export async function rejectDocument(documentId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.document.update({
    where: { id: documentId },
    data: { status: "REJECTED" },
  });

  revalidatePath("/(admin)/admin/verifications");
  revalidatePath("/(host)/host/verification");
}
