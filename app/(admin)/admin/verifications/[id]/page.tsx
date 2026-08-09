import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import VerificationDetailClient from "./VerificationDetailClient";

export default async function AdminVerificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      host: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          selfieUrl: true,
          selfieVerifiedAt: true,
          isVerified: true,
          termsAcceptedAt: true,
          createdAt: true,
          documents: {
            orderBy: { uploadedAt: "desc" },
          },
          properties: {
            select: {
              id: true,
              title: true,
              status: true,
              isVerified: true,
              createdAt: true,
              _count: {
                select: { bookings: true, reviews: true },
              },
            },
          },
          bookings: {
            take: 5,
            orderBy: { createdAt: "desc" },
            include: { property: { select: { title: true } } },
          },
          _count: {
            select: {
              properties: true,
              bookings: true,
              reviews: true,
            },
          },
        },
      },
      bookings: {
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          renter: { select: { name: true, email: true } },
          payment: true,
        },
      },
      reviews: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          renter: { select: { name: true } },
        },
      },
    },
  });

  if (!property) {
    notFound();
  }

  return (
    <VerificationDetailClient
      property={{
        id: property.id,
        title: property.title,
        description: property.description,
        address: property.address,
        city: property.city,
        pricePerNight: Number(property.pricePerNight),
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        maxGuests: property.maxGuests,
        amenities: property.amenities,
        images: property.images,
        status: property.status,
        isVerified: property.isVerified,
        rejectionReason: property.rejectionReason,
        createdAt: property.createdAt.toISOString(),
        host: {
          id: property.host.id,
          name: property.host.name,
          email: property.host.email,
          phone: property.host.phone,
          avatar: property.host.avatar,
          selfieUrl: property.host.selfieUrl,
          selfieVerifiedAt: property.host.selfieVerifiedAt?.toISOString() ?? null,
          isVerified: property.host.isVerified,
          termsAcceptedAt: property.host.termsAcceptedAt?.toISOString() ?? null,
          createdAt: property.host.createdAt.toISOString(),
          documents: property.host.documents.map((d) => ({
            id: d.id,
            type: d.type,
            fileUrl: d.fileUrl,
            status: d.status,
            uploadedAt: d.uploadedAt.toISOString(),
          })),
          properties: property.host.properties.map((p) => ({
            id: p.id,
            title: p.title,
            status: p.status,
            isVerified: p.isVerified,
            createdAt: p.createdAt.toISOString(),
            _count: p._count,
          })),
          bookings: property.host.bookings.map((b) => ({
            id: b.id,
            checkIn: b.checkIn.toISOString(),
            checkOut: b.checkOut.toISOString(),
            totalPrice: Number(b.totalPrice),
            status: b.status,
            createdAt: b.createdAt.toISOString(),
            property: { title: b.property.title },
          })),
          _count: property.host._count,
        },
        bookings: property.bookings.map((b) => ({
          id: b.id,
          checkIn: b.checkIn.toISOString(),
          checkOut: b.checkOut.toISOString(),
          totalPrice: Number(b.totalPrice),
          status: b.status,
          createdAt: b.createdAt.toISOString(),
          renter: b.renter,
          payment: b.payment
            ? {
                status: b.payment.status,
                amount: Number(b.payment.amount),
              }
            : null,
        })),
        reviews: property.reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt.toISOString(),
          renter: r.renter,
        })),
      }}
    />
  );
}
