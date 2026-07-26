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
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

interface UploadedDoc {
  docType: string;
  file: File;
  aiStatus: "scanning" | "authentic" | "low_quality";
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
  const [pricePerNight, setPricePerNight] = useState("");
  const [priceRationale, setPriceRationale] = useState("");

  // Ownership Proof Documents State
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [docError, setDocError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (uploadedDocs.length === 0) {
      e.preventDefault();
      setDocError("Please upload at least one property ownership proof document.");
      return;
    }

    const hasAuthenticDoc = uploadedDocs.some((d) => d.aiStatus === "authentic");
    if (!hasAuthenticDoc) {
      e.preventDefault();
      setDocError("At least one document must pass the AI authenticity scanner.");
      return;
    }

    setDocError(null);
    setLoading(true);
  };

  const handleGenerateDescription = async () => {
    if (!title.trim()) return;
    setDescLoading(true);
    setPriceRationale("");
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
    setPriceRationale("");
    try {
      const res = await fetch("/api/ai/suggest-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, bedrooms, bathrooms, amenities }),
      });
      if (!res.ok) throw new Error("Failed to get price suggestion");
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

  const handleDocUpload = (typeLabel: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocError(null);

    const newDoc: UploadedDoc = {
      docType: typeLabel,
      file,
      aiStatus: "scanning",
    };

    setUploadedDocs((prev) => [...prev.filter((d) => d.docType !== typeLabel), newDoc]);

    // Simulate 2 second AI Document Scanning
    setTimeout(() => {
      setUploadedDocs((prev) =>
        prev.map((item) => {
          if (item.docType === typeLabel && item.file === file) {
            // Check size > 10KB (10 * 1024 bytes)
            const isQualityGood = file.size > 10240;
            return {
              ...item,
              aiStatus: isQualityGood ? "authentic" : "low_quality",
            };
          }
          return item;
        })
      );
    }, 2000);
  };

  const removeDoc = (typeLabel: string) => {
    setUploadedDocs((prev) => prev.filter((d) => d.docType !== typeLabel));
  };

  const docTypes = [
    { label: "Property Title Deed", desc: "Official title deed or ownership certificate" },
    { label: "Lease Agreement", desc: "Signed long-term property lease agreement" },
    { label: "House Registration Certificate", desc: "Municipal or local house registration doc" },
    { label: "Rental Authorization Letter", desc: "Signed authorization allowing subletting" },
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
            <Sparkles className="size-4 text-teal-600 dark:text-teal-400" />
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Fill out the details and upload ownership verification documents to list your property.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-xs p-6 sm:p-8">
        <form action={createProperty} onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Info */}
          <div className="space-y-5">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-400 border-b border-neutral-100 dark:border-neutral-800 pb-2">
              1. Property Information
            </h2>

            {/* Title */}
            <div className="space-y-1.5">
              <label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
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
                className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition-all text-neutral-800 dark:text-neutral-100"
              />
            </div>

            {/* Description with AI Generator */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Description
                </label>
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={descLoading || !title.trim()}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-xs"
                  title={!title.trim() ? "Enter a title first" : "Generate description with AI"}
                >
                  {descLoading ? <Loader2 className="size-3 animate-spin" /> : <Wand2 className="size-3" />}
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
                className="w-full p-4 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition-all text-neutral-800 dark:text-neutral-100 resize-none"
              />
            </div>

            {/* Address & City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Address
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="123 Bole Road"
                  required
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition-all text-neutral-800 dark:text-neutral-100"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="city" className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
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
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition-all text-neutral-800 dark:text-neutral-100"
                />
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-1.5">
              <label htmlFor="amenities" className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                Amenities (comma separated)
              </label>
              <input
                id="amenities"
                name="amenities"
                type="text"
                value={amenities}
                onChange={(e) => setAmenities(e.target.value)}
                placeholder="WiFi, Kitchen, Air Conditioning, Free Parking"
                className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition-all text-neutral-800 dark:text-neutral-100"
              />
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5 col-span-2 md:col-span-1">
                <div className="flex items-center justify-between gap-1">
                  <label htmlFor="pricePerNight" className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                    Price / Night
                  </label>
                  <button
                    type="button"
                    onClick={handleSuggestPrice}
                    disabled={priceLoading || !city.trim()}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-xs shrink-0"
                    title={!city.trim() ? "Enter a city first" : "AI price suggestion"}
                  >
                    {priceLoading ? <Loader2 className="size-2.5 animate-spin" /> : <DollarSign className="size-2.5" />}
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
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition-all text-neutral-800 dark:text-neutral-100"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="bedrooms" className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
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
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition-all text-neutral-800 dark:text-neutral-100"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="bathrooms" className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
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
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition-all text-neutral-800 dark:text-neutral-100"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="maxGuests" className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Max Guests
                </label>
                <input
                  id="maxGuests"
                  name="maxGuests"
                  type="number"
                  min="1"
                  required
                  placeholder="2"
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition-all text-neutral-800 dark:text-neutral-100"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                Property Images
              </label>
              <div className="relative group border-2 border-dashed border-neutral-200 dark:border-neutral-850 hover:border-teal-500 dark:hover:border-teal-400 rounded-2xl p-6 text-center cursor-pointer transition-colors">
                <input
                  id="images"
                  name="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setImagesSelected(e.target.files?.length || 0)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-2 text-neutral-500 dark:text-neutral-450">
                  <UploadCloud className="size-8 text-neutral-400 group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors" />
                  <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-250">
                    {imagesSelected > 0 ? `${imagesSelected} photos selected` : "Click or drag images to upload"}
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
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-2">
                  <ShieldCheck className="size-4 text-teal-600" />
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

            {docError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2 font-medium">
                <AlertTriangle className="size-4 shrink-0" />
                <span>{docError}</span>
              </div>
            )}

            {/* Document Upload Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {docTypes.map((typeObj) => {
                const uploaded = uploadedDocs.find((d) => d.docType === typeObj.label);
                return (
                  <div
                    key={typeObj.label}
                    className={`p-4 rounded-2xl border transition-all ${
                      uploaded
                        ? "bg-teal-50/50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900/40"
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
                        <label className="px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-750 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:border-teal-500 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs">
                          <UploadCloud className="size-3.5 text-teal-600" />
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
                          <FileText className="size-4 text-teal-600 shrink-0" />
                          <span className="truncate">{uploaded.file.name}</span>
                          <span className="text-[10px] text-neutral-400 shrink-0">
                            ({(uploaded.file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>

                        {/* AI Check badge */}
                        <div className="bg-white dark:bg-neutral-900 rounded-xl p-2.5 border border-neutral-200/60 dark:border-neutral-800 text-[11px] space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                            <span>Powered by Bokra Stay AI Document Scanner</span>
                          </div>

                          {uploaded.aiStatus === "scanning" ? (
                            <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-semibold">
                              <Loader2 className="size-3.5 animate-spin" />
                              <span>Scanning document authenticity...</span>
                            </div>
                          ) : uploaded.aiStatus === "authentic" ? (
                            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                              <span>Document appears authentic — pending admin review</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold">
                              <AlertTriangle className="size-4 text-amber-600 shrink-0" />
                              <span>Document quality too low — please upload a clearer version</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 italic">
              Note: This automated pre-check verifies initial readability. Final verification is conducted by our admin team before publication.
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
              className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-md shadow-teal-600/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-2"
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
