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
    <div className="space-y-6 max-w-2xl font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1a1208] dark:text-[#f5f0e8] tracking-tight">Verify your identity</h1>
        <p className="text-sm text-[#6b5e4e] dark:text-[#8a8278] mt-0.5">
          Upload your ID and a selfie to get verified.
        </p>
      </div>

      {/* Status Banner */}
      <div className={`flex items-start gap-3 p-4 rounded-2xl border ${
        isVerified
          ? "bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 border-[#b8943d]/20 dark:border-[#c9a84c]/20"
          : hasPending || hostUser?.selfieUrl
          ? "bg-amber-50 dark:bg-[#f59e0b]/10 border-amber-200 dark:border-[#f59e0b]/20"
          : "bg-[#f5f3ef] dark:bg-[#141310] border-black/[0.06] dark:border-[#fff8dc]/[0.06]"
      }`}>
        {isVerified ? (
          <ShieldCheck className="size-5 text-[#b8943d] dark:text-[#c9a84c] shrink-0 mt-0.5" />
        ) : hasPending || hostUser?.selfieUrl ? (
          <Clock className="size-5 text-amber-600 dark:text-[#fcd34d] shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="size-5 text-[#6b5e4e] dark:text-[#8a8278] shrink-0 mt-0.5" />
        )}
        <div>
          <p className={`font-bold text-sm ${isVerified ? "text-[#b8943d] dark:text-[#c9a84c]" : hasPending || hostUser?.selfieUrl ? "text-amber-900 dark:text-[#fcd34d]" : "text-[#1a1208] dark:text-[#f5f0e8]"}`}>
            {isVerified ? "You're verified" : hasPending || hostUser?.selfieUrl ? "Review in progress" : "Verification needed"}
          </p>
          <p className={`text-xs mt-0.5 ${isVerified ? "text-[#b8943d]/80 dark:text-[#c9a84c]/80" : hasPending || hostUser?.selfieUrl ? "text-amber-700/80 dark:text-[#fcd34d]/80" : "text-[#6b5e4e] dark:text-[#8a8278]"}`}>
            {isVerified
              ? "You can list properties and host guests."
              : hasPending || hostUser?.selfieUrl
              ? "We're reviewing your documents — usually takes less than 24 hours."
              : "Upload your ID and take a selfie to get verified."}
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
        <div className="bg-white dark:bg-[#141310] rounded-2xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] shadow-xs p-5 space-y-4">
          <h2 className="font-bold text-[#1a1208] dark:text-[#f5f0e8] text-sm">Submitted Documents</h2>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-[#f5f3ef] dark:bg-[#1c1a16]">
                <div className="flex items-center gap-2.5">
                  <FileText className="size-4 text-[#b8943d] dark:text-[#c9a84c]" />
                  <div>
                    <p className="text-sm font-semibold text-[#1a1208] dark:text-[#f5f0e8]">{doc.type.replace(/_/g, " ")}</p>
                    <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278]">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DocumentLink fileUrl={doc.fileUrl} label="View document" />
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    doc.status === "APPROVED"
                      ? "bg-[#b8943d]/10 dark:bg-[#22c55e]/10 text-[#b8943d] dark:text-[#86efac] border border-[#b8943d]/20 dark:border-[#22c55e]/20"
                      : doc.status === "REJECTED"
                      ? "bg-red-50 dark:bg-[#ef4444]/10 text-red-700 dark:text-[#fca5a5] border dark:border-[#ef4444]/20"
                      : "bg-amber-50 dark:bg-[#f59e0b]/10 text-amber-700 dark:text-[#fcd34d] border dark:border-[#f59e0b]/20"
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
