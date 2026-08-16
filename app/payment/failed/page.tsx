"use client";

import Link from "next/link";
import { XCircle, RefreshCcw, Mail } from "lucide-react";

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white border border-[#e5e7eb] rounded-3xl shadow-xl overflow-hidden p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">
            Payment Failed
          </h1>
          <p className="text-[#6b7280] text-sm leading-relaxed">
            Your payment could not be processed. Your booking has been cancelled and you were not charged.
          </p>
          <p className="text-xs text-[#6b7280] mt-2 bg-[#f8fafc] py-2 px-3 rounded-xl border border-[#e5e7eb]">
            Please check your payment details or try a different payment method.
          </p>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <Link
            href="/properties"
            className="w-full flex items-center justify-center gap-2 bg-[#7c3aed] hover:bg-[#5b21b6] active:bg-[#4c1d95] text-white font-semibold py-3 rounded-xl transition-all shadow-[0_4px_14px_0_rgb(124_58_237_/0.25)] text-sm cursor-pointer"
          >
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </Link>
          <a
            href="mailto:support@bokrastay.com"
            className="w-full flex items-center justify-center gap-2 border-2 border-[#7c3aed] text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white font-semibold py-3 rounded-xl transition-all text-sm cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
