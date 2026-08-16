import prisma from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/lib/auth";
import FavoriteButton from "@/components/common/FavoriteButton";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import SearchForm from "@/components/common/SearchForm";
import { MapPin, Compass, BadgeCheck, Star } from "lucide-react";

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
  const { city, checkIn, checkOut, guests, minPrice, maxPrice, bedrooms } = await searchParams;

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

  let properties: any[] = [];
  let userFavoriteIds = new Set<string>();

  try {
    properties = await prisma.property.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
      include: {
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
    <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-3xl font-extrabold text-[#111827] mb-6">
            Search Properties
          </h1>
          <SearchForm />
        </div>

        <hr className="border-[#e5e7eb] my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-8">
          <div>
            <h2 className="text-xl font-bold text-[#111827]">
              {city ? `Stays in "${city}"` : "All Verified Properties"}
            </h2>
            <p className="text-sm text-[#6b7280]">
              {properties.length} {properties.length === 1 ? "stay" : "stays"} found
            </p>
          </div>
          {city && (
            <Link 
              href="/properties"
              className="border-2 border-[#7c3aed] text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all duration-200"
            >
              Clear Filters
            </Link>
          )}
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-[#e5e7eb] rounded-3xl bg-white max-w-lg mx-auto">
            <Compass className="w-10 h-10 text-[#6b7280] mx-auto mb-3.5" />
            <h3 className="text-lg font-bold text-[#111827] mb-1">No Stays Found</h3>
            <p className="text-[#6b7280] text-sm max-w-sm mx-auto px-4">
              We couldn&apos;t find any properties matching your search criteria. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => {
              const totalRating = property.reviews.reduce((acc: number, review: any) => acc + review.rating, 0);
              const averageRating = property.reviews.length > 0 ? (totalRating / property.reviews.length).toFixed(1) : null;

              return (
                <Link href={`/properties/${property.id}`} key={property.id} className="group">
                  <article className="bg-white rounded-2xl overflow-hidden border border-[#e5e7eb] shadow-[0_1px_3px_0_rgb(0_0_0_/_0.08)] hover:shadow-[0_4px_6px_-1px_rgb(0_0_0_/_0.1)] transition-all duration-200 h-full flex flex-col">
                    <div className="relative aspect-video w-full overflow-hidden bg-[#f8fafc]">
                      {property.images[0] ? (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#6b7280]">
                          <MapPin className="w-8 h-8" />
                        </div>
                      )}
                      <span className="absolute top-3 left-3 bg-white/95 text-[#111827] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                        {property.city}
                      </span>
                      {property.isVerified && (
                        <span className="absolute top-3 right-14 bg-[#7c3aed] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 z-10">
                          <BadgeCheck className="w-3 h-3 text-white fill-white" /> Verified
                        </span>
                      )}
                      <FavoriteButton
                        propertyId={property.id}
                        initialIsFavorited={userFavoriteIds.has(property.id)}
                      />
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-[#111827] line-clamp-1 group-hover:text-[#7c3aed] transition-colors text-lg">
                            {property.title}
                          </h3>
                          {averageRating && (
                            <div className="flex items-center gap-1 text-amber-500 text-sm font-semibold shrink-0">
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              <span>{averageRating}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-[#6b7280] line-clamp-2">
                          {property.description}
                        </p>
                      </div>

                      <div>
                        <div className="flex gap-3 text-xs text-[#6b7280] pb-3 border-b border-[#e5e7eb]">
                          <span>{property.bedrooms} Beds</span>
                          <span>•</span>
                          <span>{property.bathrooms} Baths</span>
                          <span>•</span>
                          <span>{property.maxGuests} Guests</span>
                        </div>

                        <div className="flex items-center justify-between pt-3">
                          <p className="text-[#6b7280] text-xs">Price per night</p>
                          <p className="font-extrabold text-[#7c3aed] text-lg">
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
      </main>

      <Footer />
    </div>
  );
}
