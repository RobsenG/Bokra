"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { CreditCard, Shield, ShieldAlert } from "lucide-react";

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
    <div className="min-h-screen bg-[#faf9f7] dark:bg-[#0c0b09] flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-[#141310] border border-black/[0.08] dark:border-[#fff8dc]/[0.06] rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* Brand header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-[#fff8dc]/[0.05]">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-[#b8943d] dark:bg-[#c9a84c] flex items-center justify-center text-white dark:text-[#0c0b09] font-extrabold text-lg">
              B
            </div>
            <span className="font-extrabold text-[#1a1208] dark:text-[#f5f0e8] text-base tracking-tight">
              Chapa <span className="text-[#b8943d] dark:text-[#c9a84c] font-medium">Simulator</span>
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#b8943d] dark:text-[#c9a84c] bg-[#b8943d]/[0.08] dark:bg-[rgba(201,168,76,0.08)] px-2.5 py-0.5 rounded-full border border-[#b8943d]/20 dark:border-[rgba(201,168,76,0.15)]">
            Dev Mode
          </span>
        </div>

        {status === "pending" ? (
          <>
            {/* Payment Summary */}
            <div className="bg-black/[0.02] dark:bg-[#fff8dc]/[0.02] rounded-2xl p-4 text-center space-y-1 border border-black/[0.06] dark:border-[#fff8dc]/[0.05]">
              <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278] font-medium">Payment Amount</p>
              <p className="text-3xl font-black text-[#b8943d] dark:text-[#c9a84c]">
                {Number(amount).toLocaleString()} ETB
              </p>
              <p className="text-[10px] text-[#9b8e7e] dark:text-[#524d47] truncate pt-1">
                Ref: {txRef}
              </p>
            </div>

            {/* Simulated Form */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b5e4e] dark:text-[#524d47]">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value="•••• •••• •••• 1234 (Simulated)"
                    className="w-full h-11 px-4 pl-10 rounded-xl border border-black/[0.08] dark:border-[#fff8dc]/[0.07] bg-black/[0.03] dark:bg-[#fff8dc]/[0.03] text-sm outline-none text-[#1a1208] dark:text-[#d4cfc7]"
                  />
                  <CreditCard className="size-4 text-[#b8943d] dark:text-[#c9a84c] absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b5e4e] dark:text-[#524d47]">Expiry</label>
                  <input
                    type="text"
                    disabled
                    value="12/29"
                    className="w-full h-11 px-4 rounded-xl border border-black/[0.08] dark:border-[#fff8dc]/[0.07] bg-black/[0.03] dark:bg-[#fff8dc]/[0.03] text-sm outline-none text-[#1a1208] dark:text-[#d4cfc7]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b5e4e] dark:text-[#524d47]">CVV</label>
                  <input
                    type="text"
                    disabled
                    value="•••"
                    className="w-full h-11 px-4 rounded-xl border border-black/[0.08] dark:border-[#fff8dc]/[0.07] bg-black/[0.03] dark:bg-[#fff8dc]/[0.03] text-sm outline-none text-[#1a1208] dark:text-[#d4cfc7]"
                  />
                </div>
              </div>
            </div>

            {/* Simulation controls */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => handleSimulate(true)}
                disabled={loading}
                className="btn-primary w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {loading ? "Processing..." : "Pay Now ✓"}
              </button>
              <button
                onClick={() => handleSimulate(false)}
                disabled={loading}
                className="btn-danger w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer"
              >
                Decline Payment ✗
              </button>
            </div>
          </>
        ) : status === "success" ? (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 dark:bg-[rgba(34,197,94,0.08)] flex items-center justify-center text-emerald-600 dark:text-[#86efac]">
              <Shield className="size-6" />
            </div>
            <h2 className="text-xl font-bold text-[#1a1208] dark:text-[#f5f0e8]">Payment Successful!</h2>
            <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278]">
              Your booking is confirmed. Redirecting you...
            </p>
          </div>
        ) : (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 dark:bg-[rgba(239,68,68,0.08)] flex items-center justify-center text-red-600 dark:text-[#fca5a5]">
              <ShieldAlert className="size-6" />
            </div>
            <h2 className="text-xl font-bold text-[#1a1208] dark:text-[#f5f0e8]">Payment Declined</h2>
            <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278]">
              The transaction failed. Redirecting you to retry...
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="text-[10px] text-center text-[#9b8e7e] dark:text-[#524d47]">
          This is a simulated Chapa gateway for testing Bokra Stay.
        </p>
      </div>
    </div>
  );
}

export default function MockChapaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#faf9f7] dark:bg-[#0c0b09] flex flex-col items-center justify-center">
        <p className="text-sm text-[#6b5e4e] dark:text-[#8a8278]">Loading simulated gateway...</p>
      </div>
    }>
      <MockChapaContent />
    </Suspense>
  );
}
