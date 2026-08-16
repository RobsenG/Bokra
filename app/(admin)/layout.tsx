import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import AdminNotificationBell from "@/components/dashboard/AdminNotificationBell";
import UserMenu from "@/components/common/UserMenu";
import { getUnreadNotifications } from "@/lib/notifications";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Fetch pending property count for sidebar badge and unread notifications for notification bell
  const [pendingCount, unreadNotifications] = await Promise.all([
    prisma.property.count({ where: { status: "PENDING", isVerified: false } }),
    getUnreadNotifications(),
  ]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans">
      {/* Sidebar Nav with live pending badge */}
      <AdminSidebar
        pendingCount={pendingCount}
        unreadCount={unreadNotifications.length}
        user={session.user}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen bg-[#f8fafc]">
        {/* Top Header */}
        <header className="bg-white border-b border-[#e5e7eb] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="font-bold text-lg text-[#111827] pl-10 md:pl-0">
            Admin Console
          </div>
          <div className="flex items-center gap-3">
            <AdminNotificationBell
              notifications={unreadNotifications.map((n) => ({
                id: n.id,
                type: n.type,
                message: n.message,
                createdAt: n.createdAt.toISOString(),
                isRead: n.isRead,
                propertyId: n.propertyId,
              }))}
            />
            <UserMenu user={session.user} />
          </div>
        </header>

        {/* Workspace Content */}
        <main className="flex-1 p-6 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
