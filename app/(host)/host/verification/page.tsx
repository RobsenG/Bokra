import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  ShieldCheck,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  UploadCloud,
  Check,
  Building,
  UserCheck,
  Camera,
  XCircle,
  FileCheck,
} from "lucide-react";
import UploadDocumentForm from "./UploadDocumentForm";
import SelfieVerificationSection from "./SelfieVerificationSection";
import DocumentLink from "@/components/common/DocumentLink";
import Link from "next/link";

export default async function HostVerificationPage() {
  const session = await auth();
  if (!session?.user) return null;

  const userId = session.user.id;

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

  let hostProperties: Array<{
    id: string;
    title: string;
    city: string;
    isVerified: boolean;
    status: string;
    documents: Array<{
      id: string;
      type: string;
      fileUrl: string;
      status: string;
    }>;
  }> = [];

  try {
    const results = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          isVerified: true,
          selfieUrl: true,
          selfieVerifiedAt: true,
        },
      }),
      prisma.document.findMany({
        where: { userId },
        orderBy: { uploadedAt: "desc" },
      }),
      prisma.property.findMany({
        where: { hostId: userId },
        select: {
          id: true,
          title: true,
          city: true,
          isVerified: true,
          status: true,
          documents: {
            select: {
              id: true,
              type: true,
              fileUrl: true,
              status: true,
            },
          },
        },
      }),
    ]);

    hostUser = results[0];
    documents = results[1] || [];
    hostProperties = results[2] || [];
  } catch (error) {
    console.error("[DB Error] Could not fetch verification data:", error);
  }

  const isVerified = hostUser?.isVerified ?? false;
  const hasPendingDocs = documents.some((d) => d.status === "PENDING");
  const hasSelfie = !!hostUser?.selfieUrl;
  const hasIdDoc = documents.length > 0;

  // Determine current active step for the progress bar
  // Step 1: ID Doc Uploaded
  // Step 2: Selfie Captured
  // Step 3: Property Docs Submitted
  // Step 4: Admin Review Verified
  const step1Complete = hasIdDoc;
  const step2Complete = hasSelfie;
  const step3Complete = hostProperties.length === 0 || hostProperties.every((p) => p.documents.length > 0);
  const step4Complete = isVerified;

  let currentStep = 1;
  if (step1Complete) currentStep = 2;
  if (step1Complete && step2Complete) currentStep = 3;
  if (step1Complete && step2Complete && step3Complete) currentStep = 4;
  if (isVerified) currentStep = 4;

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-sans pb-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-[#1a1208] dark:text-[#f5f0e8] tracking-tight">
          Host Identity &amp; Property Verification
        </h1>
        <p className="text-sm text-[#6b5e4e] dark:text-[#8a8278] max-w-lg mx-auto">
          Complete your step-by-step verification to publish properties and host guests safely across Ethiopia.
        </p>
      </div>

      {/* STEP-BY-STEP PROGRESS BAR AT TOP */}
      <div className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] p-6 shadow-xs">
        <div className="relative flex items-center justify-between max-w-2xl mx-auto">
          {/* Connecting Line */}
          <div className="absolute left-8 right-8 top-5 h-1 bg-black/10 dark:bg-[#fff8dc]/10 -z-0">
            <div
              className="h-full bg-[#b8943d] dark:bg-[#c9a84c] transition-all duration-500"
              style={{
                width: `${
                  currentStep === 1
                    ? "0%"
                    : currentStep === 2
                    ? "33%"
                    : currentStep === 3
                    ? "66%"
                    : "100%"
                }`,
              }}
            />
          </div>

          {/* Step 1 Pill */}
          <div className="relative z-10 flex flex-col items-center space-y-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                step1Complete
                  ? "bg-[#b8943d] dark:bg-[#c9a84c] text-white dark:text-[#0c0b09] shadow-sm"
                  : currentStep === 1
                  ? "bg-white dark:bg-[#141310] border-2 border-[#b8943d] dark:border-[#c9a84c] text-[#b8943d] dark:text-[#c9a84c] animate-pulse"
                  : "bg-[#faf9f7] dark:bg-[#1c1a16] border-2 border-black/20 dark:border-[#fff8dc]/20 text-[#9b8e7e]"
              }`}
            >
              {step1Complete ? <Check className="size-5" /> : "1"}
            </div>
            <span className="text-[11px] font-bold text-[#1a1208] dark:text-[#f5f0e8]">
              Personal Identity
            </span>
          </div>

          {/* Step 2 Pill */}
          <div className="relative z-10 flex flex-col items-center space-y-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                step2Complete
                  ? "bg-[#b8943d] dark:bg-[#c9a84c] text-white dark:text-[#0c0b09] shadow-sm"
                  : currentStep === 2
                  ? "bg-white dark:bg-[#141310] border-2 border-[#b8943d] dark:border-[#c9a84c] text-[#b8943d] dark:text-[#c9a84c] animate-pulse"
                  : "bg-[#faf9f7] dark:bg-[#1c1a16] border-2 border-black/20 dark:border-[#fff8dc]/20 text-[#9b8e7e]"
              }`}
            >
              {step2Complete ? <Check className="size-5" /> : "2"}
            </div>
            <span className="text-[11px] font-bold text-[#1a1208] dark:text-[#f5f0e8]">
              Live Selfie
            </span>
          </div>

          {/* Step 3 Pill */}
          <div className="relative z-10 flex flex-col items-center space-y-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                step3Complete
                  ? "bg-[#b8943d] dark:bg-[#c9a84c] text-white dark:text-[#0c0b09] shadow-sm"
                  : currentStep === 3
                  ? "bg-white dark:bg-[#141310] border-2 border-[#b8943d] dark:border-[#c9a84c] text-[#b8943d] dark:text-[#c9a84c] animate-pulse"
                  : "bg-[#faf9f7] dark:bg-[#1c1a16] border-2 border-black/20 dark:border-[#fff8dc]/20 text-[#9b8e7e]"
              }`}
            >
              {step3Complete ? <Check className="size-5" /> : "3"}
            </div>
            <span className="text-[11px] font-bold text-[#1a1208] dark:text-[#f5f0e8]">
              Property Docs
            </span>
          </div>

          {/* Step 4 Pill */}
          <div className="relative z-10 flex flex-col items-center space-y-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                step4Complete
                  ? "bg-[#b8943d] dark:bg-[#c9a84c] text-white dark:text-[#0c0b09] shadow-sm"
                  : currentStep === 4
                  ? "bg-white dark:bg-[#141310] border-2 border-[#b8943d] dark:border-[#c9a84c] text-[#b8943d] dark:text-[#c9a84c] animate-pulse"
                  : "bg-[#faf9f7] dark:bg-[#1c1a16] border-2 border-black/20 dark:border-[#fff8dc]/20 text-[#9b8e7e]"
              }`}
            >
              {step4Complete ? <Check className="size-5" /> : "4"}
            </div>
            <span className="text-[11px] font-bold text-[#1a1208] dark:text-[#f5f0e8]">
              Admin Review
            </span>
          </div>
        </div>
      </div>

      {/* CENTERED CONTENT AREA */}
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Step 4 Card — Admin Review Status */}
        <div
          className={`flex items-start gap-4 p-5 rounded-3xl border shadow-xs ${
            isVerified
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40"
              : hasPendingDocs || hostUser?.selfieUrl
              ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40"
              : "bg-[#faf9f7] dark:bg-[#141310] border-black/[0.08] dark:border-[#fff8dc]/[0.06]"
          }`}
        >
          {isVerified ? (
            <ShieldCheck className="size-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : hasPendingDocs || hostUser?.selfieUrl ? (
            <Clock className="size-6 text-amber-600 dark:text-[#fcd34d] shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="size-6 text-[#6b5e4e] dark:text-[#8a8278] shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <h2
              className={`font-extrabold text-base ${
                isVerified
                  ? "text-emerald-900 dark:text-emerald-300"
                  : hasPendingDocs || hostUser?.selfieUrl
                  ? "text-amber-900 dark:text-[#fcd34d]"
                  : "text-[#1a1208] dark:text-[#f5f0e8]"
              }`}
            >
              {isVerified
                ? "✓ Verification Approved by Admin"
                : hasPendingDocs || hostUser?.selfieUrl
                ? "⏳ Verification Under Admin Review"
                : "⚠️ Identity Documents & Selfie Required"}
            </h2>
            <p
              className={`text-xs ${
                isVerified
                  ? "text-emerald-700 dark:text-emerald-400"
                  : hasPendingDocs || hostUser?.selfieUrl
                  ? "text-amber-800 dark:text-[#fcd34d]/80"
                  : "text-[#6b5e4e] dark:text-[#8a8278]"
              }`}
            >
              {isVerified
                ? "Your host identity and property documents have been verified. You have full hosting access."
                : hasPendingDocs || hostUser?.selfieUrl
                ? "Our admin team is actively reviewing your uploaded ID documents and live face photo (typically within 24 hours)."
                : "Please upload your official government ID document and complete the live selfie capture below."}
            </p>
          </div>
        </div>

        {/* Step 1 Card — Identity Documents */}
        <div className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-[#fff8dc]/[0.05] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c]">
                <FileText className="size-5" />
              </div>
              <div>
                <h2 className="font-bold text-[#1a1208] dark:text-[#f5f0e8] text-sm">
                  Step 1: Government Identity Documents
                </h2>
                <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278]">
                  Passport, Kebele ID, or Driver&apos;s License
                </p>
              </div>
            </div>
            {hasIdDoc && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                Uploaded ({documents.length})
              </span>
            )}
          </div>

          {documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#faf9f7] dark:bg-[#1c1a16] border border-black/[0.05] dark:border-[#fff8dc]/[0.05]"
                >
                  <div className="flex items-center gap-3">
                    <FileCheck className="size-4 text-[#b8943d] dark:text-[#c9a84c]" />
                    <div>
                      <p className="text-xs font-bold text-[#1a1208] dark:text-[#f5f0e8]">
                        {doc.type.replace(/_/g, " ")}
                      </p>
                      <p className="text-[11px] text-[#6b5e4e] dark:text-[#8a8278]">
                        Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DocumentLink fileUrl={doc.fileUrl} label="View ID" />
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        doc.status === "APPROVED"
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200"
                          : doc.status === "REJECTED"
                          ? "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200"
                          : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200"
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278] italic">
              No identity documents uploaded yet.
            </p>
          )}

          {!isVerified && <UploadDocumentForm />}
        </div>

        {/* Step 2 Card — Live Selfie */}
        <SelfieVerificationSection
          initialSelfieUrl={hostUser?.selfieUrl || null}
          initialSelfieDate={hostUser?.selfieVerifiedAt || null}
          isAccountVerified={isVerified}
        />

        {/* Step 3 Card — Property Ownership Documents */}
        <div className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-[#fff8dc]/[0.05] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c]">
                <Building className="size-5" />
              </div>
              <div>
                <h2 className="font-bold text-[#1a1208] dark:text-[#f5f0e8] text-sm">
                  Step 3: Property Ownership Documents
                </h2>
                <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278]">
                  Title deeds, lease agreements, or utility bills for listed stays
                </p>
              </div>
            </div>
          </div>

          {hostProperties.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#6b5e4e] dark:text-[#8a8278] space-y-2 bg-[#faf9f7] dark:bg-[#1c1a16] rounded-2xl border border-black/[0.05] dark:border-[#fff8dc]/[0.05]">
              <Building className="size-8 mx-auto text-[#9b8e7e]" />
              <p className="font-bold text-[#1a1208] dark:text-[#f5f0e8]">
                No properties created yet
              </p>
              <p>When you list a property, you can attach ownership documents here.</p>
              <Link
                href="/host/properties/new"
                className="inline-block mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#b8943d] dark:bg-[#c9a84c] text-white dark:text-[#0c0b09]"
              >
                + List Property
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {hostProperties.map((prop) => (
                <div
                  key={prop.id}
                  className="p-4 rounded-2xl bg-[#faf9f7] dark:bg-[#1c1a16] border border-black/[0.05] dark:border-[#fff8dc]/[0.05] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-[#1a1208] dark:text-[#f5f0e8]">
                        {prop.title}
                      </h3>
                      <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278]">
                        {prop.city}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        prop.isVerified
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200"
                          : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200"
                      }`}
                    >
                      {prop.isVerified ? "Verified Property" : prop.status}
                    </span>
                  </div>

                  {prop.documents.length > 0 ? (
                    <div className="space-y-2 pt-1">
                      {prop.documents.map((d) => (
                        <div
                          key={d.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#141310] border border-black/[0.04] dark:border-[#fff8dc]/[0.04] text-xs"
                        >
                          <span className="font-semibold text-[#1a1208] dark:text-[#f5f0e8]">
                            {d.type.replace(/_/g, " ")}
                          </span>
                          <DocumentLink fileUrl={d.fileUrl} label="View Doc" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-[#6b5e4e] dark:text-[#8a8278] pt-1">
                      <span>No ownership doc attached yet</span>
                      <Link
                        href={`/host/properties/${prop.id}/edit`}
                        className="font-bold text-[#b8943d] dark:text-[#c9a84c] hover:underline"
                      >
                        Upload Doc →
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
