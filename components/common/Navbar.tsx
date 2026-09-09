import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import UserMenu from "./UserMenu";
import { ThemeToggle } from "./ThemeProvider";

export default async function Navbar() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <header className="bg-white/90 dark:bg-[#141722]/90 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/10 sticky top-0 z-50 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-[#1a1208] dark:text-white">Bokra</span>
          <span className="text-[#b8943d] dark:text-[#e5c158] ml-0.5">Stay</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-[#6b5e4e] dark:text-[#cbd5e1] hover:text-[#1a1208] dark:hover:text-white transition-colors duration-200"
          >
            Find stays
          </Link>
          {isLoggedIn && session?.user?.role === "HOST" && (
            <Link
              href="/host/properties"
              className="text-sm font-medium text-[#6b5e4e] dark:text-[#cbd5e1] hover:text-[#1a1208] dark:hover:text-white transition-colors duration-200"
            >
              Properties
            </Link>
          )}
          {isLoggedIn && session?.user?.role === "ADMIN" && (
            <Link
              href="/admin/dashboard"
              className="text-sm font-medium text-[#6b5e4e] dark:text-[#cbd5e1] hover:text-[#1a1208] dark:hover:text-white transition-colors duration-200"
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Action Buttons / User Dropdown */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isLoggedIn && session?.user ? (
            <UserMenu user={session.user} />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-[#6b5e4e] dark:text-[#cbd5e1] hover:text-[#1a1208] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 font-medium text-sm px-4 py-2.5 rounded-xl transition-all duration-200"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="btn-primary text-sm px-5 py-2.5"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
