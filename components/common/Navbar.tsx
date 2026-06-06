import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import UserMenu from "./UserMenu";
import { Building2, Search } from "lucide-react";

export default async function Navbar() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-100 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-teal-950 dark:text-white">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center shadow-md shadow-teal-500/10">
            <span className="text-white font-extrabold text-lg">B</span>
          </div>
          <span className="bg-gradient-to-r from-teal-950 to-teal-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">
            Bokra Stay
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600 dark:text-neutral-300">
          <Link href="/" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
            Find Stays
          </Link>
          {isLoggedIn && session?.user?.role === "HOST" && (
            <Link href="/host/properties" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              My Properties
            </Link>
          )}
          {isLoggedIn && session?.user?.role === "ADMIN" && (
            <Link href="/admin/dashboard" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              Admin Control
            </Link>
          )}
        </nav>

        {/* Action Buttons / User Dropdown */}
        <div className="flex items-center gap-3">
          {isLoggedIn && session?.user?.role === "RENTER" && (
            <Link 
              href="/register?role=HOST"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/20 transition-colors"
            >
              <Building2 className="size-3.5" />
              Become a Host
            </Link>
          )}
          
          {isLoggedIn ? (
            <UserMenu user={session.user} />
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                href="/login" 
                className="px-3 py-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                Log In
              </Link>
              <Link 
                href="/register" 
                className="px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white transition-all shadow-md shadow-teal-600/10"
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
