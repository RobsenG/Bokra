import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BookingForm from "./BookingForm";

// Page for viewing a single property
export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      host: { select: { name: true, avatar: true, email: true } },
    },
  });

  if (!property || !property.isVerified || !property.isAvailable) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      {/* Title & Location */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold tracking-tight">{property.title}</h1>
        <p className="text-lg text-muted-foreground mt-2">{property.address}, {property.city}</p>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div 
          className="h-[400px] w-full bg-cover bg-center rounded-xl bg-muted"
          style={{ backgroundImage: `url(${property.images[0] || "/placeholder-home.jpg"})` }}
        />
        <div className="hidden md:grid grid-cols-2 gap-4">
          {property.images.slice(1, 5).map((img, i) => (
            <div 
              key={i}
              className="h-[192px] w-full bg-cover bg-center rounded-xl bg-muted"
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
        </div>
      </div>

      {/* Main Content & Booking Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Details */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="flex justify-between items-center border-b pb-6">
            <div>
              <h2 className="text-2xl font-semibold">Hosted by {property.host.name || property.host.email}</h2>
              <p className="text-muted-foreground">
                {property.maxGuests} guests · {property.bedrooms} bedrooms · {property.bathrooms} baths
              </p>
            </div>
            {property.host.avatar && (
              <img src={property.host.avatar} alt="Host Avatar" className="w-16 h-16 rounded-full" />
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">About this space</h3>
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
              {property.description}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">What this place offers</h3>
            <ul className="grid grid-cols-2 gap-4">
              {property.amenities.map((amenity, idx) => (
                <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  {amenity}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Col: Booking Form */}
        <div className="relative">
          <div className="sticky top-24">
            <Card className="shadow-lg border-muted">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  ${Number(property.pricePerNight).toFixed(2)}
                  <span className="text-base font-normal text-muted-foreground"> / night</span>
                </CardTitle>
                <CardDescription>Select dates to check availability</CardDescription>
              </CardHeader>
              <CardContent>
                <BookingForm propertyId={property.id} pricePerNight={Number(property.pricePerNight)} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
