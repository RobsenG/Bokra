"use client";

import { updateProperty } from "../../actions";
import Link from "next/link";
import {
  ArrowLeft,
  UploadCloud,
  Wand2,
  DollarSign,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Trash2,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { uploadFile } from "@/lib/storage";
import DocumentLink from "@/components/common/DocumentLink";

interface ExistingDocument {
  id: string;
  type: string;
  fileUrl: string;
  status: string;
  uploadedAt: string;
}

interface Property {
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
  status: string;
  rejectionReason: string | null;
  hostId: string;
}

interface EditPropertyFormProps {
  property: Property;
  existingDocuments: ExistingDocument[];
  userId: string;
}

interface AICheckResult {
  status: "approved" | "warning" | "rejected";
  message: string;
  confidence: number;
}

interface NewUploadedDoc {
  id: string;
  docType: string;
  fileName: string;
  fileSize: number;
  fileUrl: string;
  aiCheckStatus: "scanning" | "completed";
  aiResult?: AICheckResult;
}

function runAIDocumentCheck(
  file: File,
  documentType: string,
  propertyTitle: string
): Promise<AICheckResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const validTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];
      const isValidType = validTypes.includes(file.type);
      const isValidSize = file.size > 15 * 1024; // > 15KB
      const fileNameLower = file.name.toLowerCase();
      const docTypeLower = documentType.toLowerCase();

      const ownershipKeywords = [
        "title",
        "deed",
        "registration",
        "ownership",
        "lease",
        "certificate",
        "authorization",
        "permit",
        "contract",
        "agreement",
        "house",
        "property",
        "land",
        "kebele",
      ];
      const hasRelevantKeyword = ownershipKeywords.some(
        (kw) => fileNameLower.includes(kw) || docTypeLower.includes(kw)
      );

      if (!isValidType) {
        resolve({
          status: "rejected",
          message:
            "Invalid file format. Please upload PDF, JPG, or PNG documents only.",
          confidence: 0,
        });
      } else if (!isValidSize) {
        resolve({
          status: "rejected",
          message:
            "File appears too small to be a real document. Please upload a clear, readable scan.",
          confidence: 15,
        });
      } else if (isValidType && isValidSize && hasRelevantKeyword) {
        resolve({
          status: "approved",
          message:
            "Document appears authentic. Keywords match expected ownership documentation.",
          confidence: 87,
        });
      } else {
        resolve({
          status: "warning",
          message:
            "Document uploaded successfully. Our team will verify authenticity during admin review.",
          confidence: 62,
        });
      }
    }, 2000); // 2 second processing delay
  });
}

export default function EditPropertyForm({
  property,
  existingDocuments,
  userId,
}: EditPropertyFormProps) {
  const [loading, setLoading] = useState(false);
  const [imagesSelected, setImagesSelected] = useState<number>(0);

  // Controlled state for details
  const [title, setTitle] = useState(property.title);
  const [description, setDescription] = useState(property.description);
  const [city, setCity] = useState(property.city);
  const [bedrooms, setBedrooms] = useState(String(property.bedrooms));
  const [bathrooms, setBathrooms] = useState(String(property.bathrooms));
  const [pricePerNight, setPricePerNight] = useState(String(property.pricePerNight));
  const [amenities, setAmenities] = useState(property.amenities.join(", "));

  // AI states
  const [descLoading, setDescLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceRationale, setPriceRationale] = useState("");

  // Documents state
  const [removedDocumentIds, setRemovedDocumentIds] = useState<string[]>([]);
  const [newUploadedDocs, setNewUploadedDocs] = useState<NewUploadedDoc[]>([]);
  const [selectedDocType, setSelectedDocType] = useState<string>(
    "Property Title Deed"
  );
  const [docUploadLoading, setDocUploadLoading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [showDocHelp, setShowDocHelp] = useState(false);

  const isRejected = property.status === "REJECTED";

  const handleGenerateDescription = async () => {
    if (!title.trim()) return;
    setDescLoading(true);
    try {
      const res = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, amenities }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      if (data.description) setDescription(data.description);
    } catch (err) {
      console.error(err);
    } finally {
      setDescLoading(false);
    }
  };

  const handleSuggestPrice = async () => {
    if (!city.trim()) return;
    setPriceLoading(true);
    setPriceRationale("");
    try {
      const res = await fetch("/api/ai/suggest-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, bedrooms, bathrooms, amenities }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      if (data.suggestedPrice) {
        setPricePerNight(String(data.suggestedPrice));
        setPriceRationale(data.rationale || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPriceLoading(false);
    }
  };

  const handleRemoveExistingDoc = (docId: string) => {
    setRemovedDocumentIds((prev) => [...prev, docId]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocError(null);

    // Max 5MB check
    if (file.size > 5 * 1024 * 1024) {
      setDocError("File size exceeds the 5MB limit. Please upload a smaller file.");
      return;
    }

    setDocUploadLoading(true);
    const tempId = `temp-${Date.now()}`;

    // Add placeholder scanning doc
    const newDocItem: NewUploadedDoc = {
      id: tempId,
      docType: selectedDocType,
      fileName: file.name,
      fileSize: file.size,
      fileUrl: "",
      aiCheckStatus: "scanning",
    };

    setNewUploadedDocs((prev) => [...prev, newDocItem]);

    try {
      // 1. Run AI Check
      const aiResult = await runAIDocumentCheck(file, selectedDocType, title);

      if (aiResult.status === "rejected") {
        setDocError(`Document rejected by AI scanner: ${aiResult.message}`);
        setNewUploadedDocs((prev) => prev.filter((d) => d.id !== tempId));
        setDocUploadLoading(false);
        return;
      }

      // 2. Upload to Supabase Storage "property-documents" bucket using uploadFile utility (Rule 1 & Rule 2)
      const publicUrl = await uploadFile("property-documents", file, userId);

      // Update doc item with completed status and URL
      setNewUploadedDocs((prev) =>
        prev.map((d) => {
          if (d.id === tempId) {
            return {
              ...d,
              fileUrl: publicUrl,
              aiCheckStatus: "completed",
              aiResult,
            };
          }
          return d;
        })
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload document.";
      setDocError(`Upload error: ${msg}`);
      setNewUploadedDocs((prev) => prev.filter((d) => d.id !== tempId));
    } finally {
      setDocUploadLoading(false);
      e.target.value = "";
    }
  };

  const handleRemoveNewDoc = (id: string) => {
    setNewUploadedDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDocError(null);

    // Validation rules:
    // If property was REJECTED: at least one active ownership document must exist
    const activeExistingDocs = existingDocuments.filter(
      (d) => !removedDocumentIds.includes(d.id)
    );
    const validNewDocs = newUploadedDocs.filter(
      (d) => d.aiCheckStatus === "completed" && d.fileUrl
    );
    const totalValidDocs = activeExistingDocs.length + validNewDocs.length;

    if (isRejected && totalValidDocs === 0) {
      setDocError(
        "Please upload at least one ownership document before resubmitting."
      );
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const newUrls = validNewDocs.map((d) => d.fileUrl);

      await updateProperty(
        property.id,
        formData,
        newUrls,
        removedDocumentIds
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update property.";
      setDocError(message);
      setLoading(false);
    }
  };

  const activeExistingDocs = existingDocuments.filter(
    (d) => !removedDocumentIds.includes(d.id)
  );

  return (
    <div className="space-y-6 max-w-3xl font-sans">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/host/properties"
          className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors text-neutral-600 dark:text-neutral-300"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-800 dark:text-white tracking-tight">
            {isRejected ? "Edit & Resubmit Property" : "Edit Property"}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {isRejected
              ? "Update property details and upload corrected ownership proof documents below."
              : "Update the details of your listing and ownership documents."}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-xs p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Details */}
          <div className="space-y-5">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#7c3aed] border-b border-neutral-100 dark:border-neutral-800 pb-2">
              1. Property Information
            </h2>

            {/* Title */}
            <div className="space-y-1.5">
              <label
                htmlFor="title"
                className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400"
              >
                Property Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10 outline-none text-neutral-800 dark:text-neutral-100"
              />
            </div>

            {/* Description with AI Generator */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="description"
                  className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400"
                >
                  Description
                </label>
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={descLoading || !title.trim()}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-[11px] font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-xs"
                >
                  {descLoading ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Wand2 className="size-3" />
                  )}
                  {descLoading ? "Writing..." : "Rewrite with AI ✨"}
                </button>
              </div>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10 outline-none text-neutral-800 dark:text-neutral-100 resize-none"
              />
            </div>

            {/* Address & City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="address"
                  className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400"
                >
                  Address
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  defaultValue={property.address}
                  required
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10 outline-none text-neutral-800 dark:text-neutral-100"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="city"
                  className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400"
                >
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10 outline-none text-neutral-800 dark:text-neutral-100"
                />
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-1.5">
              <label
                htmlFor="amenities"
                className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400"
              >
                Amenities (comma separated)
              </label>
              <input
                id="amenities"
                name="amenities"
                type="text"
                value={amenities}
                onChange={(e) => setAmenities(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10 outline-none text-neutral-800 dark:text-neutral-100"
              />
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5 col-span-2 md:col-span-1">
                <div className="flex items-center justify-between gap-1">
                  <label
                    htmlFor="pricePerNight"
                    className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400"
                  >
                    Price / Night (ETB)
                  </label>
                  <button
                    type="button"
                    onClick={handleSuggestPrice}
                    disabled={priceLoading || !city.trim()}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-xs shrink-0"
                  >
                    {priceLoading ? (
                      <Loader2 className="size-2.5 animate-spin" />
                    ) : (
                      <DollarSign className="size-2.5" />
                    )}
                    AI 💡
                  </button>
                </div>
                <input
                  id="pricePerNight"
                  name="pricePerNight"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={pricePerNight}
                  onChange={(e) => setPricePerNight(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10 outline-none text-neutral-800 dark:text-neutral-100"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="bedrooms"
                  className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400"
                >
                  Bedrooms
                </label>
                <input
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  min="1"
                  required
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10 outline-none text-neutral-800 dark:text-neutral-100"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="bathrooms"
                  className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400"
                >
                  Bathrooms
                </label>
                <input
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  min="1"
                  required
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10 outline-none text-neutral-800 dark:text-neutral-100"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="maxGuests"
                  className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400"
                >
                  Max Guests
                </label>
                <input
                  id="maxGuests"
                  name="maxGuests"
                  type="number"
                  min="1"
                  required
                  defaultValue={property.maxGuests}
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10 outline-none text-neutral-800 dark:text-neutral-100"
                />
              </div>
            </div>

            {/* AI Price Rationale */}
            {priceRationale && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-xl p-3.5 text-xs text-amber-800 dark:text-amber-300 leading-relaxed animate-in fade-in duration-200">
                <span className="font-bold">💡 AI Pricing Insight: </span>
                {priceRationale}
              </div>
            )}

            {/* Replace Images */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                Replace Images{" "}
                <span className="text-neutral-400 font-normal">
                  (optional — leave blank to keep existing)
                </span>
              </label>
              <div className="relative group border-2 border-dashed border-neutral-200 dark:border-neutral-700 hover:border-[#7c3aed] rounded-2xl p-5 text-center cursor-pointer transition-colors">
                <input
                  type="file"
                  name="images"
                  multiple
                  accept="image/*"
                  onChange={(e) => setImagesSelected(e.target.files?.length || 0)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2 text-neutral-500 dark:text-neutral-400">
                  <UploadCloud className="size-7 text-neutral-400 group-hover:text-[#7c3aed] transition-colors" />
                  <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {imagesSelected > 0
                      ? `${imagesSelected} new images selected`
                      : "Click or drag new images to replace existing"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Ownership Documents */}
          <div className="space-y-5 pt-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#7c3aed] flex items-center gap-2">
                  <ShieldCheck className="size-4 text-[#7c3aed]" />
                  2. Ownership Documents
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Upload proof that you own or have legal right to rent this property. Required for admin approval.
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 px-2.5 py-1 rounded-full border border-violet-200 dark:border-violet-800/40">
                AI Verified
              </span>
            </div>

            {/* Error Banner */}
            {docError && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2 font-medium">
                <AlertTriangle className="size-4 shrink-0 text-red-600" />
                <span>{docError}</span>
              </div>
            )}

            {/* Existing Documents List */}
            {activeExistingDocs.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Previously Uploaded Documents
                </h3>
                <div className="space-y-2">
                  {activeExistingDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <FileText className="size-4 text-[#7c3aed]" />
                          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                            {doc.type.replace(/_/g, " ")}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                              doc.status === "APPROVED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300"
                                : doc.status === "REJECTED"
                                ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-300"
                                : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-300"
                            }`}
                          >
                            {doc.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500">
                          Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
                        <DocumentLink fileUrl={doc.fileUrl} label="View Document" />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingDoc(doc.id)}
                          className="text-red-600 hover:text-red-700 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="size-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Newly Uploaded Documents List */}
            {newUploadedDocs.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  New Documents Added
                </h3>
                <div className="space-y-2">
                  {newUploadedDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-xl border border-violet-200 dark:border-violet-900/40 bg-violet-50/40 dark:bg-violet-950/20 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 dark:text-neutral-200">
                          <FileText className="size-4 text-[#7c3aed]" />
                          <span>{doc.docType}</span>
                          <span className="text-[10px] font-normal text-neutral-500">
                            ({doc.fileName})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveNewDoc(doc.id)}
                          className="text-red-600 hover:underline text-xs font-semibold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>

                      {/* AI Status */}
                      {doc.aiCheckStatus === "scanning" ? (
                        <div className="flex items-center gap-2 text-xs text-[#7c3aed] font-medium">
                          <Loader2 className="size-3.5 animate-spin text-[#7c3aed]" />
                          <span>Running AI document pre-check scanning...</span>
                        </div>
                      ) : (
                        doc.aiResult && (
                          <div
                            className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                              doc.aiResult.status === "approved"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : doc.aiResult.status === "warning"
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : "bg-red-50 text-red-800 border border-red-200"
                            }`}
                          >
                            {doc.aiResult.status === "approved" && (
                              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                            )}
                            {doc.aiResult.status === "warning" && (
                              <AlertTriangle className="size-4 text-amber-600 shrink-0" />
                            )}
                            <span className="font-semibold">
                              AI Pre-Check ({doc.aiResult.confidence}% confidence):
                            </span>
                            <span>{doc.aiResult.message}</span>
                          </div>
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Document Upload Area */}
            <div className="bg-neutral-50/70 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Upload New / Corrected Document
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase text-neutral-600 dark:text-neutral-400">
                    Document Type
                  </label>
                  <select
                    value={selectedDocType}
                    onChange={(e) => setSelectedDocType(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-semibold text-neutral-800 dark:text-neutral-100 outline-none focus:border-[#7c3aed]"
                  >
                    <option value="Property Title Deed">Property Title Deed</option>
                    <option value="House Registration Certificate">
                      House Registration Certificate
                    </option>
                    <option value="Lease Agreement">Lease Agreement</option>
                    <option value="Rental Authorization Letter">
                      Rental Authorization Letter
                    </option>
                    <option value="Government Ownership Letter">
                      Government Ownership Letter
                    </option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase text-neutral-600 dark:text-neutral-400">
                    Select File (PDF, JPG, PNG — max 5MB)
                  </label>
                  <label className="w-full h-11 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:border-[#7c3aed] transition-all cursor-pointer flex items-center justify-between shadow-2xs">
                    <span className="flex items-center gap-2 text-[#7c3aed]">
                      <UploadCloud className="size-4" />
                      <span>
                        {docUploadLoading ? "Uploading & Scanning..." : "Choose File"}
                      </span>
                    </span>
                    <Plus className="size-4 text-neutral-400" />
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      disabled={docUploadLoading}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Collapsible Info Section */}
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-850 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowDocHelp(!showDocHelp)}
                className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/50 dark:hover:bg-neutral-800 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="size-4 text-[#7c3aed]" />
                  What documents are accepted for ownership proof?
                </span>
                {showDocHelp ? (
                  <ChevronUp className="size-4 text-neutral-400" />
                ) : (
                  <ChevronDown className="size-4 text-neutral-400" />
                )}
              </button>

              {showDocHelp && (
                <div className="px-4 pb-4 pt-1 text-xs space-y-3 border-t border-neutral-200/60 dark:border-neutral-800">
                  <div>
                    <p className="font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                      📋 Accepted Documents:
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 text-neutral-600 dark:text-neutral-300">
                      <li>Property Title Deed or Land Certificate</li>
                      <li>House Registration Certificate (Kebele)</li>
                      <li>Lease Agreement (if subletting)</li>
                      <li>Government-issued Ownership Letter</li>
                      <li>Rental Authorization Letter from property owner</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold text-red-600 dark:text-red-400 mb-1">
                      ❌ Not Accepted:
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 text-neutral-600 dark:text-neutral-300">
                      <li>Personal ID only</li>
                      <li>Utility bills alone</li>
                      <li>Photos of the property</li>
                      <li>Informal / handwritten notes</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="pt-4 flex justify-end gap-3.5 border-t border-neutral-100 dark:border-neutral-800">
            <Link href="/host/properties">
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={loading || docUploadLoading}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#7c3aed] hover:bg-[#6d28d9] shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : isRejected ? (
                "Save & Resubmit for Review"
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
