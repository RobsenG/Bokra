import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import DeletePropertyButton from "./DeletePropertyButton";


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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-800 dark:text-white tracking-tight">My Properties</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Manage your Bokra Stay listings.</p>
        </div>
        <Link href="/host/properties/new">
          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/10 transition-all">
            + Add Property
          </button>
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50/50 dark:bg-neutral-900/10">
          <p className="font-bold text-neutral-800 dark:text-neutral-200">No properties yet</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 mb-4">You haven't listed any properties yet.</p>
          <Link href="/host/properties/new">
            <button className="px-4 py-2 rounded-xl text-sm font-semibold border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              Create your first listing
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all">
              <div
                className="h-48 w-full bg-cover bg-center bg-neutral-200 dark:bg-neutral-800"
                style={{ backgroundImage: `url(${property.images[0] || ""})` }}
              />
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-neutral-800 dark:text-neutral-200 line-clamp-1">{property.title}</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{property.city}</p>
                  </div>
                  <span className={`shrink-0 px-2 py-0.5 text-[10px] rounded-full font-bold ${property.isVerified ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' : 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400'}`}>
                    {property.isVerified ? "Verified" : "Pending"}
                  </span>
                </div>
                <p className="font-extrabold text-teal-700 dark:text-teal-300">
                  {Number(property.pricePerNight).toLocaleString()} ETB <span className="text-xs font-normal text-neutral-500">/ night</span>
                </p>
                <div className="flex gap-2 pt-1">
                  <Link href={`/host/properties/${property.id}/edit`} className="flex-1">
                    <button className="w-full text-xs py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors font-semibold cursor-pointer">
                      Edit
                    </button>
                  </Link>
                  <DeletePropertyButton propertyId={property.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
