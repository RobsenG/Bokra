"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  ShieldCheck,
  Users,
  DollarSign,
  Home,
  CalendarDays,
  Settings,
} from "lucide-react";

interface AdminSidebarProps {
  pendingCount?: number;
  unreadCount?: number;
  user?: {
    name?: string | null;
    email?: string | null;
    avatar?: string | null;
    image?: string | null;
  };
}

export default function AdminSidebar({ pendingCount = 0, user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Home", href: "/", icon: Home },
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    {
      name: "Verifications",
      href: "/admin/verifications",
      icon: ShieldCheck,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { name: "Bookings", href: "/admin/bookings", icon: CalendarDays },
    { name: "Revenue", href: "/admin/revenue", icon: DollarSign },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "System", href: "/admin/system", icon: Settings },
  ];

  const avatarSrc = user?.avatar || user?.image;

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-3 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl bg-[#111827] text-white shadow-md hover:bg-[#1f2937] transition-colors focus:outline-none"
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
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1f2937] text-white border border-[#374151]">
            Admin
          </span>
        </div>

        {/* Nav section label */}
        <div className="px-6 pt-6 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">
          Admin menu
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-1">
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
                    ? "flex items-center justify-between px-6 py-3 mx-3 rounded-xl text-sm font-semibold text-white bg-[#7c3aed] shadow-[0_4px_14px_0_rgb(124_58_237_/_0.3)]"
                    : "flex items-center justify-between px-6 py-3 mx-3 rounded-xl text-sm font-medium text-[#9ca3af] hover:text-white hover:bg-[#1f2937] transition-all duration-150 cursor-pointer"
                }
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.name}</span>
                </span>
                {"badge" in link && link.badge !== undefined && (
                  <span className="bg-amber-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="mt-auto px-4 py-4 border-t border-[#374151] flex items-center gap-3">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={user?.name || "User"}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-white/20 shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-sm font-bold ring-2 ring-white/20 shrink-0">
              {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-white truncate">{user?.name || "Admin User"}</span>
            <span className="text-[10px] text-[#9ca3af] truncate">{user?.email || "admin@bokrastay.com"}</span>
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
