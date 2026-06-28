import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MapPin, BadgeCheck, Star, Compass } from "lucide-react";
import FavoriteButton from "@/components/common/FavoriteButton";

export default async function FavoritesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  let favorites: any[] = [];
  try {
    favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        property: {
          include: {
            reviews: { select: { rating: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("[DB Error] Could not fetch favorites:", error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-800 dark:text-white tracking-tight">Your Favorites</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Properties you have saved to your wishlist.
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl bg-white dark:bg-neutral-900/50 max-w-lg mx-auto">
          <Compass className="size-10 text-neutral-400 mx-auto mb-3.5" />
          <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200 mb-1">No saved properties yet</h3>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-sm mx-auto px-4 mb-6">
            When you find a stay you love, tap the heart icon to save it for later.
          </p>
          <Link href="/">
            <button className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold h-10 px-5 rounded-xl transition-all shadow-sm cursor-pointer">
              Explore Stays
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(({ property }) => {
            const totalRating = property.reviews.reduce((acc: number, review: any) => acc + review.rating, 0);
            const averageRating = property.reviews.length > 0 ? (totalRating / property.reviews.length).toFixed(1) : null;

            return (
              <Link href={`/properties/${property.id}`} key={property.id} className="group">
                <article className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  {/* Image container */}
                  <div className="relative aspect-video w-full overflow-hidden bg-neutral-200">
                    {property.images[0] ? (
                      <img 
                        src={property.images[0]} 
                        alt={property.title} 
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-teal-50 dark:bg-teal-950/20 text-teal-600/60 dark:text-teal-400/40">
                        <MapPin className="size-8" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-white/95 dark:bg-neutral-900/95 text-neutral-800 dark:text-neutral-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                      {property.city}
                    </span>
                    {property.isVerified && (
                      <span className="absolute top-3 right-14 bg-teal-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 z-10">
                        <BadgeCheck className="size-3 text-white fill-white" /> Verified
                      </span>
                    )}
                    <FavoriteButton 
                      propertyId={property.id} 
                      initialIsFavorited={true} 
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-neutral-800 dark:text-neutral-200 line-clamp-1 group-hover:text-teal-600 transition-colors text-lg">
                          {property.title}
                        </h3>
                        {averageRating && (
                          <div className="flex items-center gap-1 text-orange-500 text-sm font-semibold shrink-0">
                            <Star className="size-3.5 fill-orange-500 text-orange-500" />
                            <span>{averageRating}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                        {property.description}
                      </p>
                    </div>

                    <div>
                      <div className="flex gap-3 text-xs text-neutral-500 dark:text-neutral-400 pb-3 border-b border-neutral-100 dark:border-neutral-800/60">
                        <span>{property.bedrooms} Beds</span>
                        <span>•</span>
                        <span>{property.bathrooms} Baths</span>
                        <span>•</span>
                        <span>{property.maxGuests} Guests</span>
                      </div>

                      <div className="flex items-center justify-between pt-3">
                        <p className="text-neutral-500 dark:text-neutral-400 text-xs">Price per night</p>
                        <p className="font-extrabold text-teal-700 dark:text-teal-300 text-lg">
                          {Number(property.pricePerNight).toLocaleString()} ETB
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
