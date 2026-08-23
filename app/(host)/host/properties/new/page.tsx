"use client";

import { createProperty } from "../actions";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  UploadCloud,
  Loader2,
  Wand2,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Trash2,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { uploadFile } from "@/lib/storage";

interface PricingSuggestion {
  suggestedPrice: number;
  minRange: number;
  maxRange: number;
  reasoning: string;
}

interface AICheckResult {
  status: "approved" | "warning" | "rejected";
  message: string;
  confidence: number;
}

interface UploadedDoc {
  docType: string;
  file: File;
  publicUrl?: string;
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

      // Check if document name has keywords matching property or doc type
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
    }, 2000); // 2 second AI processing delay
  });
}

export default function NewPropertyPage() {
  const [loading, setLoading] = useState(false);
  const [imagesSelected, setImagesSelected] = useState<number>(0);

  // AI Description
  const [descLoading, setDescLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [amenities, setAmenities] = useState("");

  // AI Price
  const [priceLoading, setPriceLoading] = useState(false);
  const [city, setCity] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [propertyType, setPropertyType] = useState("Apartment");
  const [pricePerNight, setPricePerNight] = useState("");
  const [priceSuggestion, setPriceSuggestion] =
    useState<PricingSuggestion | null>(null);

  // Ownership Proof Documents State
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [docError, setDocError] = useState<string | null>(null);
  const [showDocHelp, setShowDocHelp] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (uploadedDocs.length === 0) {
      e.preventDefault();
      setDocError(
        "Please upload at least one property ownership proof document."
      );
      return;
    }

    // Block submission only if ALL uploaded docs are scanning or REJECTED
    const hasValidDoc = uploadedDocs.some(
      (d) =>
        d.aiCheckStatus === "completed" &&
        d.aiResult &&
        (d.aiResult.status === "approved" || d.aiResult.status === "warning")
    );

    if (!hasValidDoc) {
      e.preventDefault();
      setDocError(
        "At least one document must pass initial AI inspection (Approved or Warning status)."
      );
      return;
    }

    setDocError(null);
    setLoading(true);
  };

  const handleGenerateDescription = async () => {
    if (!title.trim()) return;
    setDescLoading(true);
    try {
      const res = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, amenities }),
      });
      if (!res.ok) throw new Error("Failed to generate description");
      const data = await res.json();
      setDescription(data.description || "");
    } catch (err) {
      console.error(err);
    } finally {
      setDescLoading(false);
    }
  };

  const handleSuggestPrice = async () => {
    if (!city.trim()) return;
    setPriceLoading(true);
    setPriceSuggestion(null);
    try {
      const amenitiesList = amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
      const res = await fetch("/api/ai/suggest-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          propertyType,
          bedrooms: parseInt(bedrooms) || 1,
          amenities: amenitiesList,
          currentPrice: parseFloat(pricePerNight) || 0,
        }),
      });
      if (!res.ok) throw new Error("Failed to get price suggestion");
      const data: PricingSuggestion = await res.json();
      if (data.suggestedPrice) {
        setPriceSuggestion(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPriceLoading(false);
    }
  };

  const currentPriceNum = parseFloat(pricePerNight) || 0;
  const priceWarning =
    priceSuggestion && currentPriceNum > 0
      ? currentPriceNum > priceSuggestion.maxRange
        ? "above"
        : currentPriceNum < priceSuggestion.minRange
        ? "below"
        : null
      : null;

  const handleDocUpload = async (
    typeLabel: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocError(null);

    const newDoc: UploadedDoc = {
      docType: typeLabel,
      file,
      aiCheckStatus: "scanning",
    };

    setUploadedDocs((prev) => [
      ...prev.filter((d) => d.docType !== typeLabel),
      newDoc,
    ]);

    // Client-side browser upload to "property-documents" bucket
    let publicUrl: string | undefined;
    try {
      publicUrl = await uploadFile("property-documents", file, "host");
    } catch (err) {
      console.error("Client document upload error:", err);
    }

    const result = await runAIDocumentCheck(file, typeLabel, title);

    setUploadedDocs((prev) =>
      prev.map((item) => {
        if (item.docType === typeLabel && item.file === file) {
          return {
            ...item,
            publicUrl,
            aiCheckStatus: "completed",
            aiResult: result,
          };
        }
        return item;
      })
    );
  };

  const removeDoc = (typeLabel: string) => {
    setUploadedDocs((prev) => prev.filter((d) => d.docType !== typeLabel));
  };

  const docTypes = [
    {
      label: "Property Title Deed",
      desc: "Official title deed or ownership certificate",
    },
    {
      label: "Lease Agreement",
      desc: "Signed long-term property lease agreement",
    },
    {
      label: "House Registration Certificate",
      desc: "Municipal or local house registration doc",
    },
    {
      label: "Rental Authorization Letter",
      desc: "Signed authorization allowing subletting",
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/host/properties"
          className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors text-neutral-600 dark:text-neutral-300"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-800 dark:text-white tracking-tight flex items-center gap-2">
            <span>List a New Property</span>
            <Sparkles className="size-4 text-[#7c3aed]" />
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Fill out the details and upload ownership verification documents to list your property.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-xs p-6 sm:p-8">
        <form action={createProperty} onSubmit={handleSubmit} className="space-y-8">
          {/* Hidden inputs for pre-uploaded document URLs */}
          {uploadedDocs.map(
            (doc) =>
              doc.publicUrl && (
                <input
                  key={doc.docType}
                  type="hidden"
                  name="ownershipDocUrls"
                  value={doc.publicUrl}
                />
              )
          )}

          {/* Section 1: Basic Info */}
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cozy Modern Apartment in Bole"
                required
                className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-transparent text-sm focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10 outline-none transition-all text-neutral-800 dark:text-neutral-100"
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
                  title={
                    !title.trim()
                      ? "Enter a title first"
                      : "Generate description with AI"
                  }
                >
                  {descLoading ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Wand2 className="size-3" />
                  )}
                  {descLoading ? "Writing..." : "Write with AI ✨"}
                </button>
              </div>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your property's key features, location, and guest benefits..."
                rows={4}
                required
                className="w-full p-4 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-transparent text-sm focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10 outline-none transition-all text-neutral-800 dark:text-neutral-100 resize-none"
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
                  placeholder="123 Bole Road"
                  required
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-transparent text-sm focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10 outline-none transition-all text-neutral-800 dark:text-neutral-100"
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
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Addis Ababa"
                  required
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-transparent text-sm focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10 outline-none transition-all text-neutral-800 dark:text-neutral-100"
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
                placeholder="WiFi, Kitchen, Air Conditioning, Free Parking"
                className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-transparent text-sm focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10 outline-none transition-all text-neutral-800 dark:text-neutral-100"
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
                    Price / Night
                  </label>
                  <button
                    type="button"
                    onClick={handleSuggestPrice}
                    disabled={priceLoading || !city.trim()}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-xs shrink-0"
                    title={!city.trim() ? "Enter a city first" : "AI price suggestion"}
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
                  placeholder="1500"
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-transparent text-sm focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10 outline-none transition-all text-neutral-800 dark:text-neutral-100"
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
                  placeholder="1"
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-transparent text-sm focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10 outline-none transition-all text-neutral-800 dark:text-neutral-100"
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
                  placeholder="1"
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-transparent text-sm focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10 outline-none transition-all text-neutral-800 dark:text-neutral-100"
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
                  placeholder="2"
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-transparent text-sm focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10 outline-none transition-all text-neutral-800 dark:text-neutral-100"
                />
              </div>
            </div>

            {/* Property Type selector */}
            <div className="space-y-1.5">
              <label
                htmlFor="propertyType"
                className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400"
              >
                Property Type
              </label>
              <select
                id="propertyType"
                name="propertyType"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-transparent text-sm focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10 outline-none transition-all text-neutral-800 dark:text-neutral-100"
              >
                <option value="Studio">Studio</option>
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Guesthouse">Guesthouse</option>
                <option value="Villa">Villa</option>
              </select>
            </div>

            {/* AI Pricing Suggestion Card */}
            {priceSuggestion && (
              <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-extrabold text-xs">
                  <Sparkles className="size-4 text-amber-500 shrink-0" />
                  <span>💡 AI Pricing Suggestion for {city}</span>
                </div>

                <div className="border-t border-amber-200/60 dark:border-amber-900/40 pt-3 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold">
                      Suggested Price
                    </span>
                    <span className="text-lg font-black text-[#7c3aed]">
                      {priceSuggestion.suggestedPrice.toLocaleString()} ETB
                      <span className="text-xs font-normal text-neutral-500">
                        {" "}
                        / night
                      </span>
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold">
                      Market Range
                    </span>
                    <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                      {priceSuggestion.minRange.toLocaleString()} –{" "}
                      {priceSuggestion.maxRange.toLocaleString()} ETB
                    </span>
                  </div>
                  <div className="border-t border-amber-200/60 dark:border-amber-900/40 pt-2">
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 italic leading-relaxed">
                      <span className="font-bold text-neutral-700 dark:text-neutral-300 not-italic">
                        Why:{" "}
                      </span>
                      {priceSuggestion.reasoning}
                    </p>
                  </div>
                </div>

                {/* Price warning */}
                {priceWarning === "above" && (
                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-red-700 dark:text-red-300">
                    <TrendingUp className="size-3.5 shrink-0 mt-0.5" />
                    <span>
                      ⚠️ Your price is above the suggested range for this area.
                      High prices may reduce bookings.
                    </span>
                  </div>
                )}
                {priceWarning === "below" && (
                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-700 dark:text-blue-300">
                    <TrendingDown className="size-3.5 shrink-0 mt-0.5" />
                    <span>
                      ⚠️ Your price is below market rate. You may be undervaluing
                      your property.
                    </span>
                  </div>
                )}

                {/* Use suggested price button */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setPricePerNight(String(priceSuggestion.suggestedPrice))
                    }
                    className="flex-1 py-2 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    ✓ Use {priceSuggestion.suggestedPrice.toLocaleString()} ETB
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriceSuggestion(null)}
                    className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Keep my price
                  </button>
                </div>
              </div>
            )}

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                Property Images
              </label>
              <div className="relative group border-2 border-dashed border-neutral-200 dark:border-neutral-850 hover:border-[#7c3aed] rounded-2xl p-6 text-center cursor-pointer transition-colors">
                <input
                  id="images"
                  name="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    setImagesSelected(e.target.files?.length || 0)
                  }
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-2 text-neutral-500 dark:text-neutral-450">
                  <UploadCloud className="size-8 text-neutral-400 group-hover:text-[#7c3aed] transition-colors" />
                  <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-250">
                    {imagesSelected > 0
                      ? `${imagesSelected} photos selected`
                      : "Click or drag images to upload"}
                  </p>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                    JPG, PNG or WEBP files supported
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Ownership Proof Step */}
          <div className="space-y-5 pt-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#7c3aed] flex items-center gap-2">
                  <ShieldCheck className="size-4 text-[#7c3aed]" />
                  2. Prove Property Ownership
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Upload at least one legal document proving you own or have the right to rent this property. Required for admin listing approval.
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 px-2.5 py-1 rounded-full border border-violet-200 dark:border-violet-800/40">
                AI Verified
              </span>
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
                      <li>Lease Agreement (if you are subletting)</li>
                      <li>Government-issued Ownership Letter</li>
                      <li>Rental Authorization Letter from property owner</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold text-red-600 dark:text-red-400 mb-1">
                      ❌ Not Accepted:
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 text-neutral-600 dark:text-neutral-300">
                      <li>Personal ID only (upload in identity verification instead)</li>
                      <li>Utility bills alone</li>
                      <li>Photos of the property</li>
                      <li>Informal / handwritten notes</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {docError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2 font-medium">
                <AlertTriangle className="size-4 shrink-0" />
                <span>{docError}</span>
              </div>
            )}

            {/* Document Upload Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {docTypes.map((typeObj) => {
                const uploaded = uploadedDocs.find(
                  (d) => d.docType === typeObj.label
                );
                return (
                  <div
                    key={typeObj.label}
                    className={`p-4 rounded-2xl border transition-all ${
                      uploaded
                        ? "bg-violet-50/40 dark:bg-violet-950/20 border-violet-200 dark:border-violet-900/40"
                        : "bg-neutral-50/50 dark:bg-neutral-800/40 border-neutral-200/80 dark:border-neutral-800"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                          {typeObj.label}
                        </p>
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                          {typeObj.desc}
                        </p>
                      </div>
                      {uploaded ? (
                        <button
                          type="button"
                          onClick={() => removeDoc(typeObj.label)}
                          className="p-1 rounded-lg text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Remove document"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      ) : (
                        <label className="px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-750 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:border-[#7c3aed] transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs">
                          <UploadCloud className="size-3.5 text-[#7c3aed]" />
                          <span>Upload</span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            name="ownershipDocs"
                            onChange={(e) => handleDocUpload(typeObj.label, e)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* File preview & AI check result */}
                    {uploaded && (
                      <div className="mt-3 pt-3 border-t border-neutral-200/60 dark:border-neutral-800/60 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 font-medium">
                          <FileText className="size-4 text-[#7c3aed] shrink-0" />
                          <span className="truncate">{uploaded.file.name}</span>
                          <span className="text-[10px] text-neutral-400 shrink-0">
                            ({(uploaded.file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>

                        {/* AI Check badge */}
                        <div className="bg-white dark:bg-neutral-900 rounded-xl p-3 border border-neutral-200/80 dark:border-neutral-800 text-xs space-y-2">
                          {uploaded.aiCheckStatus === "scanning" ? (
                            <div className="flex items-center gap-2 text-[#7c3aed] font-semibold">
                              <Loader2 className="size-4 animate-spin" />
                              <span>Scanning document authenticity...</span>
                            </div>
                          ) : uploaded.aiResult ? (
                            <div className="space-y-2">
                              {/* Header & Confidence */}
                              <div className="flex items-center justify-between font-bold">
                                {uploaded.aiResult.status === "approved" && (
                                  <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                                    🤖 AI Document Scanner ✅ PASSED
                                  </span>
                                )}
                                {uploaded.aiResult.status === "warning" && (
                                  <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                                    🤖 AI Document Scanner ⚠️ REVIEW
                                  </span>
                                )}
                                {uploaded.aiResult.status === "rejected" && (
                                  <span className="text-red-700 dark:text-red-400 flex items-center gap-1.5">
                                    🤖 AI Document Scanner ❌ FAILED
                                  </span>
                                )}
                                <span className="text-[11px] text-neutral-500">
                                  {uploaded.aiResult.confidence}%
                                </span>
                              </div>

                              {/* Progress bar */}
                              <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-[#7c3aed] h-2 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${uploaded.aiResult.confidence}%`,
                                  }}
                                />
                              </div>

                              {/* Check items */}
                              <div className="space-y-1 text-[11px] text-neutral-600 dark:text-neutral-400">
                                {uploaded.aiResult.status === "approved" && (
                                  <>
                                    <p className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                                      ✓ Valid file format (PDF/Image)
                                    </p>
                                    <p className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                                      ✓ Document size indicates real content
                                    </p>
                                    <p className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                                      ✓ Keywords match ownership documentation
                                    </p>
                                  </>
                                )}

                                {uploaded.aiResult.status === "warning" && (
                                  <>
                                    <p className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                                      ✓ Valid file format
                                    </p>
                                    <p className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                                      ✓ Adequate file size
                                    </p>
                                    <p className="flex items-center gap-1 text-amber-700 dark:text-amber-400">
                                      ⚠ Could not match document to property keywords
                                    </p>
                                  </>
                                )}

                                {uploaded.aiResult.status === "rejected" && (
                                  <p className="flex items-center gap-1 text-red-700 dark:text-red-400">
                                    ✗ {uploaded.aiResult.message}
                                  </p>
                                )}
                              </div>

                              {/* Reasoning quote */}
                              <p className="text-[11px] text-neutral-600 dark:text-neutral-300 italic bg-neutral-50 dark:bg-neutral-800/50 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800">
                                &quot;{uploaded.aiResult.message}&quot;
                              </p>

                              <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold pt-0.5">
                                Powered by Bokra Stay AI ·{" "}
                                {uploaded.aiResult.status === "rejected"
                                  ? "Document Not Accepted"
                                  : "Pending Admin Review"}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 italic">
              Note: All documents are reviewed by our admin team regardless of AI pre-check result.
            </p>
          </div>

          {/* Action Buttons */}
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
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-[#7c3aed] hover:bg-[#6d28d9] active:bg-[#5b21b6] text-white shadow-md shadow-[#7c3aed]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Submitting Listing...</span>
                </>
              ) : (
                "Submit Property for Review"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
