"use client";

import { useState } from "react";
import { suspendUser, activateUser } from "./actions";
import { assignTrustBadge } from "../verifications/actions";
import { ShieldAlert, UserCheck, Loader2, Award, Check, ChevronDown } from "lucide-react";

interface UserRowProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
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
  ADMIN: "bg-[#b8943d]/10 dark:bg-[#fff8dc]/[0.06] text-[#b8943d] dark:text-[#d4cfc7] border border-[#b8943d]/20 dark:border-[#fff8dc]/[0.12]",
  HOST: "bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] border border-[#b8943d]/20 dark:border-[#c9a84c]/20",
  RENTER: "bg-blue-50 dark:bg-[#60a5fa]/10 text-blue-700 dark:text-[#93c5fd] border border-blue-200 dark:border-[#60a5fa]/20",
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
    } catch {
      alert("Failed to update trust badge.");
    } finally {
      setBadgeLoading(false);
    }
  };

  return (
    <>
      <tr className="hover:bg-black/[0.02] dark:hover:bg-[#fff8dc]/[0.02] transition-colors font-sans">
        {/* Name */}
        <td className="px-5 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[#b8943d] dark:bg-[#c9a84c] flex items-center justify-center text-white dark:text-[#0c0b09] font-bold text-xs shrink-0">
              {(user.name || user.email || "U").substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1a1208] dark:text-[#f5f0e8]">
                {user.name || "No Name"}
              </p>
              {isSelf && (
                <span className="text-[10px] text-[#b8943d] dark:text-[#c9a84c] font-bold">
                  (You)
                </span>
              )}
            </div>
          </div>
        </td>

        {/* Email */}
        <td className="px-5 py-4 whitespace-nowrap text-xs text-[#6b5e4e] dark:text-[#8a8278]">
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
                className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] border border-[#b8943d]/20 dark:border-[#c9a84c]/20 hover:border-[#b8943d] dark:hover:border-[#c9a84c] transition-all cursor-pointer"
              >
                <Award className="size-3" />
                <span>{trustBadge}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowBadgeModal(true)}
                className="text-[11px] font-bold text-neutral-400 dark:text-[#8a8278] hover:text-[#b8943d] dark:hover:text-[#c9a84c] hover:underline cursor-pointer"
              >
                + Assign Badge
              </button>
            )
          ) : (
            <span className="text-[10px] text-neutral-400 dark:text-[#524d47] italic">N/A</span>
          )}
        </td>

        {/* Verification Status */}
        <td className="px-5 py-4 whitespace-nowrap">
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
              isVerified
                ? "bg-emerald-50 dark:bg-[#22c55e]/10 text-emerald-700 dark:text-[#86efac] border-emerald-200 dark:border-[#22c55e]/20"
                : "bg-amber-50 dark:bg-[#f59e0b]/10 text-amber-700 dark:text-[#fcd34d] border-amber-200 dark:border-[#f59e0b]/20"
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
        <td className="px-5 py-4 whitespace-nowrap text-xs text-[#6b5e4e] dark:text-[#8a8278]">
          <span className="font-mono">
            {new Date(user.createdAt).toLocaleDateString()}
          </span>
        </td>

        {/* Actions */}
        <td className="px-5 py-4 whitespace-nowrap">
          {isSelf ? (
            <span className="text-[10px] text-neutral-400 dark:text-[#524d47] italic">—</span>
          ) : (
            <div className="flex items-center gap-2">
              {isVerified ? (
                <button
                  onClick={handleSuspend}
                  disabled={loading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold border border-red-200 dark:border-[#ef4444]/20 text-red-600 dark:text-[#fca5a5] hover:bg-red-50 dark:hover:bg-[#ef4444]/10 transition-colors cursor-pointer disabled:opacity-50"
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
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold border border-emerald-200 dark:border-[#22c55e]/20 text-emerald-600 dark:text-[#86efac] hover:bg-emerald-50 dark:hover:bg-[#22c55e]/10 transition-colors cursor-pointer disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans">
          <div className="bg-white dark:bg-[#1c1a16] border border-black/[0.08] dark:border-[#fff8dc]/[0.08] rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-[#fff8dc]/[0.06] pb-3">
              <h3 className="font-extrabold text-base text-[#1a1208] dark:text-[#f5f0e8] flex items-center gap-2">
                <Award className="size-5 text-[#b8943d] dark:text-[#c9a84c]" />
                Assign Host Trust Badge
              </h3>
              <button
                onClick={() => setShowBadgeModal(false)}
                className="text-xs text-[#6b5e4e] dark:text-[#8a8278] hover:text-[#1a1208] dark:hover:text-[#f5f0e8] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBadge} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#1a1208] dark:text-[#8a8278] uppercase tracking-wider mb-1">
                  Badge Title
                </label>
                <div className="relative">
                  <select
                    value={badgeSelect}
                    onChange={(e) => setBadgeSelect(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-black/10 dark:border-[#fff8dc]/[0.07] bg-white dark:bg-[#fff8dc]/[0.03] text-[#1a1208] dark:text-[#d4cfc7] text-sm focus:outline-none focus:border-[#b8943d] dark:focus:border-[#c9a84c]/30 transition-all duration-200 appearance-none cursor-pointer pr-10"
                  >
                    <option value="Verified Host" className="dark:bg-[#141310] dark:text-[#d4cfc7]">Verified Host</option>
                    <option value="Top Host" className="dark:bg-[#141310] dark:text-[#d4cfc7]">Top Host</option>
                    <option value="Trusted Partner" className="dark:bg-[#141310] dark:text-[#d4cfc7]">Trusted Partner</option>
                    <option value="Premium Host" className="dark:bg-[#141310] dark:text-[#d4cfc7]">Premium Host</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b5e4e] dark:text-[#8a8278] pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1a1208] dark:text-[#8a8278] uppercase tracking-wider mb-1">
                  Admin Verified Display Name
                </label>
                <input
                  type="text"
                  value={adminDisplayName}
                  onChange={(e) => setAdminDisplayName(e.target.value)}
                  placeholder="Certified by Bokra Stay Team"
                  className="w-full h-10 px-3 rounded-xl border border-black/10 dark:border-[#fff8dc]/[0.07] bg-white dark:bg-[#fff8dc]/[0.03] text-[#1a1208] dark:text-[#d4cfc7] outline-none focus:border-[#b8943d] dark:focus:border-[#c9a84c]/30"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.06] dark:border-[#fff8dc]/[0.06]">
                <button
                  type="button"
                  onClick={() => setShowBadgeModal(false)}
                  className="px-4 py-2 rounded-xl border border-black/10 dark:border-[#fff8dc]/[0.07] text-[#6b5e4e] dark:text-[#d4cfc7] font-semibold hover:bg-black/5 dark:hover:bg-[#141310]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={badgeLoading}
                  className="px-4 py-2 rounded-xl bg-[#b8943d] dark:bg-[#c9a84c] text-white dark:text-[#0c0b09] font-bold hover:bg-[#d4b458] flex items-center gap-1.5"
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
