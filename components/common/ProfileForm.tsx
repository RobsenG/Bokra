"use client";

import { useState } from "react";
import { updateProfile } from "@/lib/profile-actions";
import { User, Phone, Camera, CheckCircle, AlertCircle } from "lucide-react";

interface ProfileFormProps {
  user: {
    name: string | null;
    email: string;
    phone: string | null;
    avatar: string | null;
    role: string;
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData(e.currentTarget);
      await updateProfile(formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const initials = (user.name || user.email)[0].toUpperCase();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
          <CheckCircle className="size-4 shrink-0" />
          Profile updated successfully!
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative group shrink-0">
          <div className="h-20 w-20 rounded-2xl bg-teal-100 dark:bg-teal-900 overflow-hidden">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold text-2xl">
                {initials}
              </div>
            )}
          </div>
          <label className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <Camera className="size-5 text-white" />
            <input type="file" name="avatar" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </label>
        </div>
        <div>
          <p className="font-bold text-neutral-800 dark:text-neutral-200 text-sm">{user.name || "No name set"}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{user.email}</p>
          <p className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 mt-0.5 uppercase tracking-wider">{user.role}</p>
        </div>
      </div>

      {/* Name */}
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-neutral-500">Full Name</label>
        <div className="relative">
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={user.name || ""}
            required
            placeholder="Your full name"
            className="w-full h-11 px-4 pl-10 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none text-neutral-800 dark:text-neutral-100"
          />
          <User className="size-4 text-neutral-400 absolute left-3.5 top-3.5" />
        </div>
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-neutral-500">Phone Number</label>
        <div className="relative">
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={user.phone || ""}
            placeholder="+251 9X XXX XXXX"
            className="w-full h-11 px-4 pl-10 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none text-neutral-800 dark:text-neutral-100"
          />
          <Phone className="size-4 text-neutral-400 absolute left-3.5 top-3.5" />
        </div>
      </div>

      {/* Email (read-only) */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Email Address</label>
        <input
          type="email"
          value={user.email}
          readOnly
          className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-500 dark:text-neutral-400 outline-none"
        />
        <p className="text-[10px] text-neutral-400">Email cannot be changed.</p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
