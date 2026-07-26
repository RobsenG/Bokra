"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { uploadToSupabase } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { DocumentType } from "@prisma/client";

export async function uploadDocument(formData: FormData) {
  const session = await auth();

  if (!session?.user || session.user.role !== "HOST") {
    throw new Error("Unauthorized. Only hosts can upload documents.");
  }

  const docType = formData.get("type") as DocumentType;
  const file = formData.get("file") as File;

  if (!file || file.size === 0) {
    throw new Error("No file selected.");
  }

  if (!["ID_CARD", "OWNERSHIP_PROOF", "HOUSE_REGISTRATION", "OTHER"].includes(docType)) {
    throw new Error("Invalid document type.");
  }

  const maxSizeBytes = 10 * 1024 * 1024; // 10MB limit
  if (file.size > maxSizeBytes) {
    throw new Error("File is too large. Maximum size is 10MB.");
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

  const fileName = `documents/${session.user.id}/${docType}-${Date.now()}-${file.name}`;
  const fileUrl = await uploadToSupabase(file, "documents", fileName);

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

  if (!selfieUrl || typeof selfieUrl !== "string") {
    throw new Error("Invalid selfie image URL");
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
