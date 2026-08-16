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

interface HostSidebarProps {
  isVerified: boolean;
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

export default function HostSidebar({ isVerified, user }: HostSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Home", href: "/", icon: Home },
    { name: "Dashboard", href: "/host/dashboard", icon: LayoutDashboard },
    { name: "My Properties", href: "/host/properties", icon: Building2 },
    { name: "Bookings", href: "/host/bookings", icon: CalendarDays },
    { name: "Revenue", href: "/host/revenue", icon: Wallet },
    { name: "Reviews", href: "/host/reviews", icon: Star },
    { name: "Verification", href: "/host/verification", icon: isVerified ? FileCheck : ShieldAlert },
    { name: "Profile", href: "/host/profile", icon: User },
  ];

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "H";

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-3 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl bg-[#111827] text-white shadow-md hover:bg-[#1f2937] transition-colors focus:outline-none cursor-pointer"
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`w-64 min-h-screen bg-[#111827] flex flex-col fixed left-0 top-0 bottom-0 z-40 transform transition-transform duration-300 md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* Sidebar Header */}
        <div className="px-6 py-5 border-b border-[#374151] flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Bokra<span className="text-[#a855f7]">Stay</span>
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#7c3aed]/20 text-[#a855f7] border border-[#7c3aed]/30">
            Host
          </span>
        </div>

        {/* Sidebar Nav Section Label */}
        <div className="px-6 pt-6 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">
          Host Console
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = link.href === "/" ? pathname === "/" : (pathname === link.href || pathname.startsWith(link.href + "/"));
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={
                  isActive
                    ? "flex items-center gap-3 px-6 py-3 mx-3 rounded-xl text-sm font-semibold text-white bg-[#7c3aed] shadow-[0_4px_14px_0_rgb(124_58_237_/_0.3)]"
                    : "flex items-center gap-3 px-6 py-3 mx-3 rounded-xl text-sm font-medium text-[#9ca3af] hover:text-white hover:bg-[#1f2937] transition-all duration-150 cursor-pointer"
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="mt-auto px-4 py-4 border-t border-[#374151] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-white truncate">{user?.name || "Host Portal"}</span>
            <span className="text-[10px] text-[#9ca3af] truncate">{user?.email || "host@bokrastay.com"}</span>
          </div>
        </div>
      </aside>

      {/* Overlay on mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}
    </>
  );
}
