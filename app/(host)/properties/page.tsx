import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function PropertiesPage() {
  const session = await auth();
  
  if (!session?.user) return null;

  const properties = await prisma.property.findMany({
    where: {
      hostId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Properties</h1>
          <p className="text-muted-foreground mt-1">Manage your Bokra Stay listings.</p>
        </div>
        <Link href="/properties/new">
          <Button>Add New Property</Button>
        </Link>
      </div>

      {properties.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <CardHeader>
            <CardTitle>No properties found</CardTitle>
            <CardDescription>You haven't listed any properties yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/properties/new">
              <Button variant="outline">Create your first listing</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <div
                className="h-48 w-full bg-cover bg-center bg-muted"
                style={{
                  backgroundImage: `url(${property.images[0] || "/placeholder-home.jpg"})`,
                }}
              />
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="line-clamp-1">{property.title}</CardTitle>
                    <CardDescription className="line-clamp-1">{property.city}</CardDescription>
                  </div>
                  <div className={`px-2 py-1 text-xs rounded-full ${property.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {property.isVerified ? "Verified" : "Pending"}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-lg">${Number(property.pricePerNight).toFixed(2)} <span className="text-sm font-normal text-muted-foreground">/ night</span></p>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" className="w-full">Edit</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
