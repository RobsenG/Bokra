"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function markNotificationReadAction(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  await prisma.adminNotification.update({
    where: { id },
    data: { isRead: true },
  });

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/system");
  revalidatePath("/admin", "layout");

  return { success: true };
}

export async function markAllNotificationsReadAction() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  await prisma.adminNotification.updateMany({
    where: { isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/system");
  revalidatePath("/admin", "layout");

  return { success: true };
}
