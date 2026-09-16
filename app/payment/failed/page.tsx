"use client";

import Link from "next/link";
import { XCircle, RefreshCcw, Mail } from "lucide-react";

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-[#faf9f7] dark:bg-[#0c0b09] flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-[#141310] border border-black/[0.08] dark:border-[#fff8dc]/[0.06] rounded-3xl shadow-xl overflow-hidden p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-red-50 dark:bg-[rgba(239,68,68,0.08)] rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600 dark:text-[#fca5a5]" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-[#1a1208] dark:text-[#f5f0e8] tracking-tight">
            Payment Failed
          </h1>
          <p className="text-[#6b5e4e] dark:text-[#8a8278] text-sm leading-relaxed">
            Your payment could not be processed. Your booking has been cancelled and you were not charged.
          </p>
          <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278] mt-2 bg-black/[0.02] dark:bg-[#fff8dc]/[0.02] py-2 px-3 rounded-xl border border-black/[0.06] dark:border-[#fff8dc]/[0.05]">
            Please check your payment details or try a different payment method.
          </p>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <Link
            href="/properties"
            className="btn-primary w-full flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </Link>
          <a
            href="mailto:support@bokrastay.com"
            className="btn-secondary w-full flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <Mail className="w-4 h-4" />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
