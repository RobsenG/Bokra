"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { retryPayment } from "./actions";

export default function PayNowButton({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const { checkoutUrl } = await retryPayment(bookingId);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error("Failed to retry payment", error);
      alert("Failed to initialize payment. Please try again.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="flex items-center gap-1 text-xs font-bold text-[#0c0b09] bg-[#c9a84c] hover:bg-[#d4b458] px-3 py-1.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 shadow-sm"
    >
      {loading ? <Loader2 className="size-3 animate-spin" /> : <CreditCard className="size-3" />}
      <span>Pay Now</span>
    </button>
  );
}
