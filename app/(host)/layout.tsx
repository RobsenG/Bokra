import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import HostSidebar from "@/components/dashboard/HostSidebar";
import UserMenu from "@/components/common/UserMenu";
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans">
      {/* Sidebar Nav */}
      <HostSidebar isVerified={isVerified} user={session.user} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen bg-[#f8fafc]">
        {/* Top Bar */}
        <header className="bg-white border-b border-[#e5e7eb] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="font-bold text-lg text-[#111827] pl-10 md:pl-0">
            Host Dashboard
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-[#6b7280] hover:text-[#111827] hover:bg-[#f8fafc] font-medium text-sm px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <UserMenu user={session.user} />
          </div>
        </header>

        {/* Verification Alert Banner */}
        {!isVerified && (
          <div className="m-6 mb-0 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-sm text-amber-900">Account Verification Required</p>
                <p className="text-xs text-amber-700">
                  Please submit your identity verification documents to unlock your hosting privileges and list properties.
                </p>
              </div>
            </div>
            <Link 
              href="/host/verification" 
              className="bg-[#7c3aed] hover:bg-[#5b21b6] text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all duration-200 shrink-0 text-center"
            >
              Verify Identity
            </Link>
          </div>
        )}

        {/* Dashboard Content */}
        <main className="flex-1 p-6 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
