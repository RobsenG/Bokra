"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/app/(renter)/renter/favorites/actions";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  propertyId: string;
  initialIsFavorited?: boolean;
}

export default function FavoriteButton({ propertyId, initialIsFavorited = false }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to the property page if wrapped in a link
    e.stopPropagation();

    setIsLoading(true);
    // Optimistic update
    setIsFavorited(!isFavorited);

    try {
      const result = await toggleFavorite(propertyId);
      setIsFavorited(result.isFavorited);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Please log in to save properties.");
      setIsFavorited(initialIsFavorited); // Revert on failure
      if (error.message.includes("logged in")) {
        router.push("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md shadow-sm transition-all hover:scale-110 active:scale-95 z-10 cursor-pointer ${
        isFavorited
          ? "bg-white/90 text-rose-500"
          : "bg-black/20 text-white hover:bg-black/40"
      }`}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={`size-5 transition-all ${
          isFavorited ? "fill-rose-500 stroke-rose-500" : "stroke-white"
        }`}
      />
    </button>
  );
}
