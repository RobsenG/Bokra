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
  Lock,
  Home,
  CalendarDays,
  Settings,
} from "lucide-react";

interface AdminSidebarProps {
  pendingCount?: number;
  unreadCount?: number;
}

export default function AdminSidebar({ pendingCount = 0, unreadCount = 0 }: AdminSidebarProps) {
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

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-3 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-neutral-900 text-white shadow-md hover:bg-neutral-800 transition-colors focus:outline-none"
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-neutral-900 text-white border-r border-neutral-800 flex flex-col justify-between transform transition-transform duration-300 md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex flex-col gap-6 py-6 px-4">
          {/* Brand header */}
          <div className="flex items-center gap-2 px-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center shadow-md">
              <span className="text-white font-extrabold text-lg">B</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-none">Bokra Stay</span>
              <span className="text-[10px] text-neutral-400 font-semibold tracking-wider uppercase mt-0.5 flex items-center gap-1">
                <Lock className="size-2.5" /> Admin Console
              </span>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="space-y-1.5 pt-4">
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
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-teal-500/20 text-teal-300 border-l-4 border-teal-500"
                      : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="size-4.5 shrink-0" />
                    <span>{link.name}</span>
                  </span>
                  {"badge" in link && link.badge !== undefined && (
                    <span className="bg-orange-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/40 text-[10px] text-neutral-400">
          <p className="font-semibold text-white mb-0.5">Bokra Stay System</p>
          <p>© {new Date().getFullYear()} All rights reserved</p>
        </div>
      </aside>

      {/* Overlay on mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}
    </>
  );
}
