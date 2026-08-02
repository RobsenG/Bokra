import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import EditPropertyForm from "./EditPropertyForm";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  let property = null;
  try {
    property = await prisma.property.findFirst({
      where: { id, hostId: session.user.id },
    });
  } catch (error) {
    console.error("[DB Error] Could not fetch property:", error);
  }

  if (!property) notFound();

  return (
    <EditPropertyForm
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
        rejectionReason: property.rejectionReason ?? null,
      }}
    />
  );
}
