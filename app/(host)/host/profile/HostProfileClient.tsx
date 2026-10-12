"use client";

import React, { useState } from "react";
import { updateProfile } from "@/lib/profile-actions";
import {
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  FileText,
  Camera,
  Edit2,
  Lock,
  ShieldCheck,
  Building2,
  Calendar,
  Star,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Check,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface HostProfileClientProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    avatar: string | null;
    role: string;
    isVerified: boolean;
    selfieUrl: string | null;
    selfieVerifiedAt: Date | string | null;
    shortBio: string | null;
    trustBadge: string | null;
    createdAt?: Date | string | null;
    city?: string | null;
  };
  stats: {
    totalProperties: number;
    approvedProperties: number;
    totalBookings: number;
    avgRating: number | string;
    documentsCount: number;
    monthlyBookings: number;
    totalEarnings: number;
  };
}

export default function HostProfileClient({ user, stats }: HostProfileClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form states
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [city, setCity] = useState(user.city || "");
  const [bio, setBio] = useState(user.shortBio || "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar || null);

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
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      })
    : "Member";

  // Verification steps calculation
  const isSelfieDone = !!user.selfieUrl;
  const isDocsDone = stats.documentsCount > 0;
  const isAdminVerified = user.isVerified;

  return (
    <div className="space-y-8 font-sans max-w-6xl mx-auto pb-12">
      {/* Notifications */}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl text-emerald-800 dark:text-emerald-300 text-sm font-semibold shadow-xs">
          <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>Your host profile has been updated successfully!</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-2xl text-red-700 dark:text-red-300 text-sm font-semibold shadow-xs">
          <AlertCircle className="size-5 shrink-0 text-red-600 dark:text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* TOP SECTION — Profile Hero Card */}
      <div className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8 items-center lg:items-stretch">
          {/* Left part (40%) */}
          <div className="lg:w-[40%] flex flex-col items-center text-center lg:border-r border-black/[0.06] dark:border-[#fff8dc]/[0.06] lg:pr-8 space-y-4">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full ring-4 ring-[#b8943d] dark:ring-[#c9a84c] overflow-hidden bg-[#faf9f7] dark:bg-[#1c1a16] border-2 border-white dark:border-[#141310] shadow-md flex items-center justify-center">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={name || "Host"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-extrabold text-[#b8943d] dark:text-[#c9a84c]">
                    {(name || user.email || "H")[0].toUpperCase()}
                  </span>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="size-6 text-white" />
                <input
                  type="file"
                  name="avatar"
                  form="profile-form"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl font-extrabold text-[#1a1208] dark:text-[#f5f0e8] tracking-tight">
                {name || "Host Account"}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#b8943d]/10 text-[#b8943d] dark:bg-[#c9a84c]/10 dark:text-[#c9a84c] border border-[#b8943d]/20 dark:border-[#c9a84c]/20">
                  HOST
                </span>
                {user.trustBadge && (
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-extrabold bg-[#b8943d]/10 text-[#b8943d] dark:bg-[#c9a84c]/10 dark:text-[#c9a84c] border border-[#b8943d]/20 dark:border-[#c9a84c]/20">
                    <ShieldCheck className="size-3.5" />
                    {user.trustBadge}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278]">
                Member since {memberSince}
              </p>
            </div>

            {bio ? (
              <p className="text-xs italic text-[#6b5e4e] dark:text-[#9b9080] max-w-xs leading-relaxed">
                &quot;{bio}&quot;
              </p>
            ) : (
              <p className="text-xs italic text-[#9b8e7e] dark:text-[#8a8278]">
                No bio provided yet. Click edit to introduce yourself to guests.
              </p>
            )}
          </div>

          {/* Right part (60%) */}
          <div className="lg:w-[60%] flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#9b8e7e] dark:text-[#8a8278]">
                Host Performance &amp; Trust
              </h2>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b8943d] dark:text-[#c9a84c] hover:underline cursor-pointer bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 border border-[#b8943d]/20 dark:border-[#c9a84c]/20 px-3.5 py-1.5 rounded-xl transition-colors"
              >
                <Edit2 className="size-3.5" />
                <span>{isEditing ? "Cancel Editing" : "Edit Profile"}</span>
              </button>
            </div>

            {/* 3 Stat Boxes */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-[#faf9f7] dark:bg-[#1c1a16] border border-black/[0.06] dark:border-[#fff8dc]/[0.06] text-center space-y-1">
                <Building2 className="size-5 text-[#b8943d] dark:text-[#c9a84c] mx-auto" />
                <p className="text-2xl font-extrabold text-[#1a1208] dark:text-[#f5f0e8]">
                  {stats.totalProperties}
                </p>
                <p className="text-[11px] text-[#6b5e4e] dark:text-[#8a8278] font-medium">
                  Properties
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#faf9f7] dark:bg-[#1c1a16] border border-black/[0.06] dark:border-[#fff8dc]/[0.06] text-center space-y-1">
                <Calendar className="size-5 text-[#b8943d] dark:text-[#c9a84c] mx-auto" />
                <p className="text-2xl font-extrabold text-[#1a1208] dark:text-[#f5f0e8]">
                  {stats.totalBookings}
                </p>
                <p className="text-[11px] text-[#6b5e4e] dark:text-[#8a8278] font-medium">
                  Bookings
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#faf9f7] dark:bg-[#1c1a16] border border-black/[0.06] dark:border-[#fff8dc]/[0.06] text-center space-y-1">
                <Star className="size-5 text-amber-500 fill-amber-500 mx-auto" />
                <p className="text-2xl font-extrabold text-[#1a1208] dark:text-[#f5f0e8]">
                  {stats.avgRating || "N/A"}
                </p>
                <p className="text-[11px] text-[#6b5e4e] dark:text-[#8a8278] font-medium">
                  Avg Rating
                </p>
              </div>
            </div>

            {/* Verification Status Strip */}
            <div className="p-4 rounded-2xl bg-[#faf9f7] dark:bg-[#1c1a16] border border-black/[0.06] dark:border-[#fff8dc]/[0.06] space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#1a1208] dark:text-[#f5f0e8]">
                <span>Verification Checklist</span>
                <Link
                  href="/host/verification"
                  className="text-[#b8943d] dark:text-[#c9a84c] hover:underline flex items-center gap-1"
                >
                  <span>Verification Center</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-[#141310] border border-black/[0.04] dark:border-[#fff8dc]/[0.04]">
                  {user.isVerified ? (
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Clock className="size-4 text-amber-500 shrink-0" />
                  )}
                  <span className="truncate">
                    Identity: {user.isVerified ? "Verified" : "Pending"}
                  </span>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-[#141310] border border-black/[0.04] dark:border-[#fff8dc]/[0.04]">
                  {isDocsDone ? (
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle className="size-4 text-amber-500 shrink-0" />
                  )}
                  <span className="truncate">
                    Docs: {isDocsDone ? `${stats.documentsCount} Uploaded` : "Missing"}
                  </span>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-[#141310] border border-black/[0.04] dark:border-[#fff8dc]/[0.04]">
                  <Building2 className="size-4 text-[#b8943d] dark:text-[#c9a84c] shrink-0" />
                  <span className="truncate">
                    Active Listings: {stats.approvedProperties}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BELOW HERO — Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN (2 Cols wide) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Card 1 — Personal Information */}
          <div className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-[#fff8dc]/[0.05] pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-[#1a1208] dark:text-[#f5f0e8]">
                  Personal Information
                </h2>
                <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278]">
                  Manage your personal identity details visible across Bokra Stay
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs font-bold text-[#b8943d] dark:text-[#c9a84c] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="size-3.5" />
                <span>{isEditing ? "Cancel" : "Edit"}</span>
              </button>
            </div>

            <form id="profile-form" onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#6b5e4e] dark:text-[#8a8278]">
                  Full Name
                </label>
                {isEditing ? (
                  <div className="relative">
                    <input
                      name="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full h-11 px-4 pl-10 rounded-xl border border-black/10 dark:border-[#fff8dc]/[0.07] bg-white dark:bg-[#fff8dc]/[0.03] text-sm text-[#1a1208] dark:text-[#f5f0e8] focus:border-[#b8943d] dark:focus:border-[#c9a84c]/40 outline-none transition-all"
                    />
                    <UserIcon className="size-4 text-[#6b5e4e] dark:text-[#8a8278] absolute left-3.5 top-3.5" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#faf9f7] dark:bg-[#1c1a16] border border-black/[0.05] dark:border-[#fff8dc]/[0.05] text-sm font-bold text-[#1a1208] dark:text-[#f5f0e8]">
                    <span>{name || "Not specified"}</span>
                    <Edit2
                      className="size-4 text-[#9b8e7e] hover:text-[#b8943d] cursor-pointer"
                      onClick={() => setIsEditing(true)}
                    />
                  </div>
                )}
              </div>

              {/* Email (Read only) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#6b5e4e] dark:text-[#8a8278]">
                  Email Address (Account ID)
                </label>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#f5f3ef] dark:bg-[#181613] border border-black/[0.05] dark:border-[#fff8dc]/[0.05] text-sm text-[#6b5e4e] dark:text-[#8a8278]" title="Read-only email">
                  <span className="font-mono">{user.email}</span>
                  <Lock className="size-4 text-[#9b8e7e]" />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#6b5e4e] dark:text-[#8a8278]">
                  Phone Number
                </label>
                {isEditing ? (
                  <div className="relative">
                    <input
                      name="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+251 9X XXX XXXX"
                      className="w-full h-11 px-4 pl-10 rounded-xl border border-black/10 dark:border-[#fff8dc]/[0.07] bg-white dark:bg-[#fff8dc]/[0.03] text-sm text-[#1a1208] dark:text-[#f5f0e8] focus:border-[#b8943d] dark:focus:border-[#c9a84c]/40 outline-none transition-all"
                    />
                    <Phone className="size-4 text-[#6b5e4e] dark:text-[#8a8278] absolute left-3.5 top-3.5" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#faf9f7] dark:bg-[#1c1a16] border border-black/[0.05] dark:border-[#fff8dc]/[0.05] text-sm font-semibold text-[#1a1208] dark:text-[#f5f0e8]">
                    <span>{phone || "No phone added"}</span>
                    <Edit2
                      className="size-4 text-[#9b8e7e] hover:text-[#b8943d] cursor-pointer"
                      onClick={() => setIsEditing(true)}
                    />
                  </div>
                )}
              </div>

              {/* Location / City */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#6b5e4e] dark:text-[#8a8278]">
                  City / Location
                </label>
                {isEditing ? (
                  <div className="relative">
                    <input
                      name="city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Addis Ababa, Ethiopia"
                      className="w-full h-11 px-4 pl-10 rounded-xl border border-black/10 dark:border-[#fff8dc]/[0.07] bg-white dark:bg-[#fff8dc]/[0.03] text-sm text-[#1a1208] dark:text-[#f5f0e8] focus:border-[#b8943d] dark:focus:border-[#c9a84c]/40 outline-none transition-all"
                    />
                    <MapPin className="size-4 text-[#6b5e4e] dark:text-[#8a8278] absolute left-3.5 top-3.5" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#faf9f7] dark:bg-[#1c1a16] border border-black/[0.05] dark:border-[#fff8dc]/[0.05] text-sm font-semibold text-[#1a1208] dark:text-[#f5f0e8]">
                    <span>{city || "Addis Ababa, Ethiopia"}</span>
                    <Edit2
                      className="size-4 text-[#9b8e7e] hover:text-[#b8943d] cursor-pointer"
                      onClick={() => setIsEditing(true)}
                    />
                  </div>
                )}
              </div>

              {/* Short Bio */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#6b5e4e] dark:text-[#8a8278]">
                    Short Bio (About You)
                  </label>
                  <span className="text-[11px] text-[#9b8e7e] font-mono">
                    {bio.length}/200
                  </span>
                </div>
                {isEditing ? (
                  <div className="relative">
                    <textarea
                      name="shortBio"
                      rows={3}
                      maxLength={200}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Share a short intro with guests..."
                      className="w-full p-3.5 pl-10 rounded-xl border border-black/10 dark:border-[#fff8dc]/[0.07] bg-white dark:bg-[#fff8dc]/[0.03] text-sm text-[#1a1208] dark:text-[#f5f0e8] focus:border-[#b8943d] dark:focus:border-[#c9a84c]/40 outline-none transition-all resize-none"
                    />
                    <FileText className="size-4 text-[#6b5e4e] dark:text-[#8a8278] absolute left-3.5 top-3.5" />
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-[#faf9f7] dark:bg-[#1c1a16] border border-black/[0.05] dark:border-[#fff8dc]/[0.05] text-sm text-[#6b5e4e] dark:text-[#d4cfc7] italic leading-relaxed">
                    {bio ? `"${bio}"` : "No bio added yet."}
                  </div>
                )}
              </div>

              {/* Save & Cancel Buttons */}
              {isEditing && (
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/[0.06] dark:border-[#fff8dc]/[0.05]">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#6b5e4e] dark:text-[#8a8278] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#b8943d] dark:bg-[#c9a84c] hover:bg-[#d4b458] text-white dark:text-[#0c0b09] font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="size-4" />
                    <span>{loading ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Card 2 — Account Security */}
          <div className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] shadow-sm p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-extrabold text-[#1a1208] dark:text-[#f5f0e8] border-b border-black/[0.06] dark:border-[#fff8dc]/[0.05] pb-4">
              Account Security
            </h2>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#faf9f7] dark:bg-[#1c1a16] border border-black/[0.05] dark:border-[#fff8dc]/[0.05]">
                <div className="space-y-0.5">
                  <p className="font-bold text-[#1a1208] dark:text-[#f5f0e8]">
                    Email Address
                  </p>
                  <p className="text-[#6b5e4e] dark:text-[#8a8278]">{user.email}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                  <CheckCircle2 className="size-3" />
                  Verified
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#faf9f7] dark:bg-[#1c1a16] border border-black/[0.05] dark:border-[#fff8dc]/[0.05]">
                <div className="space-y-0.5">
                  <p className="font-bold text-[#1a1208] dark:text-[#f5f0e8]">
                    Password
                  </p>
                  <p className="font-mono text-base tracking-widest text-[#6b5e4e] dark:text-[#8a8278]">
                    ••••••••
                  </p>
                </div>
                <Link
                  href="/forgot-password"
                  className="px-3.5 py-2 rounded-xl bg-[#b8943d]/10 text-[#b8943d] dark:bg-[#c9a84c]/10 dark:text-[#c9a84c] font-bold hover:underline"
                >
                  Change Password
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-[#6b5e4e] dark:text-[#8a8278]">
                <div className="p-3 rounded-xl bg-[#faf9f7] dark:bg-[#1c1a16]">
                  <span className="block font-semibold">Account Created</span>
                  <span className="font-bold text-[#1a1208] dark:text-[#f5f0e8]">
                    {memberSince}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#faf9f7] dark:bg-[#1c1a16]">
                  <span className="block font-semibold">Terms Accepted</span>
                  <span className="font-bold text-[#1a1208] dark:text-[#f5f0e8]">
                    Verified Agreement
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (1 Col wide) */}
        <div className="space-y-8">
          {/* Card 3 — Verification Tracker */}
          <div className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] shadow-sm p-6 space-y-6">
            <h2 className="text-base font-extrabold text-[#1a1208] dark:text-[#f5f0e8] border-b border-black/[0.06] dark:border-[#fff8dc]/[0.05] pb-4">
              Verification Progress
            </h2>

            <div className="space-y-6 relative before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-black/10 dark:before:bg-[#fff8dc]/10">
              {/* Step 1 */}
              <div className="relative flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0 z-10">
                  <Check className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1a1208] dark:text-[#f5f0e8]">
                    Step 1: Account Created
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                    Completed
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-start gap-4">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 ${
                    isDocsDone
                      ? "bg-emerald-500 text-white"
                      : "bg-[#b8943d]/20 dark:bg-[#c9a84c]/20 text-[#b8943d] dark:text-[#c9a84c] ring-2 ring-[#b8943d] dark:ring-[#c9a84c]"
                  }`}
                >
                  {isDocsDone ? <Check className="size-4" /> : "2"}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#1a1208] dark:text-[#f5f0e8]">
                    Step 2: ID Uploaded
                  </p>
                  <p className="text-[11px] text-[#6b5e4e] dark:text-[#8a8278]">
                    {isDocsDone
                      ? `${stats.documentsCount} documents uploaded`
                      : "Upload government ID"}
                  </p>
                  {!isDocsDone && (
                    <Link
                      href="/host/verification"
                      className="inline-block mt-1 text-[11px] font-bold text-[#b8943d] dark:text-[#c9a84c] underline"
                    >
                      Upload ID →
                    </Link>
                  )}
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-start gap-4">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 ${
                    isSelfieDone
                      ? "bg-emerald-500 text-white"
                      : "bg-[#b8943d]/20 dark:bg-[#c9a84c]/20 text-[#b8943d] dark:text-[#c9a84c] ring-2 ring-[#b8943d] dark:ring-[#c9a84c]"
                  }`}
                >
                  {isSelfieDone ? <Check className="size-4" /> : "3"}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#1a1208] dark:text-[#f5f0e8]">
                    Step 3: Selfie Captured
                  </p>
                  <p className="text-[11px] text-[#6b5e4e] dark:text-[#8a8278]">
                    {isSelfieDone ? "Live selfie verified" : "Take live camera selfie"}
                  </p>
                  {!isSelfieDone && (
                    <Link
                      href="/host/verification"
                      className="inline-block mt-1 text-[11px] font-bold text-[#b8943d] dark:text-[#c9a84c] underline"
                    >
                      Take Selfie →
                    </Link>
                  )}
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative flex items-start gap-4">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 ${
                    isAdminVerified
                      ? "bg-emerald-500 text-white"
                      : "border-2 border-black/20 dark:border-[#fff8dc]/20 text-[#9b8e7e]"
                  }`}
                >
                  {isAdminVerified ? <Check className="size-4" /> : "4"}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1a1208] dark:text-[#f5f0e8]">
                    Step 4: Admin Verified
                  </p>
                  <p className="text-[11px] text-[#6b5e4e] dark:text-[#8a8278] mt-0.5">
                    {isAdminVerified
                      ? "Full host privileges granted"
                      : "Under administrative review"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4 — Quick Stats */}
          <div className="bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] shadow-sm p-6 space-y-4">
            <h2 className="text-base font-extrabold text-[#1a1208] dark:text-[#f5f0e8] border-b border-black/[0.06] dark:border-[#fff8dc]/[0.05] pb-3">
              Performance Summary
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#faf9f7] dark:bg-[#1c1a16] border border-black/[0.04] dark:border-[#fff8dc]/[0.04]">
                <span className="text-xs text-[#6b5e4e] dark:text-[#8a8278]">
                  This Month Bookings
                </span>
                <span className="text-sm font-bold text-[#1a1208] dark:text-[#f5f0e8]">
                  {stats.monthlyBookings}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#faf9f7] dark:bg-[#1c1a16] border border-black/[0.04] dark:border-[#fff8dc]/[0.04]">
                <span className="text-xs text-[#6b5e4e] dark:text-[#8a8278]">
                  Total Revenue
                </span>
                <span className="text-sm font-bold text-[#b8943d] dark:text-[#c9a84c]">
                  {stats.totalEarnings.toLocaleString()} ETB
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#faf9f7] dark:bg-[#1c1a16] border border-black/[0.04] dark:border-[#fff8dc]/[0.04]">
                <span className="text-xs text-[#6b5e4e] dark:text-[#8a8278]">
                  Properties Listed
                </span>
                <span className="text-sm font-bold text-[#1a1208] dark:text-[#f5f0e8]">
                  {stats.totalProperties}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
