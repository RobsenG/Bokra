"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User as UserIcon, LogOut, LayoutDashboard, ClipboardList } from "lucide-react";
import { signOut } from "next-auth/react";

interface UserMenuProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    avatar?: string | null;
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
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const getDashboardLink = () => {
    if (user.role === "HOST") return "/host/dashboard";
    if (user.role === "ADMIN") return "/admin/dashboard";
    return "/renter/bookings";
  };

  const getProfileLink = () => {
    if (user.role === "HOST") return "/host/profile";
    return "/renter/profile";
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  const getBadgeClass = () => {
    if (user.role === "ADMIN")
      return "bg-[#1a1208] text-white border border-[#1a1208] dark:bg-[#fff8dc]/[0.06] dark:text-[#d4cfc7] dark:border-[#fff8dc]/[0.12]";
    if (user.role === "HOST")
      return "bg-[#b8943d]/10 text-[#8a6e2a] border border-[#b8943d]/20 dark:bg-[#c9a84c]/[0.08] dark:text-[#c9a84c] dark:border-[#c9a84c]/[0.15]";
    return "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-[rgba(96,165,250,0.08)] dark:text-[#93c5fd] dark:border-[rgba(96,165,250,0.15)]";
  };

  const avatarSrc = user.avatar || user.image;

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      {/* Avatar Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="focus:outline-none cursor-pointer flex items-center"
        aria-label="User Menu"
      >
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={user.name || "User"}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-[#b8943d]/30 dark:ring-[#c9a84c]/30 hover:ring-[#b8943d]/60 dark:hover:ring-[#c9a84c]/60 transition-all"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#b8943d] dark:bg-[#c9a84c] ring-2 ring-[#b8943d]/30 dark:ring-[#c9a84c]/30 flex items-center justify-center text-white dark:text-[#0c0b09] text-sm font-bold hover:bg-[#c9a84c] dark:hover:bg-[#d4b458] transition-colors">
            {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-64 bg-white dark:bg-[#1c1a16] rounded-2xl border border-black/[0.08] dark:border-[#fff8dc]/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.6)] overflow-hidden z-50 animate-fade-in">
          {/* User info header */}
          <div className="px-4 py-4 bg-black/[0.02] dark:bg-[#fff8dc]/[0.02] border-b border-black/[0.06] dark:border-[#fff8dc]/[0.06] flex items-center gap-3">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={user.name || "User"}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-[#b8943d]/30 dark:ring-[#c9a84c]/30 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#b8943d] dark:bg-[#c9a84c] ring-2 ring-[#b8943d]/30 dark:ring-[#c9a84c]/30 flex items-center justify-center text-white dark:text-[#0c0b09] text-base font-bold shrink-0">
                {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#1a1208] dark:text-[#f5f0e8] truncate">
                {user.name || "User"}
              </p>
              <p className="text-xs text-[#9b8e7e] dark:text-[#8a8278] truncate">{user.email}</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 mt-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getBadgeClass()}`}>
                {user.role || "RENTER"}
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href={getProfileLink()}
              onClick={() => setIsOpen(false)}
              className="px-4 py-2.5 flex items-center gap-3 text-sm text-[#6b5e4e] dark:text-[#8a8278] font-medium hover:bg-black/[0.02] dark:hover:bg-[#fff8dc]/[0.04] hover:text-[#b8943d] dark:hover:text-[#d4cfc7] transition-colors cursor-pointer"
            >
              <UserIcon className="w-4 h-4 text-[#b8943d] dark:text-[#c9a84c]" />
              <span>My Profile</span>
            </Link>

            {(!user.role || user.role === "RENTER") && (
              <Link
                href="/renter/bookings"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 flex items-center gap-3 text-sm text-[#6b5e4e] dark:text-[#8a8278] font-medium hover:bg-black/[0.02] dark:hover:bg-[#fff8dc]/[0.04] hover:text-[#b8943d] dark:hover:text-[#d4cfc7] transition-colors cursor-pointer"
              >
                <ClipboardList className="w-4 h-4 text-[#b8943d] dark:text-[#c9a84c]" />
                <span>My Bookings</span>
              </Link>
            )}

            <Link
              href={getDashboardLink()}
              onClick={() => setIsOpen(false)}
              className="px-4 py-2.5 flex items-center gap-3 text-sm text-[#6b5e4e] dark:text-[#8a8278] font-medium hover:bg-black/[0.02] dark:hover:bg-[#fff8dc]/[0.04] hover:text-[#b8943d] dark:hover:text-[#d4cfc7] transition-colors cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4 text-[#b8943d] dark:text-[#c9a84c]" />
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-red-600 dark:text-[#fca5a5] font-medium hover:bg-red-50 dark:hover:bg-[rgba(239,68,68,0.08)] transition-colors cursor-pointer border-t border-black/[0.06] dark:border-[#fff8dc]/[0.06] text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
