"use client";

interface DocumentLinkProps {
  fileUrl: string;
  label?: string;
  documentType?: string;
}

export default function DocumentLink({
  fileUrl,
  label = "View Document",
  documentType,
}: DocumentLinkProps) {
  const supabaseBaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "supabase.co";

  const isValidUrl =
    fileUrl &&
    typeof fileUrl === "string" &&
    fileUrl.startsWith("https://") &&
    (fileUrl.includes(supabaseBaseUrl) || fileUrl.includes("supabase.co")) &&
    !fileUrl.includes("NoSuchBucket") &&
    !fileUrl.includes("undefined") &&
    !fileUrl.includes("null");

  if (!isValidUrl) {
    return (
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5
                   bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg
                   text-amber-700 dark:text-amber-400 text-xs font-semibold"
      >
        ⚠️ Document unavailable - host needs to re-upload
      </div>
    );
  }

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-1.5
                 bg-[#7c3aed]/10 border border-[#7c3aed]/20 rounded-lg
                 text-[#7c3aed] dark:text-[#a78bfa] text-xs font-semibold
                 hover:bg-[#7c3aed]/20 transition-colors"
    >
      📄 {label} {documentType ? `(${documentType})` : ""} ↗
    </a>
  );
}
