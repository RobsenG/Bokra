import React from "react";
import Link from "next/link";
import { Home } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col md:grid md:grid-cols-2 bg-[#f8fafc] font-sans">
      {/* Brand/Visual Section - Left Column (Hidden on mobile) */}
      <div className="hidden md:flex flex-col justify-between p-8 lg:p-12 bg-[#111827] text-white relative overflow-hidden">
        {/* Decorative background gradients */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#7c3aed] rounded-full blur-[140px] opacity-20 pointer-events-none" />

        <div className="relative z-10 flex items-center gap-2">
          <Link href="/" className="text-xl font-bold tracking-tight text-white">
            Bokra<span className="text-[#a855f7]">Stay</span>
          </Link>
        </div>

        <div className="relative z-10 my-auto max-w-md space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight leading-none lg:text-5xl">
            Find your perfect stay in <span className="text-[#a855f7]">Ethiopia</span>
          </h1>
          <p className="text-[#9ca3af] text-lg leading-relaxed font-light">
            Experience premium stays, verified hosts, and seamless booking. Your gateway to genuine Ethiopian hospitality.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-[#111827] bg-[#7c3aed] flex items-center justify-center text-xs font-bold">AA</div>
              <div className="w-8 h-8 rounded-full border-2 border-[#111827] bg-[#5b21b6] flex items-center justify-center text-xs font-bold">HW</div>
              <div className="w-8 h-8 rounded-full border-2 border-[#111827] bg-[#a855f7] flex items-center justify-center text-xs font-bold">BD</div>
            </div>
            <p className="text-[#9ca3af] text-sm font-medium">Trusted by thousands of guests and hosts</p>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-[#9ca3af]">
          <p>© {new Date().getFullYear()} Bokra Stay. All rights reserved.</p>
          <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </div>

      {/* Auth Form Section - Right Column */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 md:p-12 relative bg-[#f8fafc]">
        {/* Mobile Header */}
        <div className="w-full max-w-md flex justify-between items-center mb-8 md:hidden">
          <Link href="/" className="text-xl font-bold tracking-tight text-[#111827]">
            Bokra<span className="text-[#7c3aed]">Stay</span>
          </Link>
          <Link href="/" className="text-[#7c3aed] hover:text-[#5b21b6] text-sm font-medium flex items-center gap-1">
            <Home className="w-4 h-4" /> Home
          </Link>
        </div>

        <div className="w-full max-w-md flex flex-col justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
