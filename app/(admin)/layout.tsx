import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import NotificationBell from "@/components/dashboard/NotificationBell";
import UserMenu from "@/components/common/UserMenu";
import { ThemeToggle } from "@/components/common/ThemeProvider";
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

  const [pendingCount, unreadNotifications] = await Promise.all([
    prisma.property.count({ where: { status: "PENDING", isVerified: false } }),
    getUnreadNotifications(),
  ]);

  return (
    <div className="min-h-screen bg-[#faf9f7] dark:bg-[#0a0908] flex flex-col md:flex-row font-sans">
      <AdminSidebar
        pendingCount={pendingCount}
        unreadCount={unreadNotifications.length}
        user={session.user}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
        {/* Top Header */}
        <header className="bg-white/90 dark:bg-[#0a0908]/85 backdrop-blur-xl border-b border-black/[0.06] dark:border-[#fff8dc]/[0.05] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="font-bold text-lg text-[#1a1208] dark:text-[#f5f0e8] pl-10 md:pl-0">
            Admin Console
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationBell
              initialNotifications={unreadNotifications.map((n) => ({
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

        {/* Content */}
        <main className="flex-1 p-6 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
