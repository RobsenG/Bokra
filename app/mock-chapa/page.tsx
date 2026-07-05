"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { CreditCard, Shield, ShieldAlert, Sparkles, Building2 } from "lucide-react";

function MockChapaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const txRef = searchParams.get("tx_ref") || "unknown";
  const amount = searchParams.get("amount") || "0";
  const returnUrl = searchParams.get("return_url") || "/renter/bookings";

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"pending" | "success" | "failed">("pending");

  const handleSimulate = async (success: boolean) => {
    setLoading(true);
    try {
      // Call local webhook to finalize booking status
      const res = await fetch("/api/payments/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tx_ref: txRef,
          status: success ? "SUCCESS" : "FAILED",
        }),
      });

      if (!res.ok) throw new Error("Webhook verification failed");

      setStatus(success ? "success" : "failed");
      setTimeout(() => {
        router.push(returnUrl);
      }, 1500);
    } catch (err) {
      console.error(err);
      alert("Simulated transaction error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* Brand header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center text-white font-extrabold text-lg">
              B
            </div>
            <span className="font-extrabold text-neutral-800 dark:text-white text-base tracking-tight">
              Chapa <span className="text-teal-600 dark:text-teal-400 font-medium">Simulator</span>
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/20 px-2 py-0.5 rounded-full">
            Dev Mode
          </span>
        </div>

        {status === "pending" ? (
          <>
            {/* Payment Summary */}
            <div className="bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl p-4 text-center space-y-1">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Payment Amount</p>
              <p className="text-3xl font-black text-teal-700 dark:text-teal-300">
                {Number(amount).toLocaleString()} ETB
              </p>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate pt-1">
                Ref: {txRef}
              </p>
            </div>

            {/* Simulated Form */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value="•••• •••• •••• 1234 (Simulated)"
                    className="w-full h-11 px-4 pl-10 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-sm outline-none text-neutral-600 dark:text-neutral-350"
                  />
                  <CreditCard className="size-4 text-neutral-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Expiry</label>
                  <input
                    type="text"
                    disabled
                    value="12/29"
                    className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-sm outline-none text-neutral-600 dark:text-neutral-350"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">CVV</label>
                  <input
                    type="text"
                    disabled
                    value="•••"
                    className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-sm outline-none text-neutral-600 dark:text-neutral-350"
                  />
                </div>
              </div>
            </div>

            {/* Simulation controls */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => handleSimulate(true)}
                disabled={loading}
                className="w-full h-11 rounded-xl text-sm font-semibold bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-md shadow-teal-600/10 flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {loading ? "Processing..." : "Pay Now ✓"}
              </button>
              <button
                onClick={() => handleSimulate(false)}
                disabled={loading}
                className="w-full h-11 rounded-xl text-sm font-semibold border border-red-200 dark:border-red-900/30 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer"
              >
                Decline Payment ✗
              </button>
            </div>
          </>
        ) : status === "success" ? (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Shield className="size-6" />
            </div>
            <h2 className="text-xl font-bold text-neutral-800 dark:text-white">Payment Successful!</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Your booking is confirmed. Redirecting you...
            </p>
          </div>
        ) : (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400">
              <ShieldAlert className="size-6" />
            </div>
            <h2 className="text-xl font-bold text-neutral-800 dark:text-white">Payment Declined</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              The transaction failed. Redirecting you to retry...
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="text-[10px] text-center text-neutral-400 dark:text-neutral-500">
          This is a simulated Chapa gateway for testing Bokra Stay.
        </p>
      </div>
    </div>
  );
}

export default function MockChapaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center">
        <p className="text-sm text-neutral-500">Loading simulated gateway...</p>
      </div>
    }>
      <MockChapaContent />
    </Suspense>
  );
}
