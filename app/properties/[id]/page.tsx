import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import BookingForm from "./BookingForm";
import ReviewForm from "./ReviewForm";
import FavoriteButton from "@/components/common/FavoriteButton";
import { generateReviewSummary } from "@/lib/groq";
import {
  Star,
  MapPin,
  Users,
  BedDouble,
  Bath,
  Sparkles,
  AlertTriangle,
  Clock,
  FileEdit,
} from "lucide-react";

// Page for viewing a single property
export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  let property: any = null;
  try {
    property = await prisma.property.findUnique({
      where: { id },
      include: {
        host: { select: { id: true, name: true, avatar: true, email: true } },
        reviews: {
          include: { renter: { select: { name: true, avatar: true, email: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch (error) {
    console.error("[DB Error] Could not fetch property:", error);
  }

  if (!property) {
    notFound();
  }

  const isOwner = session?.user?.id === property.hostId;
  const isAdmin = session?.user?.role === "ADMIN";
  const isPubliclyViewable = property.isVerified && property.isAvailable && property.status === "APPROVED";

  // Hide unverified or rejected properties from general public, but allow owner host and admin to view details
  if (!isPubliclyViewable && !isOwner && !isAdmin) {
    notFound();
  }

  // Generate AI Summary
  const aiSummary = await generateReviewSummary(property.title, property.reviews);

  let isFavorited = false;
  if (session?.user) {
    try {
      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_propertyId: {
            userId: session.user.id,
            propertyId: property.id,
          },
        },
      });
      isFavorited = !!favorite;
    } catch (error) {
      console.error("[DB Error] Could not fetch favorite status:", error);
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-6xl">
      {/* Property Status Banners for Owner / Admin */}
      {property.status === "REJECTED" && (
        <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-900/50 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-extrabold text-red-800 dark:text-red-300">
                  ⚠️ Property Listing Rejected
                </p>
                <p className="text-xs text-red-700/80 dark:text-red-400/80 mt-0.5">
                  This listing was rejected by admin. It is currently hidden from renters.
                </p>
                {property.rejectionReason && (
                  <p className="text-xs text-red-900 dark:text-red-200 font-semibold italic mt-1 bg-white/60 dark:bg-neutral-900/60 p-2.5 rounded-xl border border-red-200/50 dark:border-red-900/40">
                    Reason: &quot;{property.rejectionReason}&quot;
                  </p>
                )}
              </div>
            </div>
            {isOwner && (
              <Link
                href={`/host/properties/${property.id}/edit`}
                className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
              >
                <FileEdit className="size-3.5" />
                <span>Edit &amp; Resubmit</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {property.status === "PENDING" && (
        <div className="bg-orange-50 dark:bg-orange-950/30 border-2 border-orange-200 dark:border-orange-900/50 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <Clock className="size-5 text-orange-600 dark:text-orange-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-orange-800 dark:text-orange-300">
                ⏳ Pending Admin Verification
              </p>
              <p className="text-xs text-orange-700/80 dark:text-orange-400/80 mt-0.5">
                This listing is currently being reviewed by platform administrators. It will become visible to guests once approved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Title & Location */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-neutral-800 dark:text-white">
          {property.title}
        </h1>
        <div className="flex items-center gap-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
          <span className="flex items-center gap-1">
            <MapPin className="size-4 text-teal-600 dark:text-teal-400" />
            {property.address}, {property.city}
          </span>
          {property.reviews.length > 0 && (
            <span className="flex items-center gap-1">
              <Star className="size-4 fill-orange-500 text-orange-500" />
              {(
                property.reviews.reduce((s: number, r: any) => s + r.rating, 0) /
                property.reviews.length
              ).toFixed(1)}{" "}
              ({property.reviews.length} reviews)
            </span>
          )}
        </div>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[300px] md:h-[450px] rounded-3xl overflow-hidden relative">
        <div
          className="h-full w-full bg-cover bg-center bg-neutral-200 dark:bg-neutral-800 hover:scale-105 transition-transform duration-500 relative"
          style={{ backgroundImage: `url(${property.images[0] || ""})` }}
        >
          <FavoriteButton propertyId={property.id} initialIsFavorited={isFavorited} />
        </div>
        <div className="hidden md:grid grid-cols-2 gap-4">
          {property.images.slice(1, 5).map((img: string, i: number) => (
            <div
              key={i}
              className="h-full w-full bg-cover bg-center rounded-xl bg-neutral-200 dark:bg-neutral-800 hover:scale-105 transition-transform duration-500"
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
        </div>
      </div>

      {/* Main Content & Booking Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Col: Details */}
        <div className="lg:col-span-2 space-y-10">
          <div className="flex justify-between items-center pb-8 border-b border-neutral-100 dark:border-neutral-800">
            <div className="space-y-3">
              <h2 className="text-xl md:text-2xl font-bold text-neutral-800 dark:text-white">
                Hosted by {property.host.name || property.host.email}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <Users className="size-4" /> {property.maxGuests} guests
                </span>
                <span className="flex items-center gap-1.5">
                  <BedDouble className="size-4" /> {property.bedrooms} bedrooms
                </span>
                <span className="flex items-center gap-1.5">
                  <Bath className="size-4" /> {property.bathrooms} baths
                </span>
              </div>
            </div>
            <div className="h-16 w-16 rounded-full bg-teal-100 dark:bg-teal-900 overflow-hidden shrink-0">
              {property.host.avatar ? (
                <img
                  src={property.host.avatar}
                  alt="Host Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold text-xl">
                  {(property.host.name || property.host.email)[0].toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-neutral-800 dark:text-white">
              About this space
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 whitespace-pre-line leading-relaxed text-sm md:text-base">
              {property.description}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-neutral-800 dark:text-white">
              What this place offers
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {property.amenities.map((amenity: string, idx: number) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400 text-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-teal-500" />
                  {amenity}
                </li>
              ))}
            </ul>
          </div>

          <hr className="border-neutral-100 dark:border-neutral-800" />

          {/* Location Map */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-neutral-800 dark:text-white">Location</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              {property.address}, {property.city}
            </p>
            <div className="w-full h-[300px] rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-sm relative">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  property.city + ", " + property.address
                )}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                className="absolute inset-0 grayscale-[0.2] contrast-[1.1] rounded-3xl"
              />
            </div>
          </div>

          <hr className="border-neutral-100 dark:border-neutral-800" />

          {/* AI Review Summary */}
          <div className="bg-gradient-to-tr from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20 rounded-3xl p-6 md:p-8 border border-teal-100/50 dark:border-teal-900/30 space-y-4">
            <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold">
              <Sparkles className="size-5" />
              <h3 className="text-lg">AI Review Summary</h3>
            </div>
            <p className="text-sm md:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
              {aiSummary}
            </p>
            <p className="text-xs text-teal-600/70 dark:text-teal-400/50">
              Generated by Groq LLM
            </p>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-neutral-800 dark:text-white flex items-center gap-2">
              <Star className="size-5 fill-orange-500 text-orange-500" />
              {property.reviews.length} Reviews
            </h3>

            {property.reviews.length === 0 ? (
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">No reviews yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {property.reviews.map((review: any) => (
                  <div
                    key={review.id}
                    className="space-y-3 p-5 rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden shrink-0">
                        {review.renter.avatar ? (
                          <img
                            src={review.renter.avatar}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-500 dark:text-neutral-400 font-bold text-sm">
                            {(review.renter.name || review.renter.email)[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
                          {review.renter.name || review.renter.email}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {new Date(review.createdAt).toLocaleDateString(undefined, {
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3.5 ${
                            i < review.rating
                              ? "fill-orange-500 text-orange-500"
                              : "text-neutral-200 dark:text-neutral-800"
                          }`}
                        />
                      ))}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Review Form */}
          {session?.user && (
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
              {session.user.role === "ADMIN" ? (
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 py-2">
                  Administrators cannot leave reviews
                </p>
              ) : (
                <ReviewForm propertyId={property.id} />
              )}
            </div>
          )}
        </div>

        {/* Right Col: Booking Form */}
        <div className="relative">
          <div className="sticky top-24">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-xl p-6 md:p-8 space-y-6">
              {session?.user?.role === "ADMIN" || isOwner ? (
                <div className="text-center py-6 space-y-2">
                  <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                    {isOwner
                      ? "You are viewing your own property listing."
                      : "Administrators cannot make bookings"}
                  </p>
                  {isOwner && (
                    <Link
                      href={`/host/properties/${property.id}/edit`}
                      className="inline-block px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-colors"
                    >
                      Edit Property Details
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-neutral-800 dark:text-white flex items-baseline gap-1">
                      {Number(property.pricePerNight).toLocaleString()} ETB
                      <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        {" "}
                        / night
                      </span>
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Select dates to check availability
                    </p>
                  </div>
                  <BookingForm
                    propertyId={property.id}
                    pricePerNight={Number(property.pricePerNight)}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
