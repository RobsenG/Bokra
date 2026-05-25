"use client";

import { useState } from "react";
import { bookProperty } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function BookingForm({ 
  propertyId, 
  pricePerNight 
}: { 
  propertyId: string;
  pricePerNight: number;
}) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const calculateTotalPrice = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (start >= end) return 0;
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights * pricePerNight;
  };

  const totalPrice = calculateTotalPrice();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await bookProperty(propertyId, checkIn, checkOut);
      // Redirect to bookings dashboard upon success
      router.push("/bookings");
    } catch (err: any) {
      setError(err.message || "An error occurred while booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-100 text-red-800 rounded-md text-sm">{error}</div>}
      
      <div className="space-y-2">
        <Label htmlFor="checkIn">Check-in Date</Label>
        <Input 
          type="date" 
          id="checkIn" 
          required 
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="checkOut">Check-out Date</Label>
        <Input 
          type="date" 
          id="checkOut" 
          required 
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          min={checkIn || new Date().toISOString().split("T")[0]}
        />
      </div>

      <div className="flex justify-between items-center py-4 border-t border-b border-muted">
        <span className="font-medium">Total</span>
        <span className="text-xl font-bold">${totalPrice.toFixed(2)}</span>
      </div>

      <Button type="submit" className="w-full" disabled={loading || totalPrice <= 0}>
        {loading ? "Booking..." : "Reserve Now"}
      </Button>
    </form>
  );
}
