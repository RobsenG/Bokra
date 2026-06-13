"use client";

import { updateProperty } from "../../actions";
import Link from "next/link";
import { ArrowLeft, UploadCloud } from "lucide-react";
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
}

export default function EditPropertyForm({ property }: { property: Property }) {
  const [loading, setLoading] = useState(false);
  const [imagesSelected, setImagesSelected] = useState<number>(0);

  const handleSubmit = () => setLoading(true);

  const updatePropertyWithId = updateProperty.bind(null, property.id);

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
          <h1 className="text-2xl font-extrabold text-neutral-800 dark:text-white tracking-tight">Edit Property</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Update the details of your listing.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-sm p-6 sm:p-8">
        <form action={updatePropertyWithId} onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Property Title</label>
            <input id="title" name="title" type="text" defaultValue={property.title} required
              className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none text-neutral-800 dark:text-neutral-100" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Description</label>
            <textarea id="description" name="description" rows={4} defaultValue={property.description} required
              className="w-full p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none text-neutral-800 dark:text-neutral-100 resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Address</label>
              <input id="address" name="address" type="text" defaultValue={property.address} required
                className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none text-neutral-800 dark:text-neutral-100" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="city" className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">City</label>
              <input id="city" name="city" type="text" defaultValue={property.city} required
                className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none text-neutral-800 dark:text-neutral-100" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: "pricePerNight", label: "Price / Night (ETB)", value: property.pricePerNight, step: "0.01" },
              { id: "bedrooms", label: "Bedrooms", value: property.bedrooms },
              { id: "bathrooms", label: "Bathrooms", value: property.bathrooms },
              { id: "maxGuests", label: "Max Guests", value: property.maxGuests },
            ].map(({ id, label, value, step }) => (
              <div key={id} className="space-y-1.5">
                <label htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">{label}</label>
                <input id={id} name={id} type="number" min="0" step={step || "1"} defaultValue={value} required
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none text-neutral-800 dark:text-neutral-100" />
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="amenities" className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Amenities (comma separated)</label>
            <input id="amenities" name="amenities" type="text" defaultValue={property.amenities.join(", ")}
              className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none text-neutral-800 dark:text-neutral-100" />
          </div>

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
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/10 disabled:opacity-50 transition-colors cursor-pointer">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
