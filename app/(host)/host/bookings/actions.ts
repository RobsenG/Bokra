"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function markBookingAsCompleted(bookingId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "HOST") {
    return { error: "Unauthorized" };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { property: { select: { hostId: true } } },
  });

  if (!booking || booking.property.hostId !== session.user.id) {
    return { error: "Booking not found or permission denied" };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "COMPLETED" },
  });

  revalidatePath(`/host/bookings/${bookingId}`);
  revalidatePath("/host/bookings");

  return { success: true };
}
