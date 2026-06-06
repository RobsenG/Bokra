"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, LayoutDashboard, ShieldCheck, ClipboardList } from "lucide-react";
import { signOut } from "next-auth/react";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDashboardLink = () => {
    if (user.role === "HOST") return "/host/dashboard";
    if (user.role === "ADMIN") return "/admin/dashboard";
    return "/renter/bookings";
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const initials = user.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : user.email?.substring(0, 2).toUpperCase() || "US";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none"
      >
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
          {initials}
        </div>
        <span className="hidden sm:inline text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {user.name || user.email}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-xl py-2 z-50 animate-in fade-in-50 slide-in-from-top-2 duration-200">
          <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800 mb-1">
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 truncate">
              {user.name || "User"}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
              {user.email}
            </p>
            <span className="inline-flex mt-1 items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300">
              {user.role}
            </span>
          </div>

          <Link
            href={getDashboardLink()}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-teal-50/50 dark:hover:bg-neutral-800/60 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
          >
            {user.role === "ADMIN" ? (
              <ShieldCheck className="size-4" />
            ) : user.role === "HOST" ? (
              <LayoutDashboard className="size-4" />
            ) : (
              <ClipboardList className="size-4" />
            )}
            <span>Dashboard</span>
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left"
          >
            <LogOut className="size-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
