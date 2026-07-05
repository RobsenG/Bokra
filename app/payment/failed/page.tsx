"use client";

import Link from "next/link";
import { XCircle, RefreshCcw, Mail } from "lucide-react";

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl shadow-xl overflow-hidden p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center">
            <XCircle className="size-10 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Payment Failed
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
            Your payment could not be processed. Your booking has been cancelled and you were not charged.
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2 bg-neutral-50 dark:bg-neutral-800/50 py-2 px-3 rounded-md">
            Please check your payment details or try a different payment method.
          </p>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <Link
            href="/properties"
            className="w-full flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-950 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 text-white font-semibold py-3 rounded-xl transition-all shadow-md"
          >
            <RefreshCcw className="size-4" />
            Try Again
          </Link>
          <a
            href="mailto:support@bokrastay.com"
            className="w-full flex items-center justify-center gap-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold py-3 rounded-xl transition-all"
          >
            <Mail className="size-4" />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
