"use client";

import { createProperty } from "../actions";
import Link from "next/link";
import { ArrowLeft, Sparkles, Building2, UploadCloud, Plus } from "lucide-react";
import { useState } from "react";

export default function NewPropertyPage() {
  const [loading, setLoading] = useState(false);
  const [imagesSelected, setImagesSelected] = useState<number>(0);

  const handleSubmit = () => {
    setLoading(true);
  };

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
            Fill out the details to add a new listing to Bokra Stay.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-sm p-6 sm:p-8">
        <form action={createProperty} onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              Property Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="e.g. Cozy Apartment in Addis Ababa"
              required
              className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition-all text-neutral-800 dark:text-neutral-100"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              Description
            </label>
            <textarea
              id="description"
              name="description"
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
                placeholder="Addis Ababa"
                required
                className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition-all text-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="pricePerNight" className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                Price / Night (ETB)
              </label>
              <input
                id="pricePerNight"
                name="pricePerNight"
                type="number"
                min="0"
                step="0.01"
                required
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

          {/* Amenities */}
          <div className="space-y-1.5">
            <label htmlFor="amenities" className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              Amenities (comma separated)
            </label>
            <input
              id="amenities"
              name="amenities"
              type="text"
              placeholder="WiFi, Kitchen, Air Conditioning, Free Parking"
              className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition-all text-neutral-800 dark:text-neutral-100"
            />
          </div>

          {/* Image Upload Box */}
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
                required
                onChange={(e) => setImagesSelected(e.target.files?.length || 0)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-2 text-neutral-500 dark:text-neutral-450">
                <UploadCloud className="size-8 text-neutral-400 group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors" />
                <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-250">
                  {imagesSelected > 0 ? `${imagesSelected} images selected` : "Click or drag images to upload"}
                </p>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                  You can select multiple photos of your property.
                </p>
              </div>
            </div>
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
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-md shadow-teal-600/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {loading ? "Creating listing..." : "Create Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
