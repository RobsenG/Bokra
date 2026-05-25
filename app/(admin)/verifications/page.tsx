import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { approveProperty, rejectProperty } from "./actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default async function VerificationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Fetch pending properties
  const pendingProperties = await prisma.property.findMany({
    where: {
      isVerified: false,
    },
    include: {
      host: {
        select: { name: true, email: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Pending Verifications</h1>
        <p className="text-muted-foreground mt-1">Review and approve new property listings and host documents.</p>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property Title</TableHead>
              <TableHead>Host</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingProperties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No pending properties to verify.
                </TableCell>
              </TableRow>
            ) : (
              pendingProperties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell className="font-medium">{property.title}</TableCell>
                  <TableCell>{property.host.name || property.host.email}</TableCell>
                  <TableCell>{property.city}</TableCell>
                  <TableCell>{property.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <form action={rejectProperty.bind(null, property.id)}>
                        <Button type="submit" variant="destructive" size="sm">Reject</Button>
                      </form>
                      <form action={approveProperty.bind(null, property.id)}>
                        <Button type="submit" variant="default" size="sm" className="bg-green-600 hover:bg-green-700">Approve</Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
