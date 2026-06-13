"use client";

import { useState } from "react";
import { cancelBooking } from "./actions";

interface CancelBookingButtonProps {
  bookingId: string;
  disabled?: boolean;
}

export default function CancelBookingButton({ bookingId, disabled = false }: CancelBookingButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    const confirm = window.confirm("Are you sure you want to cancel this booking? This will cancel your reservation.");
    if (!confirm) return;

    setLoading(true);
    try {
      await cancelBooking(bookingId);
      alert("Booking cancelled successfully.");
    } catch (error: any) {
      alert(error.message || "Failed to cancel booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={loading || disabled}
      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      {loading ? "Cancelling..." : "Cancel Booking"}
    </button>
  );
}
