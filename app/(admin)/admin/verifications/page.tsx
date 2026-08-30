import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { approveDocument, rejectDocument } from "./actions";
import { FileText, CheckCircle2, Camera } from "lucide-react";
import PropertyVerificationCard from "./PropertyVerificationCard";
import DocumentLink from "@/components/common/DocumentLink";

export default async function VerificationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const [pendingProperties, pendingDocuments] = await Promise.all([
    prisma.property.findMany({
      where: { isVerified: false, status: { in: ["PENDING"] } },
      include: {
        host: { select: { id: true, name: true, email: true, selfieUrl: true } },
        documents: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.document.findMany({
      where: { status: "PENDING" },
      include: {
        user: { select: { id: true, name: true, email: true, selfieUrl: true, selfieVerifiedAt: true } },
      },
      orderBy: { uploadedAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-800 dark:text-white tracking-tight">Verifications</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Review submitted properties and host verification documents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Properties & Ownership Docs Verification Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
              <span>Properties awaiting review</span>
              <span className="text-xs bg-purple-50 text-[#7c3aed] px-2 py-0.5 rounded-full font-bold">
                {pendingProperties.length} pending
              </span>
            </h2>
          </div>

          {pendingProperties.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-center border border-neutral-100 dark:border-neutral-850 rounded-2xl bg-white dark:bg-neutral-900 shadow-xs">
              <CheckCircle2 className="size-8 text-purple-600 mb-2" />
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">All properties verified</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">No new property submissions at this time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingProperties.map((property) => (
                <PropertyVerificationCard
                  key={property.id}
                  property={{
                    id: property.id,
                    title: property.title,
                    address: property.address,
                    city: property.city,
                    pricePerNight: Number(property.pricePerNight),
                    images: property.images,
                    host: {
                      id: property.host.id,
                      name: property.host.name,
                      email: property.host.email,
                    },
                    documents: property.documents.map((d) => ({
                      id: d.id,
                      type: d.type,
                      fileUrl: d.fileUrl,
                    })),
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Host Identity Documents & Live Selfie Matching Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
              <span>Host documents awaiting review</span>
              <span className="text-xs bg-purple-50 text-[#7c3aed] px-2 py-0.5 rounded-full font-bold">
                {pendingDocuments.length} pending
              </span>
            </h2>
          </div>

          {pendingDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-center border border-neutral-100 dark:border-neutral-850 rounded-2xl bg-white dark:bg-neutral-900 shadow-xs">
              <CheckCircle2 className="size-8 text-purple-600 mb-2" />
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">All host identity docs verified</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">No new identity document submissions at this time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingDocuments.map((doc) => (
                <div key={doc.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-xs space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-neutral-800 dark:text-neutral-200 text-sm">
                        {doc.type.replace(/_/g, " ")}
                      </h3>
                      <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full">
                        Pending review
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Uploaded by: <span className="font-semibold text-neutral-700 dark:text-neutral-200">{doc.user.name || doc.user.email}</span> ({doc.user.email})
                    </p>
                  </div>

                  {/* Side-by-side comparison */}
                  <div className="bg-neutral-50 dark:bg-neutral-800/40 rounded-xl p-3.5 border border-neutral-100 dark:border-neutral-800 space-y-2">
                    <p className="text-xs font-bold text-[#7c3aed]">
                      Face match verification: ID vs Selfie
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {/* ID Document Box */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                          1. Government ID Document
                        </span>
                        <div className="h-28 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-2 flex flex-col justify-between items-center text-center">
                          <FileText className="size-6 text-[#7c3aed] mt-2" />
                          <DocumentLink fileUrl={doc.fileUrl} label="View ID" />
                        </div>
                      </div>

                      {/* Live Selfie Box */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                          2. Live Selfie
                        </span>
                        {doc.user.selfieUrl ? (
                          <div className="h-28 rounded-lg overflow-hidden border border-[#7c3aed] bg-neutral-900 relative">
                            <img src={doc.user.selfieUrl} alt="Host Live Selfie" className="w-full h-full object-cover" />
                            <a
                              href={doc.user.selfieUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold"
                            >
                              Expand
                            </a>
                          </div>
                        ) : (
                          <div className="h-28 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-2 flex flex-col justify-center items-center text-center text-amber-700 dark:text-amber-400">
                            <Camera className="size-5 mb-1" />
                            <span className="text-[10px] font-bold">No selfie uploaded</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 italic">
                      Verify that the selfie matches the ID photo.
                    </p>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <form action={rejectDocument.bind(null, doc.id)} className="flex-1">
                      <button 
                        type="submit" 
                        className="w-full text-xs py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-semibold transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </form>
                    <form action={approveDocument.bind(null, doc.id)} className="flex-1">
                      <button 
                        type="submit" 
                        className="w-full text-xs py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#5b21b6] text-white font-semibold shadow-md shadow-[#7c3aed]/10 transition-colors cursor-pointer"
                      >
                        Approve host
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
