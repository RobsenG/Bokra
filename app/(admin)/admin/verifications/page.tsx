import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { approveProperty, rejectProperty, approveDocument, rejectDocument } from "./actions";
import { ShieldCheck, FileWarning, Eye, CheckCircle2, XCircle } from "lucide-react";

export default async function VerificationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Fetch pending properties and pending documents parallelly
  const [pendingProperties, pendingDocuments] = await Promise.all([
    prisma.property.findMany({
      where: { isVerified: false },
      include: {
        host: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.document.findMany({
      where: { status: "PENDING" },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { uploadedAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-800 dark:text-white tracking-tight">Pending Verifications</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Review and approve new property listings and host identity documents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Properties Verification Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
              <span>Properties</span>
              <span className="text-xs bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 px-2 py-0.5 rounded-full font-bold">
                {pendingProperties.length} pending
              </span>
            </h2>
          </div>

          {pendingProperties.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-center border border-neutral-100 dark:border-neutral-850 rounded-2xl bg-white dark:bg-neutral-900 shadow-sm">
              <CheckCircle2 className="size-8 text-emerald-500 mb-2" />
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">All properties verified</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">No new property submissions at this time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingProperties.map((property) => (
                <div key={property.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-neutral-800 dark:text-neutral-200 text-sm line-clamp-1">
                        {property.title}
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Submitted by: <span className="font-semibold">{property.host.name || property.host.email}</span>
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Location: <span className="font-semibold">{property.address}, {property.city}</span>
                      </p>
                    </div>
                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 px-2 py-0.5 rounded-full shrink-0">
                      {Number(property.pricePerNight).toLocaleString()} ETB
                    </span>
                  </div>

                  {property.images[0] && (
                    <div 
                      className="h-32 w-full rounded-xl bg-cover bg-center bg-neutral-100 dark:bg-neutral-800"
                      style={{ backgroundImage: `url(${property.images[0]})` }}
                    />
                  )}

                  <div className="flex gap-2.5 pt-2">
                    <form action={rejectProperty.bind(null, property.id)} className="flex-1">
                      <button 
                        type="submit" 
                        className="w-full text-xs py-2 rounded-xl border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </form>
                    <form action={approveProperty.bind(null, property.id)} className="flex-1">
                      <button 
                        type="submit" 
                        className="w-full text-xs py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold shadow-md shadow-teal-600/10 transition-colors cursor-pointer"
                      >
                        Approve
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Documents Verification Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
              <span>Host Documents</span>
              <span className="text-xs bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 px-2 py-0.5 rounded-full font-bold">
                {pendingDocuments.length} pending
              </span>
            </h2>
          </div>

          {pendingDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-center border border-neutral-100 dark:border-neutral-850 rounded-2xl bg-white dark:bg-neutral-900 shadow-sm">
              <CheckCircle2 className="size-8 text-emerald-500 mb-2" />
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">All documents verified</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">No new identity document submissions at this time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingDocuments.map((doc) => (
                <div key={doc.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-sm space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-neutral-800 dark:text-neutral-200 text-sm">
                        {doc.type.replace(/_/g, " ")}
                      </h3>
                      <span className="text-[10px] font-bold text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 px-2 py-0.5 rounded-full">
                        Pending review
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Uploaded by: <span className="font-semibold">{doc.user.name || doc.user.email}</span> ({doc.user.email})
                    </p>
                    <p className="text-[10px] text-neutral-450">
                      Uploaded on: {new Date(doc.uploadedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100/50 dark:border-neutral-800/50">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-[200px]">
                      {doc.fileUrl}
                    </span>
                    <a 
                      href={doc.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold"
                    >
                      <Eye className="size-3.5" />
                      View Document
                    </a>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <form action={rejectDocument.bind(null, doc.id)} className="flex-1">
                      <button 
                        type="submit" 
                        className="w-full text-xs py-2 rounded-xl border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </form>
                    <form action={approveDocument.bind(null, doc.id)} className="flex-1">
                      <button 
                        type="submit" 
                        className="w-full text-xs py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold shadow-md shadow-teal-600/10 transition-colors cursor-pointer"
                      >
                        Approve & Verify Host
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
