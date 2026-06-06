import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import UserMenu from "@/components/common/UserMenu";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col md:flex-row">
      {/* Sidebar Nav */}
      <AdminSidebar />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 border-b border-neutral-100 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md px-6 flex items-center justify-between">
          <div className="font-bold text-neutral-800 dark:text-white pl-10 md:pl-0">
            System Administration
          </div>
          <div>
            <UserMenu user={session.user} />
          </div>
        </header>

        {/* Workspace Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
