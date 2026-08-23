"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { DocumentType } from "@prisma/client";

export async function uploadDocument(docType: DocumentType, fileUrl: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "HOST") {
    throw new Error("Unauthorized. Only hosts can upload documents.");
  }

  if (!fileUrl || typeof fileUrl !== "string" || !fileUrl.startsWith("https://")) {
    throw new Error("Invalid document URL generated.");
  }

  if (!["ID_CARD", "OWNERSHIP_PROOF", "HOUSE_REGISTRATION", "OTHER"].includes(docType)) {
    throw new Error("Invalid document type.");
  }

  // Check for already-approved document of same type
  const existing = await prisma.document.findFirst({
    where: {
      userId: session.user.id,
      type: docType,
      status: "APPROVED",
    },
  });

  if (existing) {
    throw new Error(`You already have an approved ${docType.replace(/_/g, " ")} on file.`);
  }

  await prisma.document.create({
    data: {
      type: docType,
      fileUrl,
      status: "PENDING",
      userId: session.user.id,
    },
  });

  revalidatePath("/host/verification");
  revalidatePath("/admin/verifications");
}

export async function saveSelfie(selfieUrl: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (!selfieUrl || typeof selfieUrl !== "string" || !selfieUrl.startsWith("https://")) {
    throw new Error("Invalid selfie URL generated. Must be a valid public Supabase HTTPS URL.");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      selfieUrl,
      selfieVerifiedAt: new Date(),
    },
  });

  revalidatePath("/host/verification");
  revalidatePath("/host/profile");
  revalidatePath("/admin/verifications");

  return { success: true };
}
