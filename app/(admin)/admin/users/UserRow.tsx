"use client";

import { useState } from "react";
import { suspendUser, activateUser } from "./actions";
import { assignTrustBadge } from "../verifications/actions";
import { ShieldAlert, UserCheck, Loader2, Award, Check } from "lucide-react";

interface UserRowProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: "RENTER" | "HOST" | "ADMIN";
    isVerified: boolean;
    trustBadge?: string | null;
    trustBadgeAt?: string | null;
    adminVerifiedName?: string | null;
    createdAt: Date;
    _count?: { properties: number; bookings: number };
  };
  currentAdminId: string;
}

const roleBadge: Record<string, string> = {
  ADMIN:
    "bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-900/40",
  HOST: "bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-900/40",
  RENTER:
    "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40",
};

export default function UserRow({ user, currentAdminId }: UserRowProps) {
  const [isVerified, setIsVerified] = useState(user.isVerified);
  const [trustBadge, setTrustBadge] = useState<string | null>(
    user.trustBadge || null
  );
  const [loading, setLoading] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [badgeSelect, setBadgeSelect] = useState(
    user.trustBadge || "Verified Host"
  );
  const [adminDisplayName, setAdminDisplayName] = useState(
    user.adminVerifiedName || "Certified by Bokra Stay Team"
  );
  const [badgeLoading, setBadgeLoading] = useState(false);

  const isSelf = user.id === currentAdminId;

  const handleSuspend = async () => {
    if (!confirm(`Suspend ${user.name || user.email}? They will lose access.`))
      return;
    setLoading(true);
    try {
      await suspendUser(user.id);
      setIsVerified(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to suspend user");
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    setLoading(true);
    try {
      await activateUser(user.id);
      setIsVerified(true);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to activate user");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    setBadgeLoading(true);
    try {
      const res = await assignTrustBadge(user.id, badgeSelect, adminDisplayName);
      if (res?.error) {
        alert(res.error);
      } else {
        setTrustBadge(badgeSelect);
        setShowBadgeModal(false);
      }
    } catch (err) {
      alert("Failed to update trust badge.");
    } finally {
      setBadgeLoading(false);
    }
  };

  return (
    <>
      <tr className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors font-sans">
        {/* Name */}
        <td className="px-5 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#7c3aed] to-violet-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {(user.name || user.email || "U").substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                {user.name || "No Name"}
              </p>
              {isSelf && (
                <span className="text-[10px] text-[#7c3aed] font-bold">
                  (You)
                </span>
              )}
            </div>
          </div>
        </td>

        {/* Email */}
        <td className="px-5 py-4 whitespace-nowrap text-xs text-neutral-500 dark:text-neutral-400">
          {user.email}
        </td>

        {/* Role */}
        <td className="px-5 py-4 whitespace-nowrap">
          <span
            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
              roleBadge[user.role] ?? ""
            }`}
          >
            {user.role}
          </span>
        </td>

        {/* Trust Badge Column */}
        <td className="px-5 py-4 whitespace-nowrap">
          {user.role === "HOST" ? (
            trustBadge ? (
              <button
                onClick={() => setShowBadgeModal(true)}
                className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-[#7c3aed] border border-purple-200 hover:border-[#7c3aed] transition-all cursor-pointer"
              >
                <Award className="size-3" />
                <span>{trustBadge}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowBadgeModal(true)}
                className="text-[11px] font-bold text-neutral-400 hover:text-[#7c3aed] hover:underline cursor-pointer"
              >
                + Assign Badge
              </button>
            )
          ) : (
            <span className="text-[10px] text-neutral-400 italic">N/A</span>
          )}
        </td>

        {/* Verification Status */}
        <td className="px-5 py-4 whitespace-nowrap">
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
              isVerified
                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40"
                : "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/40"
            }`}
          >
            {isVerified ? (
              <UserCheck className="size-3" />
            ) : (
              <ShieldAlert className="size-3" />
            )}
            {isVerified ? "Verified" : "Unverified"}
          </span>
        </td>

        {/* Joined */}
        <td className="px-5 py-4 whitespace-nowrap text-xs text-neutral-500 dark:text-neutral-400">
          <span className="font-mono">
            {new Date(user.createdAt).toLocaleDateString()}
          </span>
        </td>

        {/* Actions */}
        <td className="px-5 py-4 whitespace-nowrap">
          {isSelf ? (
            <span className="text-[10px] text-neutral-400 italic">—</span>
          ) : (
            <div className="flex items-center gap-2">
              {isVerified ? (
                <button
                  onClick={handleSuspend}
                  disabled={loading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <ShieldAlert className="size-3" />
                  )}
                  Suspend
                </button>
              ) : (
                <button
                  onClick={handleActivate}
                  disabled={loading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold border border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <UserCheck className="size-3" />
                  )}
                  Activate
                </button>
              )}
            </div>
          )}
        </td>
      </tr>

      {/* Trust Badge Modal */}
      {showBadgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-sans">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="font-extrabold text-base text-neutral-800 dark:text-white flex items-center gap-2">
                <Award className="size-5 text-[#7c3aed]" />
                Assign Host Trust Badge
              </h3>
              <button
                onClick={() => setShowBadgeModal(false)}
                className="text-xs text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBadge} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  Badge Title
                </label>
                <select
                  value={badgeSelect}
                  onChange={(e) => setBadgeSelect(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-white dark:bg-neutral-900 font-medium text-neutral-800 dark:text-neutral-100 outline-none focus:border-[#7c3aed]"
                >
                  <option value="Verified Host">Verified Host</option>
                  <option value="Top Host">Top Host</option>
                  <option value="Trusted Partner">Trusted Partner</option>
                  <option value="Premium Host">Premium Host</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  Admin Verified Display Name
                </label>
                <input
                  type="text"
                  value={adminDisplayName}
                  onChange={(e) => setAdminDisplayName(e.target.value)}
                  placeholder="Certified by Bokra Stay Team"
                  className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowBadgeModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={badgeLoading}
                  className="px-4 py-2 rounded-xl bg-[#7c3aed] text-white font-bold hover:bg-[#6d28d9] flex items-center gap-1.5"
                >
                  {badgeLoading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Check className="size-3.5" />
                  )}
                  Save Badge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
