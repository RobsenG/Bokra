import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import EditPropertyForm from "./EditPropertyForm";
import { AlertTriangle } from "lucide-react";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  let property = null;
  try {
    property = await prisma.property.findUnique({
      where: { id },
      include: {
        documents: {
          where: { type: "OWNERSHIP_PROOF" },
          orderBy: { uploadedAt: "desc" },
        },
      },
    });
  } catch (error) {
    console.error("[DB Error] Could not fetch property:", error);
  }

  if (!property || property.hostId !== session.user.id) {
    redirect("/host/properties");
  }

  const isRejected = property.status === "REJECTED";

  return (
    <div className="space-y-6 max-w-3xl font-sans">
      {/* Prominent Rejection Alert at Top of Edit Page if REJECTED */}
      {isRejected && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 shadow-2xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 text-red-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-red-800 font-semibold text-base">
                ⚠️ This property was rejected by admin
              </h3>
              {property.rejectionReason && (
                <p className="text-red-700 text-sm italic mt-1 bg-white/60 p-2.5 rounded-xl border border-red-200/50">
                  Reason: &quot;{property.rejectionReason}&quot;
                </p>
              )}
              <p className="text-red-600 text-sm mt-2">
                Please update your property details and upload new or corrected
                ownership documents below, then resubmit for review.
              </p>
            </div>
          </div>
        </div>
      )}

      <EditPropertyForm
        property={{
          id: property.id,
          title: property.title,
          description: property.description,
          address: property.address,
          city: property.city,
          pricePerNight: Number(property.pricePerNight),
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          maxGuests: property.maxGuests,
          amenities: property.amenities,
          images: property.images,
          status: property.status,
          rejectionReason: property.rejectionReason ?? null,
          hostId: property.hostId,
        }}
        existingDocuments={property.documents.map((doc) => ({
          id: doc.id,
          type: doc.type,
          fileUrl: doc.fileUrl,
          status: doc.status,
          uploadedAt: doc.uploadedAt.toISOString(),
        }))}
        userId={session.user.id}
      />
    </div>
  );
}
