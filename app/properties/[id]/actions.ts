"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { initializeChapaPayment } from "@/lib/chapa";
import { revalidatePath } from "next/cache";

export async function bookProperty(propertyId: string, checkInStr: string, checkOutStr: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("You must be logged in to book a property.");
  }

  // Get full user details for payment gateway
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    throw new Error("User session invalid.");
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
  const booking = await prisma.booking.create({
    data: {
      checkIn,
      checkOut,
      totalPrice,
      renterId: session.user.id,
      propertyId,
      status: "PENDING",
    },
  });

  // Split name for Chapa parameters
  const [firstName = "Guest", lastName = "User"] = (user.name || "").split(" ");

  // Initialize Chapa payment flow
  const checkoutUrl = await initializeChapaPayment({
    amount: totalPrice,
    email: user.email,
    firstName,
    lastName,
    txRef: `booking-${booking.id}`,
    returnUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/renter/bookings`,
  });

  revalidatePath(`/properties/${propertyId}`);
  revalidatePath("/renter/bookings");

  return { checkoutUrl };
}
