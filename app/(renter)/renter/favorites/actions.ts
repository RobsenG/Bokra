"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(propertyId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("You must be logged in to save favorites");
  }

  const userId = session.user.id;

  const existingFavorite = await prisma.favorite.findUnique({
    where: {
      userId_propertyId: {
        userId,
        propertyId,
      },
    },
  });

  if (existingFavorite) {
    await prisma.favorite.delete({
      where: { id: existingFavorite.id },
    });
  } else {
    await prisma.favorite.create({
      data: {
        userId,
        propertyId,
      },
    });
  }

  // Revalidate routes where favorites might be displayed
  revalidatePath("/");
  revalidatePath("/properties/[id]");
  revalidatePath("/renter/favorites");

  return { success: true, isFavorited: !existingFavorite };
}
