import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ShieldCheck, FileText, Clock, AlertTriangle } from "lucide-react";
import UploadDocumentForm from "./UploadDocumentForm";
import SelfieVerificationSection from "./SelfieVerificationSection";
import DocumentLink from "@/components/common/DocumentLink";

export default async function HostVerificationPage() {
  const session = await auth();
  if (!session?.user) return null;

  let hostUser: {
    isVerified: boolean;
    selfieUrl: string | null;
    selfieVerifiedAt: Date | null;
  } | null = null;
  let documents: Array<{
    id: string;
    userId: string;
    type: string;
    fileUrl: string;
    status: string;
    uploadedAt: Date;
  }> = [];
  try {
    hostUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        isVerified: true,
        selfieUrl: true,
        selfieVerifiedAt: true,
      },
    });
    documents = await prisma.document.findMany({
      where: { userId: session.user.id },
      orderBy: { uploadedAt: "desc" },
    });
  } catch (error) {
    console.error("[DB Error] Could not fetch verification data:", error);
  }

  const isVerified = hostUser?.isVerified ?? false;
  const hasPending = documents.some((d) => d.status === "PENDING");

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-800 dark:text-white tracking-tight">Host Verification</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Submit identity documents and live face photo to unlock hosting privileges.
        </p>
      </div>

      {/* Status Banner */}
      <div className={`flex items-start gap-3 p-4 rounded-2xl border ${
        isVerified
          ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30"
          : hasPending || hostUser?.selfieUrl
          ? "bg-orange-50 dark:bg-orange-950/10 border-orange-100 dark:border-orange-900/30"
          : "bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700"
      }`}>
        {isVerified ? (
          <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        ) : hasPending || hostUser?.selfieUrl ? (
          <Clock className="size-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="size-5 text-neutral-500 dark:text-neutral-400 shrink-0 mt-0.5" />
        )}
        <div>
          <p className={`font-bold text-sm ${isVerified ? "text-emerald-800 dark:text-emerald-300" : hasPending || hostUser?.selfieUrl ? "text-orange-800 dark:text-orange-300" : "text-neutral-700 dark:text-neutral-300"}`}>
            {isVerified ? "Your account is verified ✓" : hasPending || hostUser?.selfieUrl ? "Verification Review in Progress" : "Action Required"}
          </p>
          <p className={`text-xs mt-0.5 ${isVerified ? "text-emerald-700/80 dark:text-emerald-400/80" : hasPending || hostUser?.selfieUrl ? "text-orange-700/80 dark:text-orange-400/80" : "text-neutral-500 dark:text-neutral-400"}`}>
            {isVerified
              ? "You can list properties and receive bookings. Thank you for completing verification."
              : hasPending || hostUser?.selfieUrl
              ? "Your identity document and live selfie are under admin review. Verification completes within 24 hours."
              : "Please capture your identity selfie and upload your national ID to get verified."}
          </p>
        </div>
      </div>

      {/* Selfie Verification Component */}
      <SelfieVerificationSection
        initialSelfieUrl={hostUser?.selfieUrl || null}
        initialSelfieDate={hostUser?.selfieVerifiedAt || null}
        isAccountVerified={isVerified}
      />

      {/* Submitted Documents */}
      {documents.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-xs p-5 space-y-4">
          <h2 className="font-bold text-neutral-800 dark:text-neutral-200 text-sm">Submitted Documents</h2>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40">
                <div className="flex items-center gap-2.5">
                  <FileText className="size-4 text-teal-600 dark:text-teal-400" />
                  <div>
                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">{doc.type.replace(/_/g, " ")}</p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DocumentLink fileUrl={doc.fileUrl} label="View Document" />
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    doc.status === "APPROVED"
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                      : doc.status === "REJECTED"
                      ? "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                      : "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400"
                  }`}>
                    {doc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Form */}
      {!isVerified && <UploadDocumentForm />}
    </div>
  );
}
