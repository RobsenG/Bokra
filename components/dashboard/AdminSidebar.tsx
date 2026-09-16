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
import { ThemeToggle } from "@/components/common/ThemeProvider";

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
      {/* Mobile Toggle */}
      <div className="md:hidden fixed top-3 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl bg-white text-neutral-900 border border-neutral-200 dark:bg-[#080806] dark:text-[#f5f0e8] dark:border-[#fff8dc]/[0.06] shadow-md hover:bg-neutral-100 dark:hover:bg-[#141310] transition-colors focus:outline-none cursor-pointer"
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`w-64 min-h-screen bg-white dark:bg-[#080806] flex flex-col fixed left-0 top-0 bottom-0 z-40 transform transition-transform duration-300 md:translate-x-0 border-r border-black/[0.08] dark:border-[#fff8dc]/[0.04] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-black/[0.06] dark:border-[#fff8dc]/[0.04] flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            <span className="text-[#1a1208] dark:text-[#f5f0e8]">Bokra</span>
            <span className="text-[#b8943d] dark:text-[#c9a84c]">Stay</span>
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-[#fff8dc]/[0.06] text-neutral-700 dark:text-[#d4cfc7] border border-black/10 dark:border-[#fff8dc]/[0.12]">
            Admin
          </span>
        </div>

        {/* Nav label */}
        <div className="px-6 pt-6 pb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-[#8a8278]">
          Admin menu
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
                    ? "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-white bg-[#b8943d] shadow-sm dark:text-[#080806] dark:bg-[#c9a84c] dark:shadow-[0_4px_16px_rgba(201,168,76,0.2)]"
                    : "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-[#8a8278] dark:hover:text-[#f5f0e8] dark:hover:bg-[#fff8dc]/[0.05] transition-all duration-150 cursor-pointer"
                }
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.name}</span>
                </span>
                {"badge" in link && link.badge !== undefined && (
                  <span className="bg-[#b8943d] text-white dark:bg-[#c9a84c] dark:text-[#080806] text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto px-4 py-4 border-t border-black/[0.06] dark:border-[#fff8dc]/[0.04] bg-white dark:bg-[#080806]">
          <div className="flex items-center gap-3 mb-3">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={user?.name || "User"}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-black/10 dark:ring-[#fff8dc]/10 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#b8943d] dark:bg-[#c9a84c] flex items-center justify-center text-white dark:text-[#080806] text-sm font-bold ring-2 ring-black/10 dark:ring-[#fff8dc]/10 shrink-0">
                {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "A"}
              </div>
            )}
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-[#1a1208] dark:text-[#f5f0e8] truncate">{user?.name || "Admin User"}</span>
              <span className="text-[10px] text-neutral-500 dark:text-[#8a8278] truncate">{user?.email || "admin@bokrastay.com"}</span>
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
