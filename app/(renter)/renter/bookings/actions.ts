"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendBookingCancellationEmail } from "@/lib/email";

export async function cancelBooking(bookingId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Find the booking and verify ownership (must belong to the renter)
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { 
      payment: true,
      property: true,
      renter: true
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.renterId !== session.user.id) {
    throw new Error("You do not have permission to cancel this booking");
  }

  if (booking.status === "COMPLETED") {
    throw new Error("Cannot cancel a completed booking");
  }

  if (booking.status === "CANCELLED") {
    throw new Error("Booking is already cancelled");
  }

  // Update booking status
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });

  // If there is a successful payment, we would mark it as refunded, or delete/update the payment status.
  // For simplicity, let's update payment status to FAILED or leave it. We will update it to FAILED if it was pending,
  // or handle refund logic. Here we just update payment if exists.
  if (booking.payment) {
    await prisma.payment.update({
      where: { id: booking.payment.id },
      data: { status: "FAILED" },
    });
  }

  // Send cancellation email
  await sendBookingCancellationEmail({
    email: booking.renter.email,
    name: booking.renter.name || "Guest",
    propertyTitle: booking.property.title,
  });

  revalidatePath("/renter/bookings");
  revalidatePath("/host/bookings");
}
