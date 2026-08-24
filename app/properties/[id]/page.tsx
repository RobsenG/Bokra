import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import BookingForm from "./BookingForm";
import ReviewForm from "./ReviewForm";
import FavoriteButton from "@/components/common/FavoriteButton";
import PropertyGallery from "./PropertyGallery";
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
  Award,
  ShieldCheck,
  Calendar,
  // Amenity icons
  Wifi,
  Car,
  Wind,
  Droplets,
  Tv,
  UtensilsCrossed,
  Zap,
  Shield,
  Building2,
  Trees,
  WashingMachine,
  Coffee,
  Dumbbell,
  Dog,
  Snowflake,
  Flame,
  MonitorSpeaker,
  Bath as BathIcon,
  CheckCircle2,
} from "lucide-react";

// ─── Amenity icon map ───────────────────────────────────────────────────────────
const amenityIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  WiFi: Wifi,
  Wifi: Wifi,
  "Free WiFi": Wifi,
  Kitchen: UtensilsCrossed,
  "Full Kitchen": UtensilsCrossed,
  Parking: Car,
  "Free Parking": Car,
  "Air Conditioning": Wind,
  AC: Wind,
  "Air Con": Wind,
  "Hot Water": Droplets,
  TV: Tv,
  Television: Tv,
  "Washing Machine": WashingMachine,
  Washer: WashingMachine,
  Generator: Zap,
  "Power Backup": Zap,
  Security: Shield,
  CCTV: Shield,
  Balcony: Building2,
  Garden: Trees,
  Gym: Dumbbell,
  Coffee: Coffee,
  "Pet Friendly": Dog,
  Heating: Flame,
  Freezer: Snowflake,
  "Sound System": MonitorSpeaker,
  Bathtub: BathIcon,
  "Extra Beds": BedDouble,
};

function getAmenityIcon(amenity: string): React.ComponentType<{ className?: string }> {
  return amenityIconMap[amenity] ?? CheckCircle2;
}

// Page for viewing a single property
export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let property: any = null;
  try {
    property = await prisma.property.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
            isVerified: true,
            trustBadge: true,
            trustBadgeAt: true,
            adminVerifiedName: true,
            shortBio: true,
            createdAt: true,
          },
        },
        reviews: {
          include: {
            renter: {
              select: { name: true, avatar: true, email: true },
            },
          },
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

  const host = property.host;

  // FIX 2 — Real host name (never hardcoded)
  const hostDisplayName = host.name || "Your Host";
  // Trust badge from DB only — never hardcoded
  const hostBadge = host.trustBadge || (host.isVerified ? "Verified Host" : null);
  // adminVerifiedName from DB only
  const hostSubtitle = host.adminVerifiedName || null;

  // Host avatar: show real avatar or initials
  const hostInitial = (host.name || "H")[0].toUpperCase();
  const hasValidAvatar =
    host.avatar && typeof host.avatar === "string" && host.avatar.startsWith("https://");

  // FIX 1 — Deduplicate images
  const uniqueImages = [...new Set(property.images as string[])].filter(Boolean);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalRating = property.reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
  const avgRating =
    property.reviews.length > 0
      ? (totalRating / property.reviews.length).toFixed(1)
      : null;

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

      {/* Property Status Banners */}
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
                This listing is currently being reviewed by platform administrators. It
                will become visible to guests once approved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#111827]">
            {property.title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-[#6b7280]">
          <span className="flex items-center gap-1 text-[#111827] font-semibold">
            <MapPin className="w-4 h-4 text-[#7c3aed]" />
            {property.address}, {property.city}
          </span>
          {avgRating ? (
            <span className="flex items-center gap-1 text-[#111827] font-bold">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              {avgRating} ({property.reviews.length}{" "}
              {property.reviews.length === 1 ? "review" : "reviews"})
            </span>
          ) : (
            <span className="text-xs font-semibold text-neutral-400">New property</span>
          )}

          {hostBadge && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#7c3aed] text-xs font-extrabold border border-purple-200">
              <Award className="size-3.5" />
              {hostBadge}
            </span>
          )}
        </div>
      </div>

      {/* FIX 1 — Gallery with lightbox (client component) + favorite button overlay */}
      <div className="relative">
        <PropertyGallery images={uniqueImages} title={property.title} />
        {/* Favorite button positioned absolutely over the gallery */}
        <div className="absolute top-4 left-4 z-10">
          <FavoriteButton propertyId={property.id} initialIsFavorited={isFavorited} />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-10">
          {/* Key Specs Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-white border border-[#e5e7eb] rounded-2xl shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 text-[#7c3aed] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[#6b7280]">Capacity</p>
                <p className="text-sm font-bold text-[#111827]">
                  Up to {property.maxGuests} guests
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 text-[#7c3aed] flex items-center justify-center">
                <BedDouble className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[#6b7280]">Bedrooms</p>
                <p className="text-sm font-bold text-[#111827]">
                  {property.bedrooms} {property.bedrooms === 1 ? "Bedroom" : "Bedrooms"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 text-[#7c3aed] flex items-center justify-center">
                <Bath className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[#6b7280]">Bathrooms</p>
                <p className="text-sm font-bold text-[#111827]">
                  {property.bathrooms} {property.bathrooms === 1 ? "Bath" : "Baths"}
                </p>
              </div>
            </div>
          </div>

          {/* FIX 2 — Host Profile Card with real name/photo */}
          <div className="bg-white rounded-3xl border border-[#e5e7eb] p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-start justify-between gap-4 border-b border-[#e5e7eb] pb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {/* FIX 2 — Avatar: real photo or initials */}
                  <div className="w-24 h-24 rounded-full ring-4 ring-[#7c3aed]/20 overflow-hidden flex items-center justify-center bg-[#7c3aed] text-white text-3xl font-bold border-2 border-white shadow-md shrink-0">
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
                  {host.isVerified && (
                    <div
                      className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-white"
                      title="Verified Identity"
                    >
                      <ShieldCheck className="size-3.5" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {/* FIX 2 — Real host name from DB */}
                    <h3 className="text-xl font-extrabold text-[#111827]">
                      Hosted by {hostDisplayName}
                    </h3>
                  </div>

                  {/* FIX 2 — adminVerifiedName only if set in DB */}
                  {hostSubtitle && (
                    <p className="text-xs text-[#6b7280] font-medium">{hostSubtitle}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#6b7280]">
                    {hostBadge && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-50 text-[#7c3aed] border border-purple-200">
                        <Award className="size-3" />
                        {hostBadge}
                      </span>
                    )}
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3 text-[#7c3aed]" />
                      Member since{" "}
                      {new Date(host.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Host Bio */}
            {host.shortBio ? (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">
                  About your host
                </h4>
                <p className="text-sm text-[#111827] leading-relaxed italic bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                  &quot;{host.shortBio}&quot;
                </p>
              </div>
            ) : (
              <p className="text-xs text-[#6b7280] italic">
                {hostDisplayName} is a dedicated host committed to providing great stays
                for guests in {property.city}.
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-xl font-extrabold text-[#111827]">About this space</h3>
            <p className="text-[#6b7280] whitespace-pre-line leading-relaxed text-sm md:text-base">
              {property.description}
            </p>
          </div>

          {/* FIX 3 — Amenities with icons */}
          <div className="space-y-4">
            <h3 className="text-xl font-extrabold text-[#111827]">
              What this place offers
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y divide-[#f3f4f6] border border-[#e5e7eb] rounded-2xl overflow-hidden bg-white shadow-2xs">
              {property.amenities.map((amenity: string, idx: number) => {
                const Icon = getAmenityIcon(amenity);
                return (
                  <li
                    key={idx}
                    className="flex items-center gap-3 px-5 py-3.5 text-sm text-[#111827] font-medium hover:bg-[#f9fafb] transition-colors"
                  >
                    <Icon className="w-5 h-5 text-[#7c3aed] flex-shrink-0" />
                    {amenity}
                  </li>
                );
              })}
            </ul>
          </div>

          <hr className="border-[#e5e7eb]" />

          {/* Location Map */}
          <div className="space-y-4">
            <h3 className="text-xl font-extrabold text-[#111827]">Location</h3>
            <p className="text-sm text-[#6b7280] mb-4">
              {property.address}, {property.city}
            </p>
            <div className="w-full h-[320px] rounded-3xl overflow-hidden border border-[#e5e7eb] shadow-xs relative">
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
              <Sparkles className="w-5 h-5 text-[#7c3aed]" />
              <h3 className="text-lg">AI Review Summary</h3>
            </div>
            <p className="text-sm md:text-base text-[#111827] leading-relaxed font-medium">
              {aiSummary}
            </p>
            <p className="text-xs text-[#7c3aed] font-semibold">Powered by Groq AI</p>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            <h3 className="text-xl font-extrabold text-[#111827] flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
              {property.reviews.length}{" "}
              {property.reviews.length === 1 ? "Review" : "Reviews"}
            </h3>

            {property.reviews.length === 0 ? (
              <p className="text-[#6b7280] text-sm italic">
                No reviews yet. Be the first guest to review this stay!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {property.reviews.map((review: any) => (
                  <div
                    key={review.id}
                    className="space-y-3 p-5 rounded-2xl border border-[#e5e7eb] bg-white shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#7c3aed]/10 border border-[#e5e7eb] overflow-hidden shrink-0">
                        {review.renter.avatar ? (
                          <img
                            src={review.renter.avatar}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#7c3aed] font-bold text-sm">
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

        {/* Right Column: Sticky Booking Widget */}
        <div className="relative">
          <div className="sticky top-24">
            <div className="bg-white rounded-3xl border border-[#e5e7eb] shadow-xl p-6 md:p-8 space-y-6">
              {session?.user?.role === "ADMIN" || isOwner ? (
                <div className="text-center py-6 space-y-3">
                  <p className="text-sm font-bold text-[#111827]">
                    {isOwner
                      ? "You own this property listing."
                      : "Administrators view mode"}
                  </p>
                  {isOwner && (
                    <Link
                      href={`/host/properties/${property.id}/edit`}
                      className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold bg-[#7c3aed] hover:bg-[#6d28d9] text-white shadow-xs transition-colors"
                    >
                      Edit Property Details
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-1 border-b border-[#e5e7eb] pb-5">
                    <h3 className="text-2xl font-black text-[#111827] flex items-baseline gap-1">
                      {Number(property.pricePerNight).toLocaleString()} ETB
                      <span className="text-sm font-medium text-[#6b7280]"> / night</span>
                    </h3>
                    <p className="text-xs text-[#6b7280]">
                      Select dates to calculate total and reserve via Chapa
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
