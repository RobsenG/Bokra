import prisma from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Awaiting searchParams in Next.js 15
export default async function Home({ 
  searchParams 
}: { 
  searchParams: Promise<{ city?: string; maxPrice?: string; bedrooms?: string; guests?: string }> 
}) {
  const { city, maxPrice, bedrooms, guests } = await searchParams;

  const filters: any = {
    isVerified: true,
    isAvailable: true,
  };

  if (city) filters.city = { contains: city, mode: "insensitive" };
  if (maxPrice) filters.pricePerNight = { lte: parseFloat(maxPrice) };
  if (bedrooms) filters.bedrooms = { gte: parseInt(bedrooms, 10) };
  if (guests) filters.maxGuests = { gte: parseInt(guests, 10) };

  const properties = await prisma.property.findMany({
    where: filters,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto py-8">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center py-16 bg-muted/30 rounded-xl mb-12 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Find your next stay in Ethiopia
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
          Discover beautiful homes, apartments, and unique spaces for your short-term rental needs.
        </p>
        
        {/* Advanced Search Bar */}
        <form className="w-full max-w-4xl bg-background p-4 rounded-xl shadow-md flex flex-wrap md:flex-nowrap items-end gap-4 border" action="/">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-1 block">Location</label>
            <Input type="text" name="city" placeholder="e.g. Addis Ababa" defaultValue={city || ""} />
          </div>
          <div className="w-full md:w-32">
            <label className="text-sm font-medium mb-1 block">Max Price</label>
            <Input type="number" name="maxPrice" placeholder="$" defaultValue={maxPrice || ""} min="0" />
          </div>
          <div className="w-full md:w-28">
            <label className="text-sm font-medium mb-1 block">Bedrooms</label>
            <Input type="number" name="bedrooms" placeholder="Min" defaultValue={bedrooms || ""} min="1" />
          </div>
          <div className="w-full md:w-28">
            <label className="text-sm font-medium mb-1 block">Guests</label>
            <Input type="number" name="guests" placeholder="Min" defaultValue={guests || ""} min="1" />
          </div>
          <Button type="submit" size="lg" className="w-full md:w-auto h-10 px-8">Search</Button>
        </form>
      </div>

      {/* Property Grid */}
      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">
          {Object.keys(filters).length > 2 ? "Search Results" : "Featured Properties"}
        </h2>
        {Object.keys(filters).length > 2 && (
          <Link href="/">
            <Button variant="ghost">Clear Filters</Button>
          </Link>
        )}
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-muted/10">
          <p className="text-muted-foreground text-lg">No properties found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Link href={`/properties/${property.id}`} key={property.id}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full cursor-pointer group">
                <div
                  className="h-64 w-full bg-cover bg-center bg-muted transition-transform group-hover:scale-105 duration-300"
                  style={{ backgroundImage: `url(${property.images[0] || "/placeholder-home.jpg"})` }}
                />
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="line-clamp-1">{property.title}</CardTitle>
                      <CardDescription className="line-clamp-1">{property.city}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-lg">
                    ${Number(property.pricePerNight).toFixed(2)} <span className="text-sm font-normal text-muted-foreground">/ night</span>
                  </p>
                  <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                    <span>{property.bedrooms} Beds</span>
                    <span>{property.bathrooms} Baths</span>
                    <span>Up to {property.maxGuests} Guests</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
