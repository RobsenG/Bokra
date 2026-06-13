"use client";

import { useState } from "react";
import { uploadDocument } from "./actions";
import { UploadCloud, CheckCircle, AlertCircle } from "lucide-react";

const DOC_TYPES = [
  { value: "ID_CARD", label: "National ID / Passport" },
  { value: "OWNERSHIP_PROOF", label: "Proof of Property Ownership" },
  { value: "HOUSE_REGISTRATION", label: "House Registration" },
  { value: "OTHER", label: "Other Document" },
] as const;

export default function UploadDocumentForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData(e.currentTarget);
      await uploadDocument(formData);
      setSuccess(true);
      setFileName(null);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm p-6 space-y-5">
      <h2 className="font-bold text-neutral-800 dark:text-neutral-200 text-sm">Upload a Document</h2>

      {success && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
          <CheckCircle className="size-4 shrink-0" />
          Document uploaded successfully. Our team will review it within 24 hours.
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="type" className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Document Type
          </label>
          <select
            id="type"
            name="type"
            required
            className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none text-neutral-800 dark:text-neutral-100"
          >
            <option value="">Select document type...</option>
            {DOC_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            File
          </label>
          <div className="relative group border-2 border-dashed border-neutral-200 dark:border-neutral-700 hover:border-teal-500 dark:hover:border-teal-400 rounded-2xl p-6 text-center cursor-pointer transition-colors">
            <input
              type="file"
              name="file"
              required
              accept="image/*,.pdf"
              onChange={(e) => setFileName(e.target.files?.[0]?.name || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-2 text-neutral-500">
              <UploadCloud className="size-7 text-neutral-400 group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors" />
              <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                {fileName || "Click or drag file to upload"}
              </p>
              <p className="text-[10px] text-neutral-400">JPG, PNG, or PDF — max 10MB</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {loading ? "Uploading..." : "Submit Document"}
        </button>
      </form>
    </div>
  );
}
