import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  BarChart,
  Shield,
  FileText,
  Crown,
} from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeProvider";
import SuperAdminLogoutButton from "./SuperAdminLogoutButton";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/superadmin/dashboard", label: "CEO Dashboard", icon: LayoutDashboard },
  { href: "/superadmin/analytics", label: "Analytics", icon: BarChart },
  { href: "/superadmin/admins", label: "Admins", icon: Shield },
  { href: "/superadmin/reports", label: "Reports", icon: FileText },
];

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user?.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const user = session.user;
  const avatarSrc = user.avatar;

  return (
    <div className="min-h-screen flex bg-[#faf9f7] dark:bg-[#0c0b09] font-[Manrope,sans-serif] antialiased text-[#1a1208] dark:text-[#f5f0e8]">
      {/* Fixed Sidebar */}
      <aside className="fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-[#080806] border-r border-black/[0.08] dark:border-[#fff8dc]/[0.04] flex flex-col justify-between z-40">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-black/[0.06] dark:border-[#fff8dc]/[0.04]">
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <span className="text-xl font-extrabold tracking-tight text-[#1a1208] dark:text-[#f5f0e8]">
                Bokra<span className="text-[#b8943d] dark:text-[#c9a84c]">Stay</span>
              </span>
            </Link>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-[#b8943d]/10 dark:bg-[#c9a84c]/15 text-[#b8943d] dark:text-[#c9a84c] border border-[#b8943d]/20 dark:border-[#c9a84c]/25">
              <Crown className="w-3 h-3" />
              Super Admin
            </div>
          </div>

          {/* Nav label */}
          <div className="px-6 pt-6 pb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-[#8a8278]">
            Super Admin Menu
          </div>

          {/* Navigation */}
          <nav className="px-3 space-y-0.5">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-[#8a8278] dark:hover:text-[#f5f0e8] dark:hover:bg-[#fff8dc]/[0.05] transition-all duration-150 group"
              >
                <Icon className="w-4 h-4 text-[#b8943d] dark:text-[#c9a84c] group-hover:text-[#a38233] dark:group-hover:text-[#e8c96d] transition-colors shrink-0" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-black/[0.06] dark:border-[#fff8dc]/[0.04] space-y-3 bg-white dark:bg-[#080806]">
          <div className="flex items-center gap-3">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={user.name || "Super Admin"}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-black/10 dark:ring-[#fff8dc]/10 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#b8943d] dark:bg-[#c9a84c] flex items-center justify-center text-white dark:text-[#080806] text-sm font-bold ring-2 ring-black/10 dark:ring-[#fff8dc]/10 shrink-0">
                {user.name?.charAt(0).toUpperCase() || "S"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate text-[#1a1208] dark:text-[#f5f0e8]">
                {user.name || "Super Admin"}
              </p>
              <p className="text-[10px] font-semibold text-neutral-500 dark:text-[#8a8278] truncate">
                {user.email || "superadmin@bokrastay.com"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-black/[0.06] dark:border-[#fff8dc]/[0.04]">
            <ThemeToggle />
            <SuperAdminLogoutButton />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Sticky Top Header */}
        <header className="bg-white/90 dark:bg-[#0a0908]/85 backdrop-blur-xl border-b border-black/[0.06] dark:border-[#fff8dc]/[0.05] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="font-bold text-lg text-[#1a1208] dark:text-[#f5f0e8]">
            Super Admin Console
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
