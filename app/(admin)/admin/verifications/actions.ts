"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendVerificationStatusEmail } from "@/lib/email";

export async function approveProperty(propertyId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { title: true },
  });

  await prisma.property.update({
    where: { id: propertyId },
    data: {
      status: "APPROVED",
      isVerified: true,
      rejectionReason: null,
    },
  });

  // Create audit log notification (marked read as admin performed it)
  if (property) {
    await prisma.adminNotification.create({
      data: {
        type: "PROPERTY_APPROVED",
        message: `Property "${property.title}" was approved and published.`,
        propertyId,
        isRead: true,
      },
    });
  }

  revalidatePath("/admin/verifications");
  revalidatePath(`/admin/verifications/${propertyId}`);
  revalidatePath("/admin/dashboard");
  revalidatePath("/host/dashboard");
  revalidatePath("/host/properties");
  revalidatePath("/properties");
  revalidatePath("/");

  return { success: true };
}

export async function rejectProperty(propertyId: string, reason: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  if (!reason || reason.trim().length < 10) {
    return {
      error: "Please provide a detailed rejection reason (minimum 10 characters)",
    };
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { title: true, hostId: true },
  });

  if (!property) {
    return { error: "Property not found" };
  }

  await prisma.property.update({
    where: { id: propertyId },
    data: {
      status: "REJECTED",
      isVerified: false,
      rejectionReason: reason.trim(),
    },
  });

  // Create admin audit log notification
  await prisma.adminNotification.create({
    data: {
      type: "PROPERTY_REJECTED",
      message: `Property "${property.title}" was rejected. Reason: ${reason.trim()}`,
      propertyId,
      isRead: true,
    },
  });

  revalidatePath("/admin/verifications");
  revalidatePath(`/admin/verifications/${propertyId}`);
  revalidatePath("/admin/dashboard");
  revalidatePath("/host/dashboard");
  revalidatePath("/host/properties");
  revalidatePath("/properties");
  revalidatePath("/");

  return { success: true };
}

export async function approveDocument(documentId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  const doc = await prisma.document.update({
    where: { id: documentId },
    data: { status: "APPROVED" },
    include: { user: true },
  });

  // Verify the host user automatically once their document is approved
  await prisma.user.update({
    where: { id: doc.userId },
    data: { isVerified: true },
  });

  // Send email notification
  await sendVerificationStatusEmail({
    email: doc.user.email,
    name: doc.user.name || "Host",
    isVerified: true,
  });

  revalidatePath("/admin/verifications");
  revalidatePath("/admin/dashboard");
  revalidatePath("/host/dashboard");
  revalidatePath("/host/verification");
}

export async function rejectDocument(documentId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  const doc = await prisma.document.update({
    where: { id: documentId },
    data: { status: "REJECTED" },
    include: { user: true },
  });

  // Send email notification
  await sendVerificationStatusEmail({
    email: doc.user.email,
    name: doc.user.name || "Host",
    isVerified: false,
  });

  revalidatePath("/admin/verifications");
  revalidatePath("/admin/dashboard");
  revalidatePath("/host/verification");
}

export async function assignTrustBadge(
  userId: string,
  trustBadge: string,
  adminVerifiedName: string
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  if (!userId) {
    return { error: "User ID is required" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      trustBadge: trustBadge.trim() || null,
      trustBadgeAt: trustBadge.trim() ? new Date() : null,
      adminVerifiedName: adminVerifiedName.trim() || null,
    },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/verifications");
  revalidatePath("/properties");
  revalidatePath("/");

  return { success: true };
}
