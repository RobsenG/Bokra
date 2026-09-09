import React from "react";
import Link from "next/link";
import { Home, Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col md:grid md:grid-cols-2 bg-[#faf9f7] dark:bg-[#0a0a0f] font-sans">
      {/* Brand Panel — Left Column (hidden on mobile) */}
      <div className="hidden md:flex flex-col justify-between p-8 lg:p-12 bg-[#080810] text-white relative overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
        {/* Gold glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#c9a84c] rounded-full blur-[160px] opacity-10 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-[#f8f6f0]">Bokra</span>
            <span className="text-[#c9a84c]">Stay</span>
          </Link>
        </div>

        {/* Center content */}
        <div className="relative z-10 my-auto max-w-md space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center mb-6">
            <Sparkles className="w-6 h-6 text-[#c9a84c]" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight lg:text-5xl text-[#f8f6f0]">
            Find your perfect stay in{" "}
            <span className="text-[#c9a84c]">Ethiopia</span>
          </h1>
          <p className="text-[#9b9080] text-lg leading-relaxed font-light">
            Experience premium stays, verified hosts, and seamless booking.
            Your gateway to genuine Ethiopian hospitality.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-[#080810] bg-[#c9a84c] flex items-center justify-center text-[#0a0a0f] text-xs font-bold">
                AA
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-[#080810] bg-[#a07830] flex items-center justify-center text-white text-xs font-bold">
                HW
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-[#080810] bg-[#e8c96d] flex items-center justify-center text-[#0a0a0f] text-xs font-bold">
                BD
              </div>
            </div>
            <p className="text-[#9b9080] text-sm font-medium">
              Trusted by thousands of guests and hosts
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-[#5a5348]">
          <p>© {new Date().getFullYear()} Bokra Stay. All rights reserved.</p>
          <Link href="/" className="hover:text-[#c9a84c] flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </div>

      {/* Auth Form Section — Right Column */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 md:p-12 relative bg-[#faf9f7] dark:bg-[#0a0a0f]">
        {/* Mobile header */}
        <div className="w-full max-w-md flex justify-between items-center mb-8 md:hidden">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-[#1a1208] dark:text-[#f8f6f0]">Bokra</span>
            <span className="text-[#b8943d] dark:text-[#c9a84c]">Stay</span>
          </Link>
          <Link
            href="/"
            className="text-[#b8943d] dark:text-[#c9a84c] hover:opacity-80 text-sm font-medium flex items-center gap-1"
          >
            <Home className="w-4 h-4" /> Home
          </Link>
        </div>

        {/* Radial gold glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#b8943d]/[0.04] dark:bg-[#c9a84c]/[0.05] rounded-full blur-[80px] pointer-events-none" />

        <div className="w-full max-w-md flex flex-col justify-center relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
