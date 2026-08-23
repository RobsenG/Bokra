"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { uploadToSupabase } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const shortBio = (formData.get("shortBio") as string)?.trim() || null;
  const avatarFile = formData.get("avatar") as File | null;

  if (!name) throw new Error("Name is required.");

  let avatarUrl: string | undefined;
  if (avatarFile && avatarFile.size > 0) {
    const fileName = `avatars/${session.user.id}-${Date.now()}-${avatarFile.name}`;
    avatarUrl = await uploadToSupabase(avatarFile, "avatars", fileName);
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      phone,
      shortBio,
      ...(avatarUrl ? { avatar: avatarUrl } : {}),
    },
  });

  const role = session.user.role;
  revalidatePath(role === "HOST" ? "/host/profile" : "/renter/profile");
  revalidatePath("/properties");
}
