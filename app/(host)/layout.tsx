import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import HostSidebar from "@/components/dashboard/HostSidebar";
import UserMenu from "@/components/common/UserMenu";
import { AlertCircle, FileWarning } from "lucide-react";
import Link from "next/link";

export default async function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "HOST" && session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Fetch host user details from database to check fresh verification status
  let hostUser = null;
  try {
    hostUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
  } catch (error) {
    console.error("[DB Error] Could not fetch host user:", error);
  }

  const isVerified = hostUser?.isVerified || false;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col md:flex-row">
      {/* Sidebar Nav */}
      <HostSidebar isVerified={isVerified} />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 border-b border-neutral-100 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md px-6 flex items-center justify-between">
          <div className="font-bold text-teal-950 dark:text-white pl-10 md:pl-0">
            Host Dashboard
          </div>
          <div>
            <UserMenu user={session.user} />
          </div>
        </header>

        {/* Verification Alert Banner */}
        {!isVerified && (
          <div className="m-6 mb-0 p-4 border border-orange-200 dark:border-orange-900/30 rounded-2xl bg-orange-50/60 dark:bg-orange-950/10 text-orange-800 dark:text-orange-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 shrink-0 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-sm">Account Verification Required</p>
                <p className="text-xs text-orange-700/90 dark:text-orange-400/90">
                  Please submit your identity verification documents to unlock your hosting privileges and list properties.
                </p>
              </div>
            </div>
            <Link 
              href="/host/verification" 
              className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg text-xs font-semibold bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white shadow-sm transition-colors shrink-0"
            >
              Verify Identity
            </Link>
          </div>
        )}

        {/* Dashboard Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
