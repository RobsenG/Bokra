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
  ArrowLeft,
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
  const isPubliclyViewable =
    property.status !== "REJECTED" &&
    (property.isVerified || property.status === "APPROVED");

  // Hide rejected properties from general public, but allow owner host and admin to view details
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
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 font-sans">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-[#6b7280]">
        <Link
          href="/"
          className="hover:text-[#7c3aed] flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>
        <span>/</span>
        <Link href="/properties" className="hover:text-[#7c3aed] transition-colors">
          Stays
        </Link>
        <span>/</span>
        <span className="text-[#111827] truncate max-w-xs">{property.title}</span>
      </div>

      {/* Property Status Banners for Owner / Admin */}
      {property.status === "REJECTED" && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-extrabold text-red-800">
                  ⚠️ Property Listing Rejected
                </p>
                <p className="text-xs text-red-700/80 mt-0.5">
                  This listing was rejected by admin. It is currently hidden from renters.
                </p>
                {property.rejectionReason && (
                  <p className="text-xs text-red-900 font-semibold italic mt-1 bg-white/60 p-2.5 rounded-xl border border-red-200/50">
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
                <FileEdit className="w-3.5 h-3.5" />
                <span>Edit &amp; Resubmit</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {property.status === "PENDING" && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-800">
                ⏳ Pending Admin Verification
              </p>
              <p className="text-xs text-amber-700/80 mt-0.5">
                This listing is currently being reviewed by platform administrators. It will become visible to guests once approved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Title & Location */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#111827]">
          {property.title}
        </h1>
        <div className="flex items-center gap-4 text-sm font-medium text-[#6b7280]">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-[#7c3aed]" />
            {property.address}, {property.city}
          </span>
          {property.reviews.length > 0 && (
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
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
          className="h-full w-full bg-cover bg-center bg-[#f8fafc] hover:scale-105 transition-transform duration-500 relative"
          style={{ backgroundImage: `url(${property.images[0] || ""})` }}
        >
          <FavoriteButton propertyId={property.id} initialIsFavorited={isFavorited} />
        </div>
        <div className="hidden md:grid grid-cols-2 gap-4">
          {property.images.slice(1, 5).map((img: string, i: number) => (
            <div
              key={i}
              className="h-full w-full bg-cover bg-center rounded-xl bg-[#f8fafc] hover:scale-105 transition-transform duration-500"
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
        </div>
      </div>

      {/* Main Content & Booking Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Col: Details */}
        <div className="lg:col-span-2 space-y-10">
          <div className="flex justify-between items-center pb-8 border-b border-[#e5e7eb]">
            <div className="space-y-3">
              <h2 className="text-xl md:text-2xl font-bold text-[#111827]">
                Hosted by {property.host.name || property.host.email}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-[#6b7280]">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> {property.maxGuests} guests
                </span>
                <span className="flex items-center gap-1.5">
                  <BedDouble className="w-4 h-4" /> {property.bedrooms} bedrooms
                </span>
                <span className="flex items-center gap-1.5">
                  <Bath className="w-4 h-4" /> {property.bathrooms} baths
                </span>
              </div>
            </div>
            <div className="w-16 h-16 rounded-full bg-[#7c3aed]/10 overflow-hidden shrink-0">
              {property.host.avatar ? (
                <img
                  src={property.host.avatar}
                  alt="Host Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#7c3aed] font-bold text-xl">
                  {(property.host.name || property.host.email)[0].toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#111827]">
              About this space
            </h3>
            <p className="text-[#6b7280] whitespace-pre-line leading-relaxed text-sm md:text-base">
              {property.description}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#111827]">
              What this place offers
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {property.amenities.map((amenity: string, idx: number) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 text-[#6b7280] text-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-[#7c3aed]" />
                  {amenity}
                </li>
              ))}
            </ul>
          </div>

          <hr className="border-[#e5e7eb]" />

          {/* Location Map */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#111827]">Location</h3>
            <p className="text-sm text-[#6b7280] mb-4">
              {property.address}, {property.city}
            </p>
            <div className="w-full h-[300px] rounded-3xl overflow-hidden border border-[#e5e7eb] shadow-xs relative">
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

          <hr className="border-[#e5e7eb]" />

          {/* AI Review Summary */}
          <div className="bg-[#7c3aed]/5 rounded-3xl p-6 md:p-8 border border-[#7c3aed]/20 space-y-4">
            <div className="flex items-center gap-2 text-[#7c3aed] font-bold">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-lg">AI Review Summary</h3>
            </div>
            <p className="text-sm md:text-base text-[#111827] leading-relaxed font-medium">
              {aiSummary}
            </p>
            <p className="text-xs text-[#7c3aed]">
              Generated by Groq LLM
            </p>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-[#111827] flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
              {property.reviews.length} Reviews
            </h3>

            {property.reviews.length === 0 ? (
              <p className="text-[#6b7280] text-sm">No reviews yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {property.reviews.map((review: any) => (
                  <div
                    key={review.id}
                    className="space-y-3 p-5 rounded-2xl border border-[#e5e7eb] bg-white shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#f8fafc] border border-[#e5e7eb] overflow-hidden shrink-0">
                        {review.renter.avatar ? (
                          <img
                            src={review.renter.avatar}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#6b7280] font-bold text-sm">
                            {(review.renter.name || review.renter.email)[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#111827]">
                          {review.renter.name || review.renter.email}
                        </p>
                        <p className="text-xs text-[#6b7280]">
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
                          className={`w-3.5 h-3.5 ${
                            i < review.rating
                              ? "fill-amber-500 text-amber-500"
                              : "text-[#e5e7eb]"
                          }`}
                        />
                      ))}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-[#6b7280] leading-relaxed">
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
            <div className="pt-4 border-t border-[#e5e7eb]">
              {session.user.role === "ADMIN" ? (
                <p className="text-sm font-medium text-[#6b7280] py-2">
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
            <div className="bg-white rounded-3xl border border-[#e5e7eb] shadow-xl p-6 md:p-8 space-y-6">
              {session?.user?.role === "ADMIN" || isOwner ? (
                <div className="text-center py-6 space-y-2">
                  <p className="text-sm font-semibold text-[#6b7280]">
                    {isOwner
                      ? "You are viewing your own property listing."
                      : "Administrators cannot make bookings"}
                  </p>
                  {isOwner && (
                    <Link
                      href={`/host/properties/${property.id}/edit`}
                      className="inline-block px-4 py-2 rounded-xl text-xs font-bold bg-[#7c3aed] hover:bg-[#5b21b6] text-white transition-colors"
                    >
                      Edit Property Details
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-[#111827] flex items-baseline gap-1">
                      {Number(property.pricePerNight).toLocaleString()} ETB
                      <span className="text-sm font-medium text-[#6b7280]">
                        {" "}
                        / night
                      </span>
                    </h3>
                    <p className="text-xs text-[#6b7280]">
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
