"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, LayoutDashboard, ShieldCheck, ClipboardList, Heart } from "lucide-react";
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

  const getProfileLink = () => {
    if (user.role === "HOST") return "/host/profile";
    return "/renter/profile";
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const initials = user.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : user.email?.substring(0, 2).toUpperCase() || "US";

  const getBadgeClass = () => {
    if (user.role === "ADMIN") return "bg-[#1f2937] text-white border border-[#1f2937]";
    if (user.role === "HOST") return "bg-[#7c3aed]/10 text-[#7c3aed] border border-[#7c3aed]/20";
    return "bg-blue-50 text-blue-700 border border-blue-200";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-[#f8fafc] transition-colors focus:outline-none cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-xs font-bold shadow-xs">
          {initials}
        </div>
        <span className="hidden sm:inline text-sm font-medium text-[#111827]">
          {user.name || user.email}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#e5e7eb] shadow-lg py-2 z-50 animate-in fade-in-50 slide-in-from-top-2 duration-200">
          <div className="px-4 py-2 border-b border-[#e5e7eb] mb-1">
            <p className="text-sm font-semibold text-[#111827] truncate">
              {user.name || "User"}
            </p>
            <p className="text-xs text-[#6b7280] truncate">
              {user.email}
            </p>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 mt-1 rounded-full text-xs font-semibold ${getBadgeClass()}`}>
              {user.role}
            </span>
          </div>

          <Link
            href={getDashboardLink()}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[#111827] hover:bg-[#f8fafc] hover:text-[#7c3aed] transition-colors"
          >
            {user.role === "ADMIN" ? (
              <ShieldCheck className="w-4 h-4 text-[#7c3aed]" />
            ) : user.role === "HOST" ? (
              <LayoutDashboard className="w-4 h-4 text-[#7c3aed]" />
            ) : (
              <ClipboardList className="w-4 h-4 text-[#7c3aed]" />
            )}
            <span>Dashboard</span>
          </Link>

          <Link
            href={getProfileLink()}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[#111827] hover:bg-[#f8fafc] hover:text-[#7c3aed] transition-colors"
          >
            <User className="w-4 h-4 text-[#7c3aed]" />
            <span>Profile</span>
          </Link>

          <Link
            href="/renter/favorites"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[#111827] hover:bg-[#f8fafc] hover:text-[#7c3aed] transition-colors"
          >
            <Heart className="w-4 h-4 text-[#7c3aed]" />
            <span>Favorites</span>
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
