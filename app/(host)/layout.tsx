import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import HostSidebar from "@/components/dashboard/HostSidebar";
import UserMenu from "@/components/common/UserMenu";
import { ThemeToggle } from "@/components/common/ThemeProvider";
import { AlertCircle, Home } from "lucide-react";
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
    <div className="min-h-screen bg-[#faf9f7] dark:bg-[#0a0908] flex flex-col md:flex-row font-sans">
      <HostSidebar isVerified={isVerified} user={session.user} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
        {/* Top Bar */}
        <header className="bg-white/90 dark:bg-[#0a0908]/85 backdrop-blur-xl border-b border-black/[0.06] dark:border-[#fff8dc]/[0.05] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="font-bold text-lg text-[#1a1208] dark:text-[#f5f0e8] pl-10 md:pl-0">
            Host Dashboard
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="text-[#6b5e4e] dark:text-[#8a8278] hover:text-[#1a1208] dark:hover:text-[#f5f0e8] hover:bg-black/5 dark:hover:bg-[#fff8dc]/[0.04] font-medium text-sm px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <UserMenu user={session.user} />
          </div>
        </header>

        {/* Verification Alert */}
        {!isVerified && (
          <div className="m-6 mb-0 bg-amber-50 dark:bg-[rgba(245,158,11,0.08)] border border-amber-200 dark:border-[rgba(245,158,11,0.15)] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-[#fcd34d] mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-sm text-amber-900 dark:text-[#fcd34d]">
                  Account Verification Required
                </p>
                <p className="text-xs text-amber-700 dark:text-[#fcd34d]/80">
                  Please submit your identity verification documents to unlock hosting privileges.
                </p>
              </div>
            </div>
            <Link
              href="/host/verification"
              className="btn-primary text-xs px-4 py-2 shrink-0 text-center"
            >
              Verify Identity
            </Link>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 p-6 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
