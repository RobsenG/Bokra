import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import DeletePropertyButton from "./DeletePropertyButton";

export default async function PropertiesPage() {
  const session = await auth();

  if (!session?.user) return null;

  let properties: any[] = [];
  try {
    properties = await prisma.property.findMany({
      where: { hostId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("[DB Error] Could not fetch properties:", error);
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1208] dark:text-[#f8f6f0] tracking-tight">
            Your properties
          </h1>
          <p className="text-sm text-[#6b5e4e] dark:text-[#9b9080] mt-0.5">
            Manage your property listings.
          </p>
        </div>
        <Link href="/host/properties/new">
          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-[#b8943d] dark:bg-[#c9a84c] hover:brightness-110 text-white dark:text-[#0a0a0f] shadow-xs transition-all cursor-pointer">
            + List property
          </button>
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-black/[0.08] dark:border-white/[0.06] rounded-2xl bg-black/[0.02] dark:bg-white/[0.02]">
          <p className="font-bold text-[#1a1208] dark:text-[#f8f6f0]">No properties yet</p>
          <p className="text-sm text-[#6b5e4e] dark:text-[#9b9080] mt-1 mb-4">
            You haven&apos;t listed any properties yet.
          </p>
          <Link href="/host/properties/new">
            <button className="px-4 py-2 rounded-xl text-sm font-semibold border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              List a property
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => {
            const isRejected = property.status === "REJECTED";
            const isApproved = property.isVerified || property.status === "APPROVED";

            return (
              <div
                key={property.id}
                className={`bg-white dark:bg-[#12121a] rounded-2xl overflow-hidden border shadow-sm hover:shadow-md transition-all ${
                  isRejected
                    ? "border-red-200 dark:border-red-900/40"
                    : "border-black/[0.08] dark:border-white/[0.06]"
                }`}
              >
                <div
                  className="h-48 w-full bg-cover bg-center bg-black/5 dark:bg-white/5"
                  style={{ backgroundImage: `url(${property.images[0] || ""})` }}
                />
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-[#1a1208] dark:text-[#f8f6f0] line-clamp-1">
                        {property.title}
                      </h3>
                      <p className="text-xs text-[#6b5e4e] dark:text-[#9b9080]">
                        {property.city}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 px-2.5 py-0.5 text-[10px] rounded-full font-bold uppercase ${
                        isApproved
                          ? "bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] border border-[#b8943d]/20 dark:border-[#c9a84c]/20"
                          : isRejected
                          ? "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40"
                          : "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900/40"
                      }`}
                    >
                      {isApproved ? "Verified" : isRejected ? "REJECTED" : "Waiting for review"}
                    </span>
                  </div>

                  {isRejected && property.rejectionReason && (
                    <p className="text-xs text-red-600 dark:text-red-400 italic bg-red-50/50 dark:bg-red-950/20 p-2 rounded-lg border border-red-100 dark:border-red-900/30">
                      Rejected: &quot;{property.rejectionReason}&quot;
                    </p>
                  )}

                  <p className="font-extrabold text-[#b8943d] dark:text-[#c9a84c]">
                    {Number(property.pricePerNight).toLocaleString()} ETB{" "}
                    <span className="text-xs font-normal text-[#6b5e4e] dark:text-[#9b9080]">/ night</span>
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Link href={`/properties/${property.id}`}>
                      <button className="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 text-[#6b5e4e] dark:text-[#9b9080] hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold transition-colors cursor-pointer">
                        View
                      </button>
                    </Link>
                    <Link href={`/host/properties/${property.id}/edit`} className="flex-1">
                      <button
                        className={`w-full text-xs py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
                          isRejected
                            ? "bg-[#b8943d] dark:bg-[#c9a84c] hover:brightness-110 text-white dark:text-[#0a0a0f] border-transparent shadow-xs"
                            : "border-black/10 dark:border-white/10 text-[#6b5e4e] dark:text-[#9b9080] hover:bg-black/5 dark:hover:bg-white/5"
                        }`}
                      >
                        {isRejected ? "Edit & Resubmit" : "Edit"}
                      </button>
                    </Link>
                    <DeletePropertyButton propertyId={property.id} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
