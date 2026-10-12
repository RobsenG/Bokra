import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  sendBookingConfirmationEmail,
  sendHostBookingNotificationEmail,
} from "@/lib/email";

// Shared logic for processing the payment status update
async function processPayment(tx_ref: string, status: string) {
  if (!tx_ref || !status) {
    throw new Error("Missing required fields");
  }

  // Reference format: booking-${bookingId}
  const bookingId = tx_ref.replace("booking-", "");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      payment: true,
      property: {
        include: {
          host: true,
        },
      },
      renter: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  const isSuccess = status.toUpperCase() === "SUCCESS";
  const wasAlreadyConfirmed = booking.status === "CONFIRMED";

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

  if (isSuccess && !wasAlreadyConfirmed) {
    // Only send emails when transitioning to CONFIRMED for the first time
    const formattedCheckIn = booking.checkIn.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedCheckOut = booking.checkOut.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Send confirmation email to the renter
    try {
      await sendBookingConfirmationEmail({
        email: booking.renter.email,
        name: booking.renter.name || "Guest",
        propertyTitle: booking.property.title,
        propertyAddress: booking.property.address,
        propertyCity: booking.property.city,
        hostName: booking.property.host.name || "Your Host",
        hostEmail: booking.property.host.email,
        hostPhone: booking.property.host.phone ?? null,
        checkIn: formattedCheckIn,
        checkOut: formattedCheckOut,
        totalPrice: Number(booking.totalPrice),
        bookingId: booking.id,
        chapaReference: booking.payment?.chapaReference ?? null,
      });
    } catch (err) {
      console.error("Failed to send renter confirmation email:", err);
    }

    // Send notification email to the host
    try {
      await sendHostBookingNotificationEmail({
        hostEmail: booking.property.host.email,
        hostName: booking.property.host.name || "Host",
        renterName: booking.renter.name || "Guest",
        propertyTitle: booking.property.title,
        checkIn: formattedCheckIn,
        checkOut: formattedCheckOut,
        totalPrice: Number(booking.totalPrice),
        bookingId: booking.id,
      });
    } catch (err) {
      console.error("Failed to send host notification email:", err);
    }
  }

  return bookingId;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tx_ref = searchParams.get("tx_ref") || searchParams.get("trx_ref");
    const status = searchParams.get("status");

    console.log(`[Webhook GET] Received tx_ref: ${tx_ref}, status: ${status}`);

    if (!tx_ref || !status) {
      return NextResponse.redirect(new URL("/payment/failed", req.url));
    }

    const bookingId = await processPayment(tx_ref, status);
    console.log(`[Webhook GET] Processed bookingId: ${bookingId}`);

    if (status.toUpperCase() === "SUCCESS") {
      return NextResponse.redirect(
        new URL(`/renter/bookings?message=Booking confirmed successfully!`, req.url)
      );
    } else {
      return NextResponse.redirect(
        new URL(`/renter/bookings?error=Payment was declined or failed.`, req.url)
      );
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to verify payment.";
    console.error("[Webhook GET Error]:", error);
    return NextResponse.redirect(
      new URL(`/renter/bookings?error=${encodeURIComponent(message)}`, req.url)
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // TODO: Verify Chapa webhook signature in production
    // const chapaSignature = req.headers.get('chapa-signature')

    const body = await req.json();
    const tx_ref = body.tx_ref || body.trx_ref;
    const status = body.status;

    console.log(`[Webhook POST] Received tx_ref: ${tx_ref}, status: ${status}`);

    await processPayment(tx_ref, status);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error("[Webhook POST Error]:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
