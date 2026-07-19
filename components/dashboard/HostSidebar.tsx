"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Building2, 
  CalendarDays, 
  Star, 
  ShieldAlert, 
  Menu, 
  X, 
  UserCheck,
  User,
  Home
} from "lucide-react";

interface HostSidebarProps {
  isVerified: boolean;
}

export default function HostSidebar({ isVerified }: HostSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Dashboard", href: "/host/dashboard", icon: LayoutDashboard },
    { name: "Properties", href: "/host/properties", icon: Building2 },
    { name: "Bookings", href: "/host/bookings", icon: CalendarDays },
    { name: "Reviews", href: "/host/reviews", icon: Star },
    { name: "Verification", href: "/host/verification", icon: isVerified ? UserCheck : ShieldAlert },
    { name: "Profile", href: "/host/profile", icon: User },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-3 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-teal-900 text-white shadow-md hover:bg-teal-800 transition-colors focus:outline-none"
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Sidebar Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-teal-950 text-white border-r border-teal-900 flex flex-col justify-between transform transition-transform duration-300 md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex flex-col gap-6 py-6 px-4">
          {/* Brand header */}
          <div className="flex items-center gap-2 px-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-400 to-emerald-500 flex items-center justify-center shadow-md">
              <span className="text-white font-extrabold text-lg">B</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-none">Bokra Stay</span>
              <span className="text-[10px] text-teal-400 font-semibold tracking-wider uppercase mt-0.5">Host Console</span>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="space-y-1.5 pt-4">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-teal-500/20 text-teal-300 border-l-4 border-teal-400"
                      : "text-teal-100 hover:bg-teal-900/50 hover:text-white"
                  }`}
                >
                  <Icon className="size-4.5 shrink-0" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Home button at the bottom of the nav */}
        <div className="px-4 pb-4">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-teal-200 hover:bg-teal-900/70 hover:text-white border border-teal-800/60 transition-all"
          >
            <Home className="size-4.5 shrink-0" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-teal-900 bg-teal-950/40 text-[10px] text-teal-400/80">
          <p className="font-semibold text-white mb-0.5">Bokra Stay Host</p>
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
