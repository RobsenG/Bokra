import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import UserMenu from "./UserMenu";

export default async function Navbar() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <header className="bg-white border-b border-[#e5e7eb] sticky top-0 z-50 backdrop-blur-sm bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-[#111827]">Bokra</span>
          <span className="text-[#7c3aed] ml-1">Stay</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-[#6b7280] hover:text-[#111827] transition-colors">
            Find Stays
          </Link>
          {isLoggedIn && session?.user?.role === "HOST" && (
            <Link href="/host/properties" className="text-sm font-medium text-[#6b7280] hover:text-[#111827] transition-colors">
              My Properties
            </Link>
          )}
          {isLoggedIn && session?.user?.role === "ADMIN" && (
            <Link href="/admin/dashboard" className="text-sm font-medium text-[#6b7280] hover:text-[#111827] transition-colors">
              Admin Control
            </Link>
          )}
        </nav>

        {/* Action Buttons / User Dropdown */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <UserMenu user={session.user} />
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                href="/login" 
                className="text-[#6b7280] hover:text-[#111827] hover:bg-[#f8fafc] font-medium text-sm px-4 py-2 rounded-xl transition-all duration-200"
              >
                Log In
              </Link>
              <Link 
                href="/register" 
                className="bg-[#7c3aed] hover:bg-[#5b21b6] active:bg-[#4c1d95] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-[0_4px_14px_0_rgb(124_58_237_/0.25)] hover:shadow-[0_6px_20px_0_rgb(124_58_237/_0.35)] transition-all duration-200"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
