"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { uploadToSupabase } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProperty(formData: FormData) {
  const session = await auth();

  if (!session?.user || (session.user.role !== "HOST" && session.user.role !== "ADMIN")) {
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
  const amenities = amenitiesString ? amenitiesString.split(",").map((a) => a.trim()) : [];

  // Image handling
  const imageFiles = formData.getAll("images") as File[];
  const imageUrls: string[] = [];

  for (const file of imageFiles) {
    if (file.size > 0) {
      const fileName = `${Date.now()}-${file.name}`;
      const url = await uploadToSupabase(file, "properties", fileName);
      imageUrls.push(url);
    }
  }

  await prisma.property.create({
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

  revalidatePath("/(host)/properties");
  redirect("/properties"); // Redirect back to list
}
