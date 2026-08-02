import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import BookingDetailClient from "./BookingDetailClient";

export default async function HostBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      renter: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          createdAt: true,
        },
      },
      property: {
        select: {
          id: true,
          title: true,
          address: true,
          city: true,
          images: true,
          pricePerNight: true,
          hostId: true,
        },
      },
      payment: true,
    },
  });

  if (!booking) {
    notFound();
  }

  // Security: make sure this booking belongs to this host
  if (booking.property.hostId !== session.user.id) {
    redirect("/host/bookings");
  }

  // Check total bookings count by this renter to determine guest status badge
  const renterBookingsCount = await prisma.booking.count({
    where: { renterId: booking.renter.id },
  });

  return (
    <BookingDetailClient
      booking={{
        id: booking.id,
        checkIn: booking.checkIn.toISOString(),
        checkOut: booking.checkOut.toISOString(),
        totalPrice: Number(booking.totalPrice),
        status: booking.status,
        createdAt: booking.createdAt.toISOString(),
        renter: {
          id: booking.renter.id,
          name: booking.renter.name,
          email: booking.renter.email,
          phone: booking.renter.phone,
          avatar: booking.renter.avatar,
          createdAt: booking.renter.createdAt.toISOString(),
          isReturning: renterBookingsCount > 1,
        },
        property: {
          id: booking.property.id,
          title: booking.property.title,
          address: booking.property.address,
          city: booking.property.city,
          images: booking.property.images,
          pricePerNight: Number(booking.property.pricePerNight),
        },
        payment: booking.payment
          ? {
              id: booking.payment.id,
              amount: Number(booking.payment.amount),
              currency: booking.payment.currency,
              status: booking.payment.status,
              chapaReference: booking.payment.chapaReference,
              createdAt: booking.payment.createdAt.toISOString(),
            }
          : null,
      }}
    />
  );
}
