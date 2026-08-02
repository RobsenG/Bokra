"use client";

import { updateProperty } from "../../actions";
import Link from "next/link";
import { ArrowLeft, UploadCloud, Wand2, DollarSign, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState } from "react";

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
}

export default function EditPropertyForm({ property }: { property: Property }) {
  const [loading, setLoading] = useState(false);
  const [imagesSelected, setImagesSelected] = useState<number>(0);

  // Controlled state for AI tools
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

  const isRejected = property.status === "REJECTED";

  const handleSubmit = () => setLoading(true);
  const updatePropertyWithId = updateProperty.bind(null, property.id);

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

  return (
    <div className="space-y-6 max-w-3xl">
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
              ? "Fix the issues below and resubmit for admin review."
              : "Update the details of your listing. Use AI tools to improve your copy!"}
          </p>
        </div>
      </div>

      {/* Rejection Reason Banner */}
      {isRejected && property.rejectionReason && (
        <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-900/50 rounded-2xl p-5 space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="size-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-red-800 dark:text-red-300">
                ✗ This listing was rejected by the admin team
              </h3>
              <p className="text-xs font-semibold text-red-700 dark:text-red-400">
                Rejection reason:
              </p>
              <blockquote className="text-xs text-red-700 dark:text-red-300 italic bg-white/60 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200 dark:border-red-900/40">
                &quot;{property.rejectionReason}&quot;
              </blockquote>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-300 bg-white/60 dark:bg-black/20 p-2.5 rounded-lg border border-red-200 dark:border-red-900/40">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            <span>After saving your changes, the listing will automatically go back for admin review.</span>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-sm p-6 sm:p-8">
        <form action={updatePropertyWithId} onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Property Title</label>
            <input
              id="title" name="title" type="text" required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none text-neutral-800 dark:text-neutral-100"
            />
          </div>

          {/* Description with AI Generator */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Description</label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={descLoading || !title.trim()}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-sm"
              >
                {descLoading ? <Loader2 className="size-3 animate-spin" /> : <Wand2 className="size-3" />}
                {descLoading ? "Writing..." : "Rewrite with AI ✨"}
              </button>
            </div>
            <textarea
              id="description" name="description" rows={4} required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none text-neutral-800 dark:text-neutral-100 resize-none"
            />
          </div>

          {/* Address & City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Address</label>
              <input id="address" name="address" type="text" defaultValue={property.address} required
                className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none text-neutral-800 dark:text-neutral-100" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="city" className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">City</label>
              <input id="city" name="city" type="text" required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none text-neutral-800 dark:text-neutral-100" />
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-1.5">
            <label htmlFor="amenities" className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Amenities (comma separated)</label>
            <input id="amenities" name="amenities" type="text"
              value={amenities}
              onChange={(e) => setAmenities(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none text-neutral-800 dark:text-neutral-100" />
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Price with AI Suggester */}
            <div className="space-y-1.5 col-span-2 md:col-span-1">
              <div className="flex items-center justify-between gap-1">
                <label htmlFor="pricePerNight" className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Price / Night (ETB)
                </label>
                <button
                  type="button"
                  onClick={handleSuggestPrice}
                  disabled={priceLoading || !city.trim()}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-sm shrink-0"
                >
                  {priceLoading ? <Loader2 className="size-2.5 animate-spin" /> : <DollarSign className="size-2.5" />}
                  AI 💡
                </button>
              </div>
              <input id="pricePerNight" name="pricePerNight" type="number" min="0" step="0.01" required
                value={pricePerNight}
                onChange={(e) => setPricePerNight(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none text-neutral-800 dark:text-neutral-100" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="bedrooms" className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Bedrooms</label>
              <input id="bedrooms" name="bedrooms" type="number" min="1" required
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none text-neutral-800 dark:text-neutral-100" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="bathrooms" className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Bathrooms</label>
              <input id="bathrooms" name="bathrooms" type="number" min="1" required
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none text-neutral-800 dark:text-neutral-100" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="maxGuests" className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Max Guests</label>
              <input id="maxGuests" name="maxGuests" type="number" min="1" required defaultValue={property.maxGuests}
                className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none text-neutral-800 dark:text-neutral-100" />
            </div>
          </div>

          {/* AI Price Rationale */}
          {priceRationale && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-xl p-3.5 text-xs text-amber-800 dark:text-amber-300 leading-relaxed animate-in fade-in duration-200">
              <span className="font-bold">💡 AI Pricing Insight: </span>{priceRationale}
            </div>
          )}

          {/* Replace Images */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              Replace Images <span className="text-neutral-400 font-normal">(optional — leave blank to keep existing)</span>
            </label>
            <div className="relative group border-2 border-dashed border-neutral-200 dark:border-neutral-700 hover:border-teal-500 rounded-2xl p-5 text-center cursor-pointer transition-colors">
              <input type="file" name="images" multiple accept="image/*"
                onChange={(e) => setImagesSelected(e.target.files?.length || 0)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="flex flex-col items-center gap-2 text-neutral-500 dark:text-neutral-400">
                <UploadCloud className="size-7 text-neutral-400 group-hover:text-teal-500 transition-colors" />
                <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  {imagesSelected > 0 ? `${imagesSelected} new images selected` : "Click or drag new images to replace existing"}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3.5 border-t border-neutral-100 dark:border-neutral-800">
            <Link href="/host/properties">
              <button type="button" className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                Cancel
              </button>
            </Link>
            <button type="submit" disabled={loading}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold text-white shadow-md transition-colors cursor-pointer disabled:opacity-50 ${isRejected ? "bg-teal-600 hover:bg-teal-700 shadow-teal-600/10" : "bg-teal-600 hover:bg-teal-700 shadow-teal-600/10"}`}>
              {loading
                ? "Saving..."
                : isRejected
                ? "Save & Resubmit for Review"
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
