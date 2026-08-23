"use client";

import { useState } from "react";
import Link from "next/link";
import { approveProperty, rejectProperty, assignTrustBadge } from "../actions";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Camera,
  Star,
  Loader2,
  UserCheck,
  Award,
  Info,
  Check,
} from "lucide-react";
import DocumentLink from "@/components/common/DocumentLink";

interface VerificationDetailClientProps {
  property: {
    id: string;
    title: string;
    description: string;
    address: string;
    city: string;
    pricePerNight: number;
    bedrooms: number;
    bathrooms: number;
    maxGuests: number;
    amenities: string[];
    images: string[];
    status: "PENDING" | "APPROVED" | "REJECTED";
    isVerified: boolean;
    rejectionReason: string | null;
    createdAt: string;
    host: {
      id: string;
      name: string | null;
      email: string;
      phone: string | null;
      avatar: string | null;
      selfieUrl: string | null;
      selfieVerifiedAt: string | null;
      isVerified: boolean;
      termsAcceptedAt: string | null;
      trustBadge: string | null;
      trustBadgeAt: string | null;
      adminVerifiedName: string | null;
      createdAt: string;
      confirmedBookings: number;
      avgRating: string;
      documents: Array<{
        id: string;
        type: string;
        fileUrl: string;
        status: string;
        uploadedAt: string;
      }>;
      properties: Array<{
        id: string;
        title: string;
        status: string;
        isVerified: boolean;
        createdAt: string;
        _count: {
          bookings: number;
          reviews: number;
        };
      }>;
      bookings: Array<{
        id: string;
        checkIn: string;
        checkOut: string;
        totalPrice: number;
        status: string;
        createdAt: string;
        property: {
          title: string;
        };
      }>;
      _count: {
        properties: number;
        bookings: number;
        reviews: number;
      };
    };
    bookings: Array<{
      id: string;
      checkIn: string;
      checkOut: string;
      totalPrice: number;
      status: string;
      createdAt: string;
      renter: {
        name: string | null;
        email: string;
      };
      payment: {
        status: string;
        amount: number;
      } | null;
    }>;
    reviews: Array<{
      id: string;
      rating: number;
      comment: string | null;
      createdAt: string;
      renter: {
        name: string | null;
      };
    }>;
  };
}

export default function VerificationDetailClient({
  property,
}: VerificationDetailClientProps) {
  const [status, setStatus] = useState(property.status);
  const [rejectionReason, setRejectionReason] = useState(
    property.rejectionReason
  );
  const [reasonInput, setReasonInput] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "properties" | "bookings" | "reviews"
  >("properties");

  // Trust Badge State
  const [badgeSelect, setBadgeSelect] = useState<string>(
    property.host.trustBadge || "Verified Host"
  );
  const [customBadge, setCustomBadge] = useState("");
  const [adminDisplayName, setAdminDisplayName] = useState(
    property.host.adminVerifiedName || "Certified by Bokra Stay Team"
  );
  const [badgeLoading, setBadgeLoading] = useState(false);
  const [badgeSuccess, setBadgeSuccess] = useState<string | null>(null);

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await approveProperty(property.id);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setStatus("APPROVED");
      setRejectionReason(null);
      setShowRejectForm(false);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to approve property."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!reasonInput.trim() || reasonInput.trim().length < 10) {
      setError(
        "Please provide a detailed rejection reason (minimum 10 characters)."
      );
      return;
    }
    setLoading(true);
    try {
      const res = await rejectProperty(property.id, reasonInput.trim());
      if (res?.error) {
        setError(res.error);
        return;
      }
      setStatus("REJECTED");
      setRejectionReason(reasonInput.trim());
      setShowRejectForm(false);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to reject property."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAssignBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    setBadgeLoading(true);
    setBadgeSuccess(null);
    setError(null);

    const finalBadge = badgeSelect === "Custom" ? customBadge : badgeSelect;
    try {
      const res = await assignTrustBadge(
        property.host.id,
        finalBadge,
        adminDisplayName
      );
      if (res?.error) {
        setError(res.error);
      } else {
        setBadgeSuccess(`Assigned "${finalBadge}" trust badge to host!`);
      }
    } catch (err) {
      setError("Failed to update trust badge.");
    } finally {
      setBadgeLoading(false);
    }
  };

  const ownershipDocs = property.host.documents.filter(
    (d) => d.type === "OWNERSHIP_PROOF" || d.type === "HOUSE_REGISTRATION"
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 font-sans">
      {/* TOP BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4 sm:px-6 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/verifications"
            className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-neutral-800 dark:text-white line-clamp-1">
                {property.title}
              </h1>
              <span
                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase shrink-0 ${
                  status === "APPROVED"
                    ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40"
                    : status === "REJECTED"
                    ? "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40"
                    : "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900/40"
                }`}
              >
                {status}
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Submitted on {new Date(property.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Action Buttons Top Bar */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowRejectForm(true)}
            disabled={loading || status === "REJECTED"}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-40 transition-colors cursor-pointer"
          >
            Reject Property
          </button>
          <button
            onClick={handleApprove}
            disabled={loading || status === "APPROVED"}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#7c3aed] hover:bg-[#6d28d9] text-white shadow-md shadow-[#7c3aed]/10 disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {loading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="size-3.5" />
            )}
            Approve Property
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-2xl text-xs font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* SECTION 1 — Property Overview */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-6 shadow-xs space-y-6">
        <h2 className="font-bold text-neutral-800 dark:text-white text-base">
          Property Overview
        </h2>

        {/* Gallery Grid */}
        {property.images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {property.images.slice(0, 4).map((img, idx) => (
              <div
                key={idx}
                className="h-44 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-800"
              >
                <img
                  src={img}
                  alt={`Property image ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-700 text-xs text-neutral-400">
            No images uploaded
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="space-y-2 md:col-span-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7c3aed]">
                Location
              </span>
              <p className="text-sm font-bold text-neutral-800 dark:text-white">
                {property.address}, {property.city}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Description
              </span>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line mt-0.5">
                {property.description}
              </p>
            </div>
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Price / Night
              </span>
              <p className="text-xl font-extrabold text-[#7c3aed] mt-0.5">
                {property.pricePerNight.toLocaleString()} ETB
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800">
                <p className="text-[10px] text-neutral-400">Bedrooms</p>
                <p className="text-sm font-bold text-neutral-800 dark:text-white">
                  {property.bedrooms}
                </p>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800">
                <p className="text-[10px] text-neutral-400">Bathrooms</p>
                <p className="text-sm font-bold text-neutral-800 dark:text-white">
                  {property.bathrooms}
                </p>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800">
                <p className="text-[10px] text-neutral-400">Max Guests</p>
                <p className="text-sm font-bold text-neutral-800 dark:text-white">
                  {property.maxGuests}
                </p>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Amenities
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {property.amenities.length > 0 ? (
                  property.amenities.map((a, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-medium bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 px-2 py-0.5 rounded-md text-neutral-700 dark:text-neutral-300"
                    >
                      {a}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-neutral-400 italic">
                    None specified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2 — Property Ownership Documents & Verification Guide */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-[#7c3aed]" />
            <h2 className="font-bold text-neutral-800 dark:text-white text-base">
              Property Ownership Documents
            </h2>
          </div>
          <span className="text-xs font-bold text-[#7c3aed] bg-purple-50 dark:bg-purple-950/30 px-3 py-1 rounded-full border border-purple-200">
            {ownershipDocs.length}{" "}
            {ownershipDocs.length === 1 ? "document" : "documents"} uploaded
          </span>
        </div>

        {/* Admin Verification Guide Box */}
        <div className="p-4 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-xl space-y-2 text-xs text-blue-900 dark:text-blue-200">
          <p className="font-extrabold flex items-center gap-1.5">
            <Info className="size-4 text-blue-600 shrink-0" />
            Admin Verification Guide
          </p>
          <p className="text-blue-800/90 dark:text-blue-300">
            The following document types are considered legitimate proof of ownership:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 font-semibold text-blue-950 dark:text-blue-100">
            <li>✓ Property Title Deed or Land Certificate</li>
            <li>✓ House Registration Certificate (Kebele)</li>
            <li>✓ Lease Agreement (minimum 1 year)</li>
            <li>✓ Government-issued Ownership Letter</li>
            <li>✓ Rental Authorization Letter</li>
          </ul>
          <p className="text-[11px] text-blue-700 dark:text-blue-400 italic pt-1">
            Review the document carefully before approving or rejecting. The AI pre-check is a guide only — your decision is final.
          </p>
        </div>

        {/* Ownership Documents Grid */}
        {ownershipDocs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ownershipDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-neutral-800 dark:text-white">
                    {doc.type.replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    AI Pre-check: APPROVED
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500 space-y-0.5">
                  <p>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                </div>
                <DocumentLink
                  fileUrl={doc.fileUrl}
                  label="View Document"
                  documentType={doc.type.replace(/_/g, " ")}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl text-xs text-amber-800 dark:text-amber-300 space-y-1">
            <p className="font-bold">⚠️ No ownership documents provided</p>
            <p className="text-[11px] text-amber-700/80">
              The host did not attach ownership proof or title deed for this specific property listing.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 3 — Assign Host Trust Level & Performance Summary */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <Award className="size-5 text-[#7c3aed]" />
          <h2 className="font-bold text-neutral-800 dark:text-white text-base">
            Host Trust Level
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Assign Badge Form */}
          <form onSubmit={handleAssignBadge} className="space-y-4">
            {badgeSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2">
                <Check className="size-4 shrink-0" />
                <span>{badgeSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Badge Name
              </label>
              <select
                value={badgeSelect}
                onChange={(e) => setBadgeSelect(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-transparent text-xs font-medium text-neutral-800 dark:text-neutral-100 focus:border-[#7c3aed] outline-none"
              >
                <option value="Verified Host">Verified Host (Default)</option>
                <option value="Top Host">Top Host (4.5+ Rating &amp; 5+ Bookings)</option>
                <option value="Trusted Partner">Trusted Partner</option>
                <option value="Premium Host">Premium Host</option>
                <option value="Custom">Custom Badge...</option>
              </select>
            </div>

            {badgeSelect === "Custom" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                  Custom Badge Title
                </label>
                <input
                  type="text"
                  value={customBadge}
                  onChange={(e) => setCustomBadge(e.target.value)}
                  placeholder="e.g. Super Host"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-transparent text-xs text-neutral-800 dark:text-neutral-100 outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Admin Display Name
              </label>
              <input
                type="text"
                value={adminDisplayName}
                onChange={(e) => setAdminDisplayName(e.target.value)}
                placeholder="e.g. Certified by Bokra Stay Team"
                className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-transparent text-xs text-neutral-800 dark:text-neutral-100 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={badgeLoading}
              className="px-5 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              {badgeLoading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Award className="size-3.5" />
              )}
              Assign Badge
            </button>
          </form>

          {/* Right: Host Performance Summary */}
          <div className="bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 space-y-3">
            <h3 className="font-bold text-xs text-neutral-700 dark:text-neutral-300 uppercase tracking-wider border-b border-neutral-200/60 dark:border-neutral-800 pb-2">
              Host Performance Summary
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-neutral-400">Properties Listed:</span>
                <p className="font-bold text-neutral-800 dark:text-white">
                  {property.host._count.properties}
                </p>
              </div>
              <div>
                <span className="text-neutral-400">Total Bookings:</span>
                <p className="font-bold text-neutral-800 dark:text-white">
                  {property.host._count.bookings}
                </p>
              </div>
              <div>
                <span className="text-neutral-400">Confirmed Bookings:</span>
                <p className="font-bold text-neutral-800 dark:text-white">
                  {property.host.confirmedBookings}
                </p>
              </div>
              <div>
                <span className="text-neutral-400">Average Rating:</span>
                <p className="font-bold text-amber-500 flex items-center gap-1">
                  <span>{property.host.avgRating}</span>
                  <Star className="size-3 fill-amber-500" />
                </p>
              </div>
              <div>
                <span className="text-neutral-400">Total Reviews:</span>
                <p className="font-bold text-neutral-800 dark:text-white">
                  {property.host._count.reviews}
                </p>
              </div>
              <div>
                <span className="text-neutral-400">Member Since:</span>
                <p className="font-bold text-neutral-800 dark:text-white">
                  {new Date(property.host.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-neutral-400">Identity Verified:</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">
                  {property.host.isVerified ? "✅ Yes" : "❌ No"}
                </p>
              </div>
              <div>
                <span className="text-neutral-400">Terms Accepted:</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">
                  {property.host.termsAcceptedAt ? "✅ Yes" : "❌ No"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4 — Host Identity & Verification Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <UserCheck className="size-5 text-[#7c3aed]" />
          <h2 className="font-bold text-neutral-800 dark:text-white text-base">
            Host Identity Details &amp; Documents
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-3">
            <div className="flex justify-between py-1">
              <span className="text-neutral-500">Host Name</span>
              <span className="font-bold text-neutral-800 dark:text-white">
                {property.host.name || "N/A"}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-neutral-500">Email</span>
              <span className="font-medium text-neutral-800 dark:text-white">
                {property.host.email}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-neutral-500">Phone</span>
              <span className="font-medium text-neutral-800 dark:text-white">
                {property.host.phone || "Not provided"}
              </span>
            </div>

            {/* Identity Documents Listing */}
            <div className="pt-2 space-y-2">
              <span className="font-bold text-neutral-700 dark:text-neutral-300 block">
                Identity Documents
              </span>
              {property.host.documents.length > 0 ? (
                <div className="space-y-2">
                  {property.host.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between">
                      <DocumentLink
                        fileUrl={doc.fileUrl}
                        label="View ID Document"
                        documentType={doc.type}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 text-sm font-medium">
                  ⚠️ This host has not uploaded any identity documents yet.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-neutral-700 dark:text-neutral-300 block">
              Live Selfie Verification
            </span>
            {property.host.selfieUrl && property.host.selfieUrl.startsWith("https://") ? (
              <div className="space-y-2">
                <img
                  src={property.host.selfieUrl}
                  alt="Host selfie"
                  className="w-32 h-32 rounded-2xl object-cover border-2 border-[#7c3aed]/20 shadow-md"
                />
                <p className="text-[10px] text-neutral-400">
                  Verified at:{" "}
                  {property.host.selfieVerifiedAt
                    ? new Date(property.host.selfieVerifiedAt).toLocaleDateString()
                    : "Pending"}
                </p>
              </div>
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-amber-600 text-xs text-center p-2 font-medium">
                ⚠️ No selfie captured yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 5 — Host Activity History Tabs */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-6 shadow-xs space-y-4">
        <h2 className="font-bold text-neutral-800 dark:text-white text-base">
          Host Activity History
        </h2>

        {/* Tab Buttons */}
        <div className="flex border-b border-neutral-100 dark:border-neutral-800 gap-6">
          <button
            onClick={() => setActiveTab("properties")}
            className={`pb-2.5 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
              activeTab === "properties"
                ? "border-[#7c3aed] text-[#7c3aed]"
                : "border-transparent text-neutral-400 hover:text-neutral-600"
            }`}
          >
            All Host Properties ({property.host.properties.length})
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`pb-2.5 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
              activeTab === "bookings"
                ? "border-[#7c3aed] text-[#7c3aed]"
                : "border-transparent text-neutral-400 hover:text-neutral-600"
            }`}
          >
            Booking History ({property.bookings.length})
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-2.5 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
              activeTab === "reviews"
                ? "border-[#7c3aed] text-[#7c3aed]"
                : "border-transparent text-neutral-400 hover:text-neutral-600"
            }`}
          >
            Reviews ({property.reviews.length})
          </button>
        </div>

        {/* Tab 1: All Host Properties */}
        {activeTab === "properties" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Bookings</th>
                  <th className="p-3">Reviews</th>
                  <th className="p-3">Listed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {property.host.properties.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30"
                  >
                    <td className="p-3 font-semibold text-neutral-800 dark:text-white">
                      {p.title}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-orange-50 text-orange-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3">{p._count.bookings}</td>
                    <td className="p-3">{p._count.reviews}</td>
                    <td className="p-3 text-neutral-400">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Booking History */}
        {activeTab === "bookings" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">Renter</th>
                  <th className="p-3">Dates</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {property.bookings.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30"
                  >
                    <td className="p-3 font-semibold">
                      {b.renter.name || b.renter.email}
                    </td>
                    <td className="p-3 text-neutral-500">
                      {new Date(b.checkIn).toLocaleDateString()} →{" "}
                      {new Date(b.checkOut).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-bold text-[#7c3aed]">
                      {b.totalPrice.toLocaleString()} ETB
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.payment?.status === "SUCCESS"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {b.payment?.status || "UNPAID"}
                      </span>
                    </td>
                    <td className="p-3 font-bold">{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Reviews */}
        {activeTab === "reviews" && (
          <div className="space-y-3">
            {property.reviews.length > 0 ? (
              property.reviews.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-100 dark:border-neutral-800 space-y-1 text-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-neutral-800 dark:text-white">
                      {r.renter.name || "Anonymous Guest"}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="size-3 fill-amber-500" />
                      <span>{r.rating} / 5</span>
                    </div>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-300 italic">
                    &quot;{r.comment}&quot;
                  </p>
                  <p className="text-[10px] text-neutral-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-400 italic">
                No reviews received yet
              </p>
            )}
          </div>
        )}
      </div>

      {/* SECTION 6 — Verification Decision Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-6 shadow-xs space-y-4">
        <h2 className="font-bold text-neutral-800 dark:text-white text-base">
          Verification Decision
        </h2>

        {status === "APPROVED" && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-6 text-emerald-600" />
              <div>
                <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                  ✅ Listing Currently Approved &amp; Published
                </p>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80">
                  This property is visible to renters on the platform.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowRejectForm(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Revoke Approval
            </button>
          </div>
        )}

        {status === "REJECTED" && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <XCircle className="size-6 text-red-600" />
                <div>
                  <p className="font-bold text-red-800 dark:text-red-300 text-sm">
                    ✗ Listing Rejected
                  </p>
                  {rejectionReason && (
                    <p className="text-xs text-red-700 dark:text-red-400 italic">
                      Reason: &quot;{rejectionReason}&quot;
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleApprove}
                disabled={loading}
                className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {loading ? "Re-approving..." : "Re-approve Listing"}
              </button>
            </div>
          </div>
        )}

        {(status === "PENDING" || showRejectForm) && (
          <div className="space-y-4">
            {showRejectForm ? (
              <form
                onSubmit={handleRejectSubmit}
                className="space-y-3 p-4 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl"
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-red-800 dark:text-red-300">
                    Reason for Rejection (Required, minimum 10 characters)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowRejectForm(false)}
                    className="text-xs text-neutral-400 hover:text-neutral-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="e.g. The uploaded house registration proof is illegible. Please re-upload a clear copy."
                  required
                  className="w-full p-3 rounded-xl border border-red-200 dark:border-red-900/40 bg-white dark:bg-neutral-900 text-xs outline-none focus:ring-2 focus:ring-red-500/20"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRejectForm(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || reasonInput.trim().length < 10}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 transition-colors"
                  >
                    {loading ? "Submitting..." : "Confirm Rejection"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={() => setShowRejectForm(true)}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl border border-red-200 text-red-600 font-bold text-xs hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                >
                  ✗ Reject Property
                </button>
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-[#7c3aed] text-white font-bold text-xs hover:bg-[#6d28d9] shadow-md shadow-[#7c3aed]/10 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-4" />
                  )}
                  ✅ Approve Property
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
