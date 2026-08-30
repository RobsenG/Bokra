import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminBookingsClient from "./AdminBookingsClient";

export default async function AdminBookingsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const bookings = await prisma.booking.findMany({
    include: {
      renter: {
        select: { name: true, email: true, avatar: true },
      },
      property: {
        select: {
          title: true,
          city: true,
          host: { select: { name: true, email: true } },
        },
      },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-800 dark:text-white tracking-tight">
          Bookings
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          View all platform bookings.
        </p>
      </div>

      <AdminBookingsClient
        bookings={bookings.map((b) => ({
          id: b.id,
          checkIn: b.checkIn.toISOString(),
          checkOut: b.checkOut.toISOString(),
          totalPrice: Number(b.totalPrice),
          status: b.status,
          createdAt: b.createdAt.toISOString(),
          renter: b.renter,
          property: b.property,
          payment: b.payment
            ? {
                id: b.payment.id,
                amount: Number(b.payment.amount),
                currency: b.payment.currency,
                status: b.payment.status,
                chapaReference: b.payment.chapaReference,
                createdAt: b.payment.createdAt.toISOString(),
              }
            : null,
        }))}
      />
    </div>
  );
}
