import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import SearchForm from "@/components/common/SearchForm";
import { Search, MapPin, Calendar, Users, Shield, Compass, BadgeCheck, Sparkles, Plus, Star } from "lucide-react";

export default async function Home({ 
  searchParams 
}: { 
  searchParams: Promise<{ city?: string; checkIn?: string; checkOut?: string; guests?: string; minPrice?: string; maxPrice?: string; bedrooms?: string }> 
}) {
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

  // Fetch verified properties
  const properties = await prisma.property.findMany({
    where: filters,
    take: 6,
    orderBy: { createdAt: "desc" },
    include: {
      reviews: {
        select: {
          rating: true
        }
      }
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-teal-900 text-white overflow-hidden py-24 md:py-32">
          {/* Background decorations */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0d9488_1px,transparent_1px),linear-gradient(to_bottom,#0d9488_1px,transparent_1px)] bg-[size:5rem_5rem] opacity-10" />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500 rounded-full blur-[120px] opacity-25" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500 rounded-full blur-[120px] opacity-25" />

          <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-800 text-teal-200 border border-teal-700/50">
              <Sparkles className="size-3.5 text-orange-400 fill-orange-400" />
              Discover Authenticity
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-none">
              Find Your Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-400">Stay in Ethiopia</span>
            </h1>
            <p className="text-teal-100 text-lg md:text-xl font-normal max-w-2xl mx-auto leading-relaxed">
              Explore handpicked, verified properties. From modern apartments in Addis Ababa to tranquil retreats in Hawassa.
            </p>

            {/* Elegant Search Bar */}
            <div className="pt-8">
              <SearchForm />
            </div>
          </div>
        </section>

        {/* Featured Properties Grid */}
        <section className="container mx-auto px-4 py-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-10">
            <div>
              <span className="text-teal-600 dark:text-teal-400 font-bold text-xs uppercase tracking-widest block mb-1">Top Stays</span>
              <h2 className="text-3xl font-extrabold text-teal-950 dark:text-neutral-50 tracking-tight">
                {city ? `Results in "${city}"` : "Featured Stays in Ethiopia"}
              </h2>
            </div>
            {city && (
              <Link href="/">
                <Button variant="outline" className="text-neutral-600 dark:text-neutral-400">Clear Search</Button>
              </Link>
            )}
          </div>

          {properties.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl bg-neutral-50/50 dark:bg-neutral-900/10 max-w-lg mx-auto">
              <Compass className="size-10 text-neutral-400 mx-auto mb-3.5" />
              <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200 mb-1">No Stays Found</h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-sm mx-auto px-4">
                We couldn't find any properties matching your search criteria. Try removing filters or checking different locations.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => {
                const totalRating = property.reviews.reduce((acc, review) => acc + review.rating, 0);
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
                          <span className="absolute top-3 right-3 bg-teal-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                            <BadgeCheck className="size-3 text-white fill-white" /> Verified
                          </span>
                        )}
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
        </section>

        {/* How It Works Section */}
        <section className="bg-neutral-100 dark:bg-neutral-900/40 py-20 border-y border-neutral-200/50 dark:border-neutral-800/40">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center space-y-2 mb-12">
              <span className="text-teal-600 dark:text-teal-400 font-bold text-xs uppercase tracking-widest">Process</span>
              <h2 className="text-3xl font-extrabold text-teal-950 dark:text-neutral-50">How Bokra Stay Works</h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-md mx-auto">
                Discovering and hosting spaces in Ethiopia has never been this simple, secure, and intuitive.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm text-center space-y-3.5">
                <div className="mx-auto w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <Compass className="size-6" />
                </div>
                <h3 className="font-bold text-neutral-800 dark:text-neutral-100">1. Find Your Ideal Stay</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Search properties across Ethiopia using filters like city, pricing, bedrooms, and specific amenities.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm text-center space-y-3.5">
                <div className="mx-auto w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <Shield className="size-6" />
                </div>
                <h3 className="font-bold text-neutral-800 dark:text-neutral-100">2. Book Safely</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Confirm availability, checkout securely, and get immediate reservation confirmations.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm text-center space-y-3.5">
                <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <BadgeCheck className="size-6" />
                </div>
                <h3 className="font-bold text-neutral-800 dark:text-neutral-100">3. Enjoy Your Visit</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Stay with verified hosts, experience authentic local culture, and make unforgettable memories.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner Section */}
        <section className="bg-gradient-to-tr from-teal-900 to-emerald-950 text-white py-20 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-teal-500 rounded-full blur-[140px] opacity-20 pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl space-y-6">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Ready to start your journey?</h2>
            <p className="text-teal-100 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
              Earn extra income by listing your home, or find a comfortable space for your next trip in Ethiopia.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link href="/register?role=HOST">
                <Button className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold h-11 px-6 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-orange-500/10">
                  <Plus className="size-4" />
                  <span>List Your Property</span>
                </Button>
              </Link>
              <Link href="/">
                <Button className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-white border border-white/20 font-semibold h-11 px-6 rounded-xl transition-all">
                  Find a Stay
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
