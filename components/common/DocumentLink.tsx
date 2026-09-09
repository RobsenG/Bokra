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
      <div className="inline-flex items-center gap-2 px-3 py-1.5
                      bg-amber-50 dark:bg-amber-500/10
                      border border-amber-200 dark:border-amber-500/20
                      rounded-lg text-amber-700 dark:text-amber-400 text-xs font-semibold">
        ⚠️ Document unavailable — host needs to re-upload
      </div>
    );
  }

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-1.5
                 bg-[#b8943d]/10 dark:bg-[#c9a84c]/10
                 border border-[#b8943d]/20 dark:border-[#c9a84c]/20
                 rounded-lg text-[#b8943d] dark:text-[#c9a84c] text-xs font-semibold
                 hover:bg-[#b8943d]/20 dark:hover:bg-[#c9a84c]/20 transition-colors"
    >
      📄 {label} {documentType ? `(${documentType})` : ""} ↗
    </a>
  );
}
