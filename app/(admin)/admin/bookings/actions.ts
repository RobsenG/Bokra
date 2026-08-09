"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function cancelBookingAdmin(bookingId: string, reason: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized. Admin access required." };
  }

  if (!reason || reason.trim().length < 5) {
    return { error: "Please provide a reason for cancelling this booking." };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true, property: { select: { title: true } } },
  });

  if (!booking) {
    return { error: "Booking not found." };
  }

  // Update booking status to CANCELLED
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });

  // If payment exists, update payment status to FAILED
  if (booking.payment) {
    await prisma.payment.update({
      where: { id: booking.payment.id },
      data: { status: "FAILED" },
    });
  }

  // Create AdminNotification for tracking
  await prisma.adminNotification.create({
    data: {
      type: "BOOKING_CANCELLED_BY_ADMIN",
      message: `Admin cancelled booking ${bookingId.slice(0, 8)} for "${booking.property.title}". Reason: ${reason.trim()}`,
      propertyId: booking.propertyId,
    },
  });

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/dashboard");
  revalidatePath("/host/bookings");

  return { success: true };
}
