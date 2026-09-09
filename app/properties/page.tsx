import prisma from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/lib/auth";
import FavoriteButton from "@/components/common/FavoriteButton";
import SearchForm from "@/components/common/SearchForm";
import { MapPin, Compass, BadgeCheck, Star, Award } from "lucide-react";

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{
    city?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    minPrice?: string;
    maxPrice?: string;
    bedrooms?: string;
  }>;
}) {
  const session = await auth();
  const { city, checkIn, checkOut, guests, minPrice, maxPrice, bedrooms } =
    await searchParams;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filters: any = {
    isVerified: true,
    isAvailable: true,
  };

  if (city) {
    filters.city = { contains: city, mode: "insensitive" };
  }
  if (guests) {
    filters.maxGuests = { gte: parseInt(guests, 10) };
  }
  if (bedrooms) {
    filters.bedrooms = { gte: parseInt(bedrooms, 10) };
  }
  if (minPrice || maxPrice) {
    filters.pricePerNight = {};
    if (minPrice) {
      filters.pricePerNight.gte = parseFloat(minPrice);
    }
    if (maxPrice) {
      filters.pricePerNight.lte = parseFloat(maxPrice);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let properties: any[] = [];
  let userFavoriteIds = new Set<string>();

  try {
    properties = await prisma.property.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            avatar: true,
            isVerified: true,
            trustBadge: true,
            adminVerifiedName: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    if (session?.user) {
      const favorites = await prisma.favorite.findMany({
        where: { userId: session.user.id },
        select: { propertyId: true },
      });
      userFavoriteIds = new Set(favorites.map((f) => f.propertyId));
    }
  } catch (error) {
    console.error("[DB Error] Could not fetch properties:", error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full font-sans">
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white mb-6">
          Browse properties
        </h1>
        <SearchForm />
      </div>

      <hr className="border-neutral-200 dark:border-neutral-800 my-8" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-8">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            {city ? `Stays in "${city}"` : "Verified properties"}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {properties.length} {properties.length === 1 ? "property" : "properties"}{" "}
            found
          </p>
        </div>
        {city && (
          <Link
            href="/properties"
            className="border-2 border-[#b8943d] dark:border-[#c9a84c] text-[#b8943d] dark:text-[#c9a84c] hover:bg-[#b8943d] dark:hover:bg-[#c9a84c] hover:text-white dark:hover:text-black font-semibold text-xs px-4 py-2 rounded-xl transition-all duration-200"
          >
            Clear filters
          </Link>
        )}
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl bg-white dark:bg-[#12121e] max-w-lg mx-auto">
          <Compass className="w-10 h-10 text-neutral-400 dark:text-neutral-500 mx-auto mb-3.5" />
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">
            No properties found
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-sm mx-auto px-4">
            No properties match your search. Try different filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const totalRating = property.reviews.reduce(
              (acc: number, review: any) => acc + review.rating,
              0
            );
            const averageRating =
              property.reviews.length > 0
                ? (totalRating / property.reviews.length).toFixed(1)
                : null;

            const host = property.host;
            const hostDisplayName = host?.name || "Host";
            const hostInitial = (host?.name || "H")[0].toUpperCase();
            const hasValidAvatar =
              host?.avatar &&
              typeof host.avatar === "string" &&
              host.avatar.startsWith("https://");
            const hostBadge = host?.trustBadge || (host?.isVerified ? "Verified Host" : null);

            return (
              <Link
                href={`/properties/${property.id}`}
                key={property.id}
                className="group"
              >
                <article className="bg-white dark:bg-[#12121e] rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-xl hover:shadow-[#b8943d]/10 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                    {property.images[0] ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <MapPin className="w-8 h-8" />
                      </div>
                    )}

                    {/* Location Badge */}
                    <span className="absolute top-3 left-3 bg-white/90 dark:bg-[#12121e]/90 backdrop-blur-md text-neutral-900 dark:text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs border border-neutral-200/50 dark:border-neutral-700/50">
                      {property.city}
                    </span>

                    {/* Verification Badge */}
                    {property.isVerified && (
                      <span className="absolute top-3 right-14 bg-[#b8943d] dark:bg-[#c9a84c] text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 z-10">
                        <BadgeCheck className="w-3 h-3 text-white fill-white" /> Verified
                      </span>
                    )}

                    <FavoriteButton
                      propertyId={property.id}
                      initialIsFavorited={userFavoriteIds.has(property.id)}
                    />

                    {/* Host Badge Bar at bottom of image */}
                    {host && (
                      <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#b8943d] text-white font-bold text-[10px] flex items-center justify-center overflow-hidden border border-white/40 shrink-0">
                            {hasValidAvatar ? (
                              <img
                                src={host.avatar}
                                alt={hostDisplayName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              hostInitial
                            )}
                          </div>
                          <span className="font-medium text-[11px] truncate max-w-[120px]">
                            {hostDisplayName}
                          </span>
                        </div>
                        {hostBadge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#b8943d] dark:bg-[#c9a84c] text-white flex items-center gap-1 shrink-0">
                            <Award className="size-3" />
                            {hostBadge}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Content Container */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-neutral-900 dark:text-white line-clamp-1 group-hover:text-[#b8943d] dark:group-hover:text-[#c9a84c] transition-colors text-base">
                          {property.title}
                        </h3>
                        {averageRating ? (
                          <div className="flex items-center gap-1 text-amber-500 text-xs font-bold shrink-0">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{averageRating}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-semibold text-neutral-400 shrink-0">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                        {property.description}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                        <span>{property.bedrooms} beds</span>
                        <span>·</span>
                        <span>{property.bathrooms} baths</span>
                        <span>·</span>
                        <span>{property.maxGuests} guests</span>
                      </div>

                      <div className="flex items-center justify-between pt-3">
                        <p className="text-neutral-500 dark:text-neutral-400 text-xs font-medium">Price per night</p>
                        <p className="font-extrabold text-[#b8943d] dark:text-[#c9a84c] text-lg">
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
