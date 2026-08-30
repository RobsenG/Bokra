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
      if (event.key === "Escape") {
        setIsOpen(false);
      }
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
      return "bg-[#1f2937] text-white border border-[#1f2937]";
    if (user.role === "HOST")
      return "bg-[#7c3aed]/10 text-[#7c3aed] border border-[#7c3aed]/20";
    return "bg-blue-50 text-blue-700 border border-blue-200";
  };

  const avatarSrc = user.avatar || user.image;

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      {/* Navbar Avatar Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="focus:outline-none cursor-pointer flex items-center"
        aria-label="User Menu"
      >
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={user.name || "User"}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-[#7c3aed]/30 hover:ring-[#7c3aed]/60 transition-all"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#7c3aed] ring-2 ring-[#7c3aed]/30 flex items-center justify-center text-white text-sm font-bold hover:bg-[#5b21b6] transition-colors">
            {user.name?.charAt(0).toUpperCase() ||
              user.email?.charAt(0).toUpperCase() ||
              "U"}
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl border border-[#e5e7eb] shadow-[0_8px_30px_0_rgb(0_0_0_/_0.12)] overflow-hidden z-50 animate-in fade-in duration-150">
          {/* Top section (user info) */}
          <div className="px-4 py-4 bg-[#f8fafc] border-b border-[#e5e7eb] flex items-center gap-3">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={user.name || "User"}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-[#7c3aed]/30 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#7c3aed] ring-2 ring-[#7c3aed]/30 flex items-center justify-center text-white text-base font-bold shrink-0">
                {user.name?.charAt(0).toUpperCase() ||
                  user.email?.charAt(0).toUpperCase() ||
                  "U"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#111827] truncate">
                {user.name || "User"}
              </p>
              <p className="text-xs text-[#6b7280] truncate">{user.email}</p>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 mt-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getBadgeClass()}`}
              >
                {user.role || "RENTER"}
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href={getProfileLink()}
              onClick={() => setIsOpen(false)}
              className="px-4 py-2.5 flex items-center gap-3 text-sm text-[#374151] font-medium hover:bg-[#f8fafc] hover:text-[#7c3aed] transition-colors cursor-pointer"
            >
              <UserIcon className="w-4 h-4 text-[#7c3aed]" />
              <span>My Profile</span>
            </Link>

            {/* Renter only item */}
            {(!user.role || user.role === "RENTER") && (
              <Link
                href="/renter/bookings"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 flex items-center gap-3 text-sm text-[#374151] font-medium hover:bg-[#f8fafc] hover:text-[#7c3aed] transition-colors cursor-pointer"
              >
                <ClipboardList className="w-4 h-4 text-[#7c3aed]" />
                <span>My Bookings</span>
              </Link>
            )}

            {/* Dashboard link */}
            <Link
              href={getDashboardLink()}
              onClick={() => setIsOpen(false)}
              className="px-4 py-2.5 flex items-center gap-3 text-sm text-[#374151] font-medium hover:bg-[#f8fafc] hover:text-[#7c3aed] transition-colors cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4 text-[#7c3aed]" />
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Sign Out item */}
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-red-600 font-medium hover:bg-red-50 transition-colors cursor-pointer border-t border-[#e5e7eb] text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
