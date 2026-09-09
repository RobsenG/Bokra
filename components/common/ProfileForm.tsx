"use client";

import { useState } from "react";
import { updateProfile } from "@/lib/profile-actions";
import { User, Phone, Camera, CheckCircle, AlertCircle, Shield, Award, FileText } from "lucide-react";

interface ProfileFormProps {
  user: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    avatar?: string | null;
    role?: string | null;
    shortBio?: string | null;
    trustBadge?: string | null;
  } | null;
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);

  if (!user) {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold">
        <AlertCircle className="w-4 h-4 shrink-0" />
        No user profile data available.
      </div>
    );
  }

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

  const nameVal = user.name || "";
  const emailVal = user.email || "";
  const phoneVal = user.phone || "";
  const shortBioVal = user.shortBio || "";
  const roleVal = user.role || "RENTER";
  const trustBadgeVal = user.trustBadge;

  const initials = (nameVal || emailVal || "U")[0].toUpperCase();

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] border-[#b8943d]/20 dark:border-[#c9a84c]/20";
      case "HOST":
        return "bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] border-[#b8943d]/20 dark:border-[#c9a84c]/20";
      default:
        return "bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] border-[#b8943d]/20 dark:border-[#c9a84c]/20";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      {success && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Profile updated successfully!
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Avatar, Name and Email Header */}
      <div className="flex items-center gap-5 pb-6 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="relative group shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 overflow-hidden border border-black/[0.08] dark:border-white/[0.06] flex items-center justify-center">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#b8943d] dark:text-[#c9a84c] font-bold text-2xl bg-[#b8943d]/10 dark:bg-[#c9a84c]/10">
                {initials}
              </div>
            )}
          </div>
          <label className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <Camera className="w-5 h-5 text-white" />
            <input type="file" name="avatar" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </label>
        </div>
        <div className="space-y-1.5">
          <p className="font-bold text-[#1a1208] dark:text-[#f8f6f0] text-lg leading-tight">
            {nameVal || "No name set"}
          </p>
          <p className="text-sm text-[#6b5e4e] dark:text-[#9b9080]">
            {emailVal}
          </p>
          <div className="pt-0.5 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getRoleBadgeClass(roleVal)}`}>
              {roleVal === "ADMIN" && <Shield className="w-3 h-3" />}
              {roleVal}
            </span>

            {trustBadgeVal && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] border border-[#b8943d]/20 dark:border-[#c9a84c]/20">
                <Award className="w-3 h-3" />
                {trustBadgeVal}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Name Input */}
      <div className="space-y-1.5">
        <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-[#6b5e4e] dark:text-[#9b9080]">
          Full Name
        </label>
        <div className="relative">
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={nameVal}
            required
            placeholder="Your full name"
            className="w-full h-11 px-4 pl-10 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0f] text-sm text-[#1a1208] dark:text-[#f8f6f0] focus:border-[#b8943d] dark:focus:border-[#c9a84c] outline-none transition-all"
          />
          <User className="w-4 h-4 text-[#6b5e4e] dark:text-[#9b9080] absolute left-3.5 top-3.5" />
        </div>
      </div>

      {/* Phone Input */}
      <div className="space-y-1.5">
        <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-[#6b5e4e] dark:text-[#9b9080]">
          Phone Number
        </label>
        <div className="relative">
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={phoneVal}
            placeholder="+251 9X XXX XXXX"
            className="w-full h-11 px-4 pl-10 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0f] text-sm text-[#1a1208] dark:text-[#f8f6f0] focus:border-[#b8943d] dark:focus:border-[#c9a84c] outline-none transition-all"
          />
          <Phone className="w-4 h-4 text-[#6b5e4e] dark:text-[#9b9080] absolute left-3.5 top-3.5" />
        </div>
      </div>

      {/* Short Bio (Host & Renter) */}
      <div className="space-y-1.5">
        <label htmlFor="shortBio" className="block text-xs font-semibold uppercase tracking-wider text-[#6b5e4e] dark:text-[#9b9080]">
          Short Bio (About You)
        </label>
        <div className="relative">
          <textarea
            id="shortBio"
            name="shortBio"
            rows={3}
            defaultValue={shortBioVal}
            placeholder="Share a short bio with guests and hosts (e.g. Hospitable host living in Addis Ababa, passionate about local travel)..."
            className="w-full p-3.5 pl-10 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0f] text-sm text-[#1a1208] dark:text-[#f8f6f0] focus:border-[#b8943d] dark:focus:border-[#c9a84c] outline-none transition-all resize-none"
          />
          <FileText className="w-4 h-4 text-[#6b5e4e] dark:text-[#9b9080] absolute left-3.5 top-3.5" />
        </div>
        <p className="text-[11px] text-[#6b5e4e] dark:text-[#9b9080]">
          This will be visible on your property listings and profile page.
        </p>
      </div>

      {/* Email (Read-Only) */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b5e4e] dark:text-[#9b9080]">
          Email Address (Read-Only)
        </label>
        <input
          type="email"
          value={emailVal}
          readOnly
          className="w-full h-11 px-4 rounded-xl border border-black/10 dark:border-white/10 bg-[#f5f3ef] dark:bg-[#1a1a2e] text-sm text-[#6b5e4e] dark:text-[#9b9080] outline-none cursor-not-allowed"
        />
        <p className="text-[10px] text-[#6b5e4e] dark:text-[#9b9080]">Email cannot be changed.</p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="bg-[#b8943d] dark:bg-[#c9a84c] hover:brightness-110 text-white dark:text-[#0a0a0f] font-semibold text-sm px-6 py-2.5 rounded-xl shadow-xs transition-all duration-200 disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
