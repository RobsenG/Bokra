"use client";

import { useState } from "react";
import Link from "next/link";
import { approveProperty, rejectProperty } from "../actions";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  ExternalLink,
  Camera,
  Building2,
  Calendar,
  Star,
  Loader2,
  ShieldCheck,
  UserCheck,
  Clock,
  Sparkles,
} from "lucide-react";

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
      createdAt: string;
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

export default function VerificationDetailClient({ property }: VerificationDetailClientProps) {
  const [status, setStatus] = useState(property.status);
  const [rejectionReason, setRejectionReason] = useState(property.rejectionReason);
  const [reasonInput, setReasonInput] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"properties" | "bookings" | "reviews">("properties");

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
      setError(err instanceof Error ? err.message : "Failed to approve property.");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!reasonInput.trim() || reasonInput.trim().length < 10) {
      setError("Please provide a detailed rejection reason (minimum 10 characters).");
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
      setError(err instanceof Error ? err.message : "Failed to reject property.");
    } finally {
      setLoading(false);
    }
  };

  const ownershipDocs = property.host.documents.filter(
    (d) => d.type === "OWNERSHIP_PROOF" || d.type === "HOUSE_REGISTRATION"
  );
  const identityDocs = property.host.documents.filter(
    (d) => d.type === "ID_CARD" || d.type === "OTHER"
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
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
            className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/10 disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {loading ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
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
        <h2 className="font-bold text-neutral-800 dark:text-white text-base">Property Overview</h2>

        {/* Gallery Grid */}
        {property.images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {property.images.slice(0, 4).map((img, idx) => (
              <div key={idx} className="h-44 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-800">
                <img src={img} alt={`Property image ${idx + 1}`} className="w-full h-full object-cover" />
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
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Location</span>
              <p className="text-sm font-bold text-neutral-800 dark:text-white">{property.address}, {property.city}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Description</span>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line mt-0.5">
                {property.description}
              </p>
            </div>
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Price / Night</span>
              <p className="text-xl font-extrabold text-teal-700 dark:text-teal-300 mt-0.5">
                {property.pricePerNight.toLocaleString()} ETB
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800">
                <p className="text-[10px] text-neutral-400">Bedrooms</p>
                <p className="text-sm font-bold text-neutral-800 dark:text-white">{property.bedrooms}</p>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800">
                <p className="text-[10px] text-neutral-400">Bathrooms</p>
                <p className="text-sm font-bold text-neutral-800 dark:text-white">{property.bathrooms}</p>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800">
                <p className="text-[10px] text-neutral-400">Max Guests</p>
                <p className="text-sm font-bold text-neutral-800 dark:text-white">{property.maxGuests}</p>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Amenities</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {property.amenities.length > 0 ? (
                  property.amenities.map((a, i) => (
                    <span key={i} className="text-[10px] font-medium bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 px-2 py-0.5 rounded-md text-neutral-700 dark:text-neutral-300">
                      {a}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-neutral-400 italic">None specified</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2 — Two Column Layout (Host & Documents) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT: Host Identity & Verification Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <UserCheck className="size-5 text-teal-600" />
            <h2 className="font-bold text-neutral-800 dark:text-white text-base">Host Identity & Verification</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-neutral-500">Host Name</span>
              <span className="font-bold text-neutral-800 dark:text-white">{property.host.name || "N/A"}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-neutral-500">Email</span>
              <span className="font-medium text-neutral-800 dark:text-white">{property.host.email}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-neutral-500">Phone</span>
              <span className="font-medium text-neutral-800 dark:text-white">{property.host.phone || "Not provided"}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-neutral-500">Member Since</span>
              <span className="font-medium text-neutral-800 dark:text-white">
                {new Date(property.host.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-neutral-500">Terms Accepted</span>
              {property.host.termsAcceptedAt ? (
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  ✓ Accepted on {new Date(property.host.termsAcceptedAt).toLocaleDateString()}
                </span>
              ) : (
                <span className="font-bold text-red-600 dark:text-red-400">Not accepted</span>
              )}
            </div>
          </div>

          {/* Selfie Box */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
            <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">Live Selfie Capture</span>
            {property.host.selfieUrl ? (
              <div className="flex items-center gap-4 bg-neutral-50 dark:bg-neutral-800/40 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800">
                <img
                  src={property.host.selfieUrl}
                  alt="Host Selfie"
                  className="w-16 h-16 rounded-xl object-cover border border-teal-500"
                />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">Selfie Captured</p>
                  <p className="text-[10px] text-neutral-400">
                    Verified at: {property.host.selfieVerifiedAt ? new Date(property.host.selfieVerifiedAt).toLocaleDateString() : "Pending"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Camera className="size-4 shrink-0" />
                <span>⚠️ Host has not completed selfie verification</span>
              </div>
            )}
          </div>

          {/* Identity Documents List */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
            <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">Uploaded Identity Documents</span>
            {identityDocs.length > 0 ? (
              <div className="space-y-1.5">
                {identityDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800/40 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800 text-xs">
                    <div>
                      <p className="font-semibold text-neutral-800 dark:text-white">{doc.type.replace(/_/g, " ")}</p>
                      <span className="text-[10px] text-neutral-400">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                    </div>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 font-bold hover:underline inline-flex items-center gap-1 text-xs"
                    >
                      <span>View Document</span>
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-100 dark:border-neutral-800 text-xs text-neutral-400">
                ⚠️ No identity documents uploaded
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Property Ownership Documents Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <FileText className="size-5 text-teal-600" />
            <h2 className="font-bold text-neutral-800 dark:text-white text-base">Property Ownership Documents</h2>
          </div>

          <div className="space-y-3">
            <div className="bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/50 dark:border-teal-900/30 p-3 rounded-xl text-xs text-teal-800 dark:text-teal-300 flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5">
                <Sparkles className="size-4 text-teal-600" /> AI Pre-check Result
              </span>
              <span className="bg-teal-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full uppercase">
                {ownershipDocs.length > 0 ? "Docs Provided" : "Missing Docs"}
              </span>
            </div>

            {ownershipDocs.length > 0 ? (
              <div className="space-y-2">
                {ownershipDocs.map((doc) => (
                  <div key={doc.id} className="bg-neutral-50 dark:bg-neutral-800/40 p-3.5 rounded-xl border border-neutral-100 dark:border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-neutral-800 dark:text-white">{doc.type.replace(/_/g, " ")}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                        {doc.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-400">Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors"
                    >
                      <span>View Full Document</span>
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl text-xs text-amber-800 dark:text-amber-300 space-y-1">
                <p className="font-bold">⚠️ No ownership documents provided</p>
                <p className="text-[11px] text-amber-700/80">The host did not attach ownership proof or title deed for this specific property listing.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3 — Host Activity History Tabs */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-6 shadow-xs space-y-4">
        <h2 className="font-bold text-neutral-800 dark:text-white text-base">Host Activity History</h2>

        {/* Tab Buttons */}
        <div className="flex border-b border-neutral-100 dark:border-neutral-800 gap-6">
          <button
            onClick={() => setActiveTab("properties")}
            className={`pb-2.5 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
              activeTab === "properties"
                ? "border-teal-600 text-teal-600 dark:text-teal-400"
                : "border-transparent text-neutral-400 hover:text-neutral-600"
            }`}
          >
            All Host Properties ({property.host.properties.length})
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`pb-2.5 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
              activeTab === "bookings"
                ? "border-teal-600 text-teal-600 dark:text-teal-400"
                : "border-transparent text-neutral-400 hover:text-neutral-600"
            }`}
          >
            Booking History on Platform ({property.bookings.length})
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-2.5 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
              activeTab === "reviews"
                ? "border-teal-600 text-teal-600 dark:text-teal-400"
                : "border-transparent text-neutral-400 hover:text-neutral-600"
            }`}
          >
            Reviews Received ({property.reviews.length})
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
                  <tr key={p.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                    <td className="p-3 font-semibold text-neutral-800 dark:text-white">{p.title}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === "APPROVED" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3">{p._count.bookings}</td>
                    <td className="p-3">{p._count.reviews}</td>
                    <td className="p-3 text-neutral-400">{new Date(p.createdAt).toLocaleDateString()}</td>
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
                  <tr key={b.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                    <td className="p-3 font-semibold">{b.renter.name || b.renter.email}</td>
                    <td className="p-3 text-neutral-500">
                      {new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-bold text-teal-700 dark:text-teal-400">{b.totalPrice.toLocaleString()} ETB</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.payment?.status === "SUCCESS" ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-600"
                      }`}>
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
                <div key={r.id} className="p-3.5 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-100 dark:border-neutral-800 space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-neutral-800 dark:text-white">{r.renter.name || "Anonymous Guest"}</span>
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="size-3 fill-amber-500" />
                      <span>{r.rating} / 5</span>
                    </div>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-300 italic">&quot;{r.comment}&quot;</p>
                  <p className="text-[10px] text-neutral-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-400 italic">No reviews received yet</p>
            )}
          </div>
        )}
      </div>

      {/* SECTION 4 — Verification Decision Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-6 shadow-xs space-y-4">
        <h2 className="font-bold text-neutral-800 dark:text-white text-base">Verification Decision</h2>

        {status === "APPROVED" && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-6 text-emerald-600" />
              <div>
                <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">✅ Listing Currently Approved &amp; Published</p>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80">This property is visible to renters on the platform.</p>
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
                  <p className="font-bold text-red-800 dark:text-red-300 text-sm">✗ Listing Rejected</p>
                  {rejectionReason && (
                    <p className="text-xs text-red-700 dark:text-red-400 italic">Reason: &quot;{rejectionReason}&quot;</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleApprove}
                disabled={loading}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {loading ? "Re-approving..." : "Re-approve Listing"}
              </button>
            </div>
          </div>
        )}

        {/* If pending or when reject button is clicked */}
        {(status === "PENDING" || showRejectForm) && (
          <div className="space-y-4">
            {showRejectForm ? (
              <form onSubmit={handleRejectSubmit} className="space-y-3 p-4 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl">
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
                  className="flex-1 py-3 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 shadow-md shadow-teal-600/10 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
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
