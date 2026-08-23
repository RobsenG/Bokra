"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { uploadToSupabase } from "@/lib/supabase-server";
import { createAdminNotification } from "@/lib/notifications";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProperty(formData: FormData) {
  const session = await auth();

  if (
    !session?.user ||
    (session.user.role !== "HOST" && session.user.role !== "ADMIN")
  ) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const pricePerNight = parseFloat(formData.get("pricePerNight") as string);
  const bedrooms = parseInt(formData.get("bedrooms") as string, 10);
  const bathrooms = parseInt(formData.get("bathrooms") as string, 10);
  const maxGuests = parseInt(formData.get("maxGuests") as string, 10);

  // Amenities from a comma-separated string
  const amenitiesString = formData.get("amenities") as string;
  const amenities = amenitiesString
    ? amenitiesString.split(",").map((a) => a.trim())
    : [];

  // Check for duplicate property by address + city combination (case-insensitive)
  const existingProperty = await prisma.property.findFirst({
    where: {
      address: {
        equals: address.trim(),
        mode: "insensitive",
      },
      city: {
        equals: city.trim(),
        mode: "insensitive",
      },
    },
    include: {
      host: { select: { name: true, email: true } },
    },
  });

  if (existingProperty) {
    // Create an admin notification for duplicate attempt
    await createAdminNotification({
      type: "DUPLICATE_PROPERTY",
      message: `Host ${
        session.user.name || session.user.email
      } (${session.user.email}) attempted to add a property at "${address}, ${city}" which already exists (listed by ${
        existingProperty.host?.name || existingProperty.host?.email
      }).`,
      propertyId: existingProperty.id,
      reportedByUserId: session.user.id,
    });
  }

  // Image handling - accept pre-uploaded URLs from client or upload file inputs to "property-images" bucket
  const imageUrlsFromClient = formData.getAll("imageUrls") as string[];
  const imageUrls: string[] = imageUrlsFromClient.filter(
    (url) => typeof url === "string" && url.startsWith("https://")
  );

  const imageFiles = formData.getAll("images") as File[];
  for (const file of imageFiles) {
    if (file.size > 0) {
      const fileName = `${Date.now()}-${file.name.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      )}`;
      const url = await uploadToSupabase(file, "property-images", fileName);
      if (url && url.startsWith("https://")) {
        imageUrls.push(url);
      }
    }
  }

  // Fallback image if none uploaded
  if (imageUrls.length === 0) {
    imageUrls.push(
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80"
    );
  }

  // Create property listing
  const property = await prisma.property.create({
    data: {
      title,
      description,
      address,
      city,
      pricePerNight,
      bedrooms,
      bathrooms,
      maxGuests,
      amenities,
      images: imageUrls,
      hostId: session.user.id,
    },
  });

  // Handle property ownership proof files - accept pre-uploaded URLs or upload file inputs to "property-documents" bucket
  const docUrlsFromClient = formData.getAll("ownershipDocUrls") as string[];
  const propertyDocUrls: string[] = docUrlsFromClient.filter(
    (url) => typeof url === "string" && url.startsWith("https://")
  );

  const docFiles = formData.getAll("ownershipDocs") as File[];
  for (const file of docFiles) {
    if (file.size > 0) {
      const fileName = `doc-${Date.now()}-${file.name.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      )}`;
      const url = await uploadToSupabase(
        file,
        "property-documents",
        fileName
      );
      if (url && url.startsWith("https://")) {
        propertyDocUrls.push(url);
      }
    }
  }

  // Create Document records for property ownership proof
  if (propertyDocUrls.length > 0) {
    await prisma.document.createMany({
      data: propertyDocUrls.map((url) => ({
        type: "OWNERSHIP_PROOF",
        fileUrl: url,
        status: "PENDING",
        userId: session.user.id,
        propertyId: property.id,
      })),
    });
  }

  revalidatePath("/host/properties");
  revalidatePath("/admin/verifications");
  redirect("/host/properties");
}

export async function updateProperty(
  propertyId: string,
  formData: FormData,
  newDocumentUrls: string[] = [],
  removedDocumentIds: string[] = []
) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "HOST" && session.user.role !== "ADMIN")
  ) {
    throw new Error("Not authenticated");
  }

  // Confirm ownership
  const existing = await prisma.property.findFirst({
    where: { id: propertyId },
  });
  if (
    !existing ||
    (session.user.role !== "ADMIN" && existing.hostId !== session.user.id)
  ) {
    throw new Error("Property not found or access denied.");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const pricePerNight = parseFloat(formData.get("pricePerNight") as string);
  const bedrooms = parseInt(formData.get("bedrooms") as string, 10);
  const bathrooms = parseInt(formData.get("bathrooms") as string, 10);
  const maxGuests = parseInt(formData.get("maxGuests") as string, 10);
  const amenitiesString = formData.get("amenities") as string;
  const amenities = amenitiesString
    ? amenitiesString.split(",").map((a) => a.trim())
    : [];

  // Handle new images if provided - bucket must be "property-images"
  const imageFiles = formData.getAll("images") as File[];
  let imageUrls = existing.images;
  const newFiles = imageFiles.filter((f) => f.size > 0);
  if (newFiles.length > 0) {
    const uploaded: string[] = [];
    for (const file of newFiles) {
      const fileName = `${Date.now()}-${file.name.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      )}`;
      const url = await uploadToSupabase(file, "property-images", fileName);
      if (url && url.startsWith("https://")) {
        uploaded.push(url);
      }
    }
    if (uploaded.length > 0) {
      imageUrls = uploaded;
    }
  }

  // Reset status to PENDING on resubmission so admin reviews again
  await prisma.property.update({
    where: { id: propertyId },
    data: {
      title,
      description,
      address,
      city,
      pricePerNight,
      bedrooms,
      bathrooms,
      maxGuests,
      amenities,
      images: imageUrls,
      status: "PENDING",
      isVerified: false,
      rejectionReason: null, // clear old rejection reason
    },
  });

  // Remove documents marked for deletion
  if (removedDocumentIds.length > 0) {
    await prisma.document.deleteMany({
      where: {
        id: { in: removedDocumentIds },
        userId: session.user.id, // security check
      },
    });
  }

  // Add new documents
  if (newDocumentUrls.length > 0) {
    await prisma.document.createMany({
      data: newDocumentUrls
        .filter((url) => url.startsWith("https://"))
        .map((url) => ({
          type: "OWNERSHIP_PROOF",
          fileUrl: url,
          status: "PENDING",
          userId: session.user.id,
          propertyId: propertyId,
        })),
    });
  }

  // Create admin notification about resubmission
  await prisma.adminNotification.create({
    data: {
      type: "NEW_LISTING",
      message: `Host ${
        session.user.name || session.user.email
      } has resubmitted property "${title}" after rejection. Please review updated documents.`,
      propertyId: propertyId,
      reportedByUserId: session.user.id,
    },
  });

  revalidatePath("/host/properties");
  revalidatePath(`/host/properties/${propertyId}/edit`);
  revalidatePath(`/properties/${propertyId}`);
  revalidatePath("/admin/verifications");
  redirect("/host/properties");
}

export async function deleteProperty(propertyId: string) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "HOST" && session.user.role !== "ADMIN")
  ) {
    throw new Error("Unauthorized");
  }

  const existing = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!existing) {
    throw new Error("Property not found.");
  }

  if (session.user.role !== "ADMIN" && existing.hostId !== session.user.id) {
    throw new Error("Access denied.");
  }

  // Safely delete dependent records first to satisfy relational integrity
  await prisma.$transaction([
    prisma.review.deleteMany({ where: { propertyId } }),
    prisma.favorite.deleteMany({ where: { propertyId } }),
    prisma.document.deleteMany({ where: { propertyId } }),
    prisma.adminNotification.deleteMany({ where: { propertyId } }),
    prisma.payment.deleteMany({ where: { booking: { propertyId } } }),
    prisma.booking.deleteMany({ where: { propertyId } }),
    prisma.property.delete({ where: { id: propertyId } }),
  ]);

  revalidatePath("/host/properties");
  revalidatePath("/admin/verifications");
}
