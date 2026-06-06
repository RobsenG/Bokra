import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ShieldCheck, FileText, Clock, AlertTriangle } from "lucide-react";

export default async function HostVerificationPage() {
  const session = await auth();
  if (!session?.user) return null;

  const hostUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isVerified: true },
  });

  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
    orderBy: { uploadedAt: "desc" },
  });

  const isVerified = hostUser?.isVerified ?? false;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-800 dark:text-white tracking-tight">Host Verification</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Submit identity documents to unlock hosting privileges.
        </p>
      </div>

      {/* Status Banner */}
      <div className={`flex items-start gap-3 p-4 rounded-2xl border ${
        isVerified
          ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30"
          : "bg-orange-50 dark:bg-orange-950/10 border-orange-100 dark:border-orange-900/30"
      }`}>
        {isVerified ? (
          <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="size-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
        )}
        <div>
          <p className={`font-bold text-sm ${isVerified ? "text-emerald-800 dark:text-emerald-300" : "text-orange-800 dark:text-orange-300"}`}>
            {isVerified ? "Your account is verified ✓" : "Verification Pending"}
          </p>
          <p className={`text-xs mt-0.5 ${isVerified ? "text-emerald-700/80 dark:text-emerald-400/80" : "text-orange-700/80 dark:text-orange-400/80"}`}>
            {isVerified
              ? "You can list properties and receive bookings. Thank you for completing verification."
              : "Please submit your national ID or ownership proof. Our team reviews submissions within 24 hours."}
          </p>
        </div>
      </div>

      {/* What to submit */}
      {!isVerified && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-neutral-800 dark:text-neutral-200 text-sm">Required Documents</h2>
          <div className="space-y-2.5">
            {[
              { label: "National ID or Passport", desc: "A clear scan of your government-issued ID" },
              { label: "Proof of Property Ownership", desc: "Title deed, utility bill, or lease agreement" },
            ].map((doc) => (
              <div key={doc.label} className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40">
                <FileText className="size-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">{doc.label}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{doc.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            Document upload functionality coming soon. Please contact support@bokrastay.com to submit documents manually.
          </p>
        </div>
      )}

      {/* Submitted Documents */}
      {documents.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm p-5 space-y-4">
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
