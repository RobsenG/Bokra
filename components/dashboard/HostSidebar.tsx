"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  Building2,
  CalendarDays,
  Wallet,
  FileCheck,
  ShieldAlert,
  Star,
  User,
  Menu,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeProvider";

interface HostSidebarProps {
  isVerified: boolean;
  user?: {
    name?: string | null;
    email?: string | null;
    avatar?: string | null;
    image?: string | null;
  };
}

export default function HostSidebar({ isVerified, user }: HostSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Home", href: "/", icon: Home },
    { name: "Dashboard", href: "/host/dashboard", icon: LayoutDashboard },
    { name: "Properties", href: "/host/properties", icon: Building2 },
    { name: "Bookings", href: "/host/bookings", icon: CalendarDays },
    { name: "Revenue", href: "/host/revenue", icon: Wallet },
    { name: "Reviews", href: "/host/reviews", icon: Star },
    { name: "Verification", href: "/host/verification", icon: isVerified ? FileCheck : ShieldAlert },
    { name: "Profile", href: "/host/profile", icon: User },
  ];

  const avatarSrc = user?.avatar || user?.image;

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden fixed top-3 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl bg-[#080810] text-[#f8f6f0] shadow-md hover:bg-[#12121a] transition-colors focus:outline-none cursor-pointer"
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Sidebar — always dark */}
      <aside
        className={`w-64 min-h-screen bg-[#080810] flex flex-col fixed left-0 top-0 bottom-0 z-40 transform transition-transform duration-300 md:translate-x-0 border-r border-white/[0.04] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            <span className="text-[#f8f6f0]">Bokra</span>
            <span className="text-[#c9a84c]">Stay</span>
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/20">
            Host
          </span>
        </div>

        {/* Nav label */}
        <div className="px-6 pt-6 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#5a5348]">
          Host menu
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-0.5 px-3">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={
                  isActive
                    ? "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[#0a0a0f] bg-[#c9a84c] shadow-[0_4px_20px_rgba(201,168,76,0.3)]"
                    : "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#9b9080] hover:text-[#f8f6f0] hover:bg-white/[0.05] transition-all duration-150 cursor-pointer"
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto px-4 py-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 mb-3">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={user?.name || "User"}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-white/10 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#c9a84c] flex items-center justify-center text-[#0a0a0f] text-sm font-bold ring-2 ring-white/10 shrink-0">
                {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-[#f8f6f0] truncate">{user?.name || "Host Portal"}</span>
              <span className="text-[10px] text-[#5a5348] truncate">{user?.email || "host@bokrastay.com"}</span>
            </div>
          </div>
          <div className="flex justify-end">
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}
    </>
  );
}
