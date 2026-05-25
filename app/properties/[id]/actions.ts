"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function bookProperty(propertyId: string, checkInStr: string, checkOutStr: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("You must be logged in to book a property.");
  }

  const checkIn = new Date(checkInStr);
  const checkOut = new Date(checkOutStr);

  if (checkIn >= checkOut) {
    throw new Error("Check-out date must be after check-in date.");
  }

  // Find the property to calculate price
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new Error("Property not found.");
  }

  // Calculate total price
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  const totalPrice = Number(property.pricePerNight) * nights;

  // Availability Logic: Check for overlapping bookings
  const overlapping = await prisma.booking.findFirst({
    where: {
      propertyId,
      status: { in: ["PENDING", "CONFIRMED"] },
      AND: [
        { checkIn: { lt: checkOut } },
        { checkOut: { gt: checkIn } }
      ]
    }
  });

  if (overlapping) {
    throw new Error("The property is not available for the selected dates.");
  }

  // Create booking
  await prisma.booking.create({
    data: {
      checkIn,
      checkOut,
      totalPrice,
      renterId: session.user.id,
      propertyId,
      status: "PENDING",
    },
  });

  revalidatePath(`/properties/${propertyId}`);
  revalidatePath("/(renter)/bookings");
}
