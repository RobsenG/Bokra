import React from "react";
import Link from "next/link";
import { Home } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col md:grid md:grid-cols-2 bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-neutral-950 dark:to-neutral-900">
      {/* Brand/Visual Section - Left Column (Hidden on mobile) */}
      <div className="hidden md:flex flex-col justify-between p-8 lg:p-12 bg-teal-900 text-white relative overflow-hidden">
        {/* Decorative background grid and gradients */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f766e_1px,transparent_1px),linear-gradient(to_bottom,#0f766e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-600 rounded-full blur-[120px] opacity-20 pointer-events-none" />

        <div className="relative z-10 flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-white hover:text-teal-200 transition-colors"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <span className="text-white font-extrabold text-lg">B</span>
            </div>
            <span>Bokra Stay</span>
          </Link>
        </div>

        <div className="relative z-10 my-auto max-w-md space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight leading-none lg:text-5xl">
            Find your perfect stay in <span className="text-emerald-400">Ethiopia</span>
          </h1>
          <p className="text-teal-100 text-lg leading-relaxed">
            Experience premium stays, verified hosts, and seamless booking. Your gateway to genuine Ethiopian hospitality.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-teal-900 bg-teal-800 flex items-center justify-center text-xs font-bold">AA</div>
              <div className="w-8 h-8 rounded-full border-2 border-teal-900 bg-emerald-800 flex items-center justify-center text-xs font-bold">HW</div>
              <div className="w-8 h-8 rounded-full border-2 border-teal-900 bg-teal-700 flex items-center justify-center text-xs font-bold">BD</div>
            </div>
            <p className="text-teal-200 text-sm">Trusted by thousands of guests and hosts</p>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-teal-300">
          <p>© {new Date().getFullYear()} Bokra Stay. All rights reserved.</p>
          <Link href="/" className="hover:underline flex items-center gap-1">
            <Home className="size-3.5" /> Back to Home
          </Link>
        </div>
      </div>

      {/* Auth Form Section - Right Column */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 md:p-12 relative">
        {/* Mobile Header */}
        <div className="w-full max-w-md flex justify-between items-center mb-8 md:hidden">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-teal-950 dark:text-white">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center shadow-md">
              <span className="text-white font-extrabold text-sm">B</span>
            </div>
            <span>Bokra Stay</span>
          </Link>
          <Link href="/" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 text-sm font-medium flex items-center gap-1">
            <Home className="size-4" /> Home
          </Link>
        </div>

        <div className="w-full max-w-md flex flex-col justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
