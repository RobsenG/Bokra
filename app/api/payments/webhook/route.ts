import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { tx_ref, status } = await req.json();

    if (!tx_ref || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Reference format: booking-${bookingId}
    const bookingId = tx_ref.replace("booking-", "");

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const isSuccess = status === "SUCCESS";

    await prisma.$transaction([
      // Update or create payment
      prisma.payment.upsert({
        where: { bookingId },
        update: {
          status: isSuccess ? "SUCCESS" : "FAILED",
        },
        create: {
          bookingId,
          amount: booking.totalPrice,
          currency: "ETB",
          status: isSuccess ? "SUCCESS" : "FAILED",
          chapaReference: tx_ref,
        },
      }),
      // Update booking status
      prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: isSuccess ? "CONFIRMED" : "CANCELLED",
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
