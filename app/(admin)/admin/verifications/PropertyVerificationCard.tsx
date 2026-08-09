"use client";

import { useState } from "react";
import { approveProperty, rejectProperty } from "./actions";
import { FileText, ExternalLink, AlertCircle, Loader2, X, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PropertyVerificationCardProps {
  property: {
    id: string;
    title: string;
    address: string;
    city: string;
    pricePerNight: number;
    images: string[];
    host: {
      id: string;
      name: string | null;
      email: string;
    };
    documents: Array<{
      id: string;
      type: string;
      fileUrl: string;
    }>;
  };
}

export default function PropertyVerificationCard({ property }: PropertyVerificationCardProps) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await approveProperty(property.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to approve listing.");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reason.trim() || reason.trim().length < 10) {
      setError("Please provide a detailed rejection reason (minimum 10 characters).");
      return;
    }

    setLoading(true);
    try {
      const res = await rejectProperty(property.id, reason.trim());
      if (res?.error) {
        setError(res.error);
        return;
      }
      setShowRejectForm(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reject listing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-xs space-y-4">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1">
          <h3 className="font-bold text-neutral-800 dark:text-neutral-200 text-sm line-clamp-1">
            {property.title}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Submitted by: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{property.host.name || property.host.email}</span>
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Location: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{property.address}, {property.city}</span>
          </p>
        </div>
        <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 px-2.5 py-1 rounded-full shrink-0">
          {property.pricePerNight.toLocaleString()} ETB / night
        </span>
      </div>

      {property.images[0] && (
        <div
          className="h-32 w-full rounded-xl bg-cover bg-center bg-neutral-100 dark:bg-neutral-800"
          style={{ backgroundImage: `url(${property.images[0]})` }}
        />
      )}

      {/* Uploaded Property Ownership Documents */}
      <div className="bg-neutral-50 dark:bg-neutral-800/40 rounded-xl p-3.5 border border-neutral-100 dark:border-neutral-800 space-y-2">
        <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
          <FileText className="size-4 text-teal-600" />
          <span>Property Ownership Proof Documents</span>
        </p>
        {property.documents.length === 0 ? (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            ⚠️ No explicit ownership docs uploaded for this listing.
          </p>
        ) : (
          <div className="space-y-1.5">
            {property.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between bg-white dark:bg-neutral-900 p-2 px-3 rounded-lg border border-neutral-200/60 dark:border-neutral-800 text-xs">
                <span className="font-medium text-neutral-700 dark:text-neutral-300 truncate max-w-[180px]">
                  {doc.type.replace(/_/g, " ")}
                </span>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 dark:text-teal-400 font-bold hover:underline inline-flex items-center gap-1 text-[11px]"
                >
                  <span>View Document</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Link
          href={`/admin/verifications/${property.id}`}
          className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
        >
          <span>View Full Details</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Reject Reason Form Inline */}
      {showRejectForm ? (
        <form onSubmit={handleRejectSubmit} className="space-y-3 p-3.5 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-red-800 dark:text-red-300">
              Reason for Rejection (Required, min 10 chars)
            </label>
            <button
              type="button"
              onClick={() => {
                setShowRejectForm(false);
                setError(null);
              }}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Documents appear incomplete. The ownership proof does not match the property address provided."
            required
            className="w-full p-2.5 rounded-lg border border-red-200 dark:border-red-900/40 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500/20"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowRejectForm(false)}
              disabled={loading}
              className="flex-1 py-2 rounded-lg text-xs font-semibold border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || reason.trim().length < 10}
              className="flex-1 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {loading ? <Loader2 className="size-3.5 animate-spin" /> : "Confirm Rejection"}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => setShowRejectForm(true)}
            disabled={loading}
            className="flex-1 text-xs py-2.5 rounded-xl border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold transition-colors cursor-pointer"
          >
            Reject Listing
          </button>
          <button
            type="button"
            onClick={handleApprove}
            disabled={loading}
            className="flex-1 text-xs py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold shadow-md shadow-teal-600/10 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            {loading ? <Loader2 className="size-3.5 animate-spin" /> : "Approve & Publish Listing"}
          </button>
        </div>
      )}
    </div>
  );
}
