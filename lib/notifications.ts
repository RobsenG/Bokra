import prisma from "@/lib/prisma";

export async function createAdminNotification(data: {
  type: string;
  message: string;
  propertyId?: string;
  reportedByUserId?: string;
}) {
  try {
    return await prisma.adminNotification.create({
      data: {
        type: data.type,
        message: data.message,
        propertyId: data.propertyId || null,
        reportedByUserId: data.reportedByUserId || null,
        isRead: false,
      },
    });
  } catch (error) {
    console.error("[Notifications] Failed to create admin notification:", error);
  }
}

export async function getUnreadNotifications() {
  try {
    return await prisma.adminNotification.findMany({
      where: { isRead: false },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("[Notifications] Failed to fetch unread notifications:", error);
    return [];
  }
}

export async function markNotificationRead(id: string) {
  try {
    return await prisma.adminNotification.update({
      where: { id },
      data: { isRead: true },
    });
  } catch (error) {
    console.error("[Notifications] Failed to mark notification read:", error);
  }
}
