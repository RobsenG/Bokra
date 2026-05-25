import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function RenterBookingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const bookings = await prisma.booking.findMany({
    where: { renterId: session.user.id },
    include: {
      property: {
        select: { title: true, city: true, images: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground mt-1">View and manage your upcoming and past stays.</p>
      </div>

      {bookings.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <CardHeader>
            <CardTitle>No bookings found</CardTitle>
            <CardDescription>You haven't booked any properties yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button>Explore Properties</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="flex flex-col md:flex-row overflow-hidden">
              <div 
                className="h-48 md:h-full md:w-1/3 bg-cover bg-center bg-muted"
                style={{ backgroundImage: `url(${booking.property.images[0] || "/placeholder-home.jpg"})` }}
              />
              <div className="flex-1">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{booking.property.title}</CardTitle>
                      <CardDescription>{booking.property.city}</CardDescription>
                    </div>
                    <div className={`px-2 py-1 text-xs font-semibold rounded-full 
                      ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                        booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'}`}
                    >
                      {booking.status}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground font-medium">Check-in</p>
                      <p>{booking.checkIn.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium">Check-out</p>
                      <p>{booking.checkOut.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-end border-t pt-4">
                    <p className="font-semibold text-lg">Total: ${Number(booking.totalPrice).toFixed(2)}</p>
                    <Link href={`/properties/${booking.propertyId}`}>
                      <Button variant="outline" size="sm">View Property</Button>
                    </Link>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
