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
  ADMIN: "bg-purple-50 text-[#7c3aed] border border-purple-200",
  HOST: "bg-purple-50 text-[#7c3aed] border border-purple-200",
  RENTER: "bg-blue-50 text-blue-700 border border-blue-200",
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
      <tr className="hover:bg-neutral-50/50 transition-colors font-sans">
        {/* Name */}
        <td className="px-5 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[#7c3aed] flex items-center justify-center text-white font-bold text-xs shrink-0">
              {(user.name || user.email || "U").substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111827]">
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
        <td className="px-5 py-4 whitespace-nowrap text-xs text-[#6b7280]">
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
                className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-50 text-[#7c3aed] border border-purple-200 hover:border-[#7c3aed] transition-all cursor-pointer"
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
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-orange-50 text-orange-700 border-orange-200"
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
        <td className="px-5 py-4 whitespace-nowrap text-xs text-[#6b7280]">
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
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
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
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer disabled:opacity-50"
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
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-3">
              <h3 className="font-extrabold text-base text-[#111827] flex items-center gap-2">
                <Award className="size-5 text-[#7c3aed]" />
                Assign Host Trust Badge
              </h3>
              <button
                onClick={() => setShowBadgeModal(false)}
                className="text-xs text-[#6b7280] hover:text-[#111827] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBadge} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#111827] uppercase tracking-wider mb-1">
                  Badge Title
                </label>
                <div className="relative">
                  <select
                    value={badgeSelect}
                    onChange={(e) => setBadgeSelect(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e5e7eb] bg-white text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed] transition-all duration-200 appearance-none cursor-pointer pr-10"
                  >
                    <option value="Verified Host">Verified Host</option>
                    <option value="Top Host">Top Host</option>
                    <option value="Trusted Partner">Trusted Partner</option>
                    <option value="Premium Host">Premium Host</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280] pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#111827] uppercase tracking-wider mb-1">
                  Admin Verified Display Name
                </label>
                <input
                  type="text"
                  value={adminDisplayName}
                  onChange={(e) => setAdminDisplayName(e.target.value)}
                  placeholder="Certified by Bokra Stay Team"
                  className="w-full h-10 px-3 rounded-xl border border-[#e5e7eb] bg-white text-[#111827] outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#e5e7eb]">
                <button
                  type="button"
                  onClick={() => setShowBadgeModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#e5e7eb] text-[#6b7280] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={badgeLoading}
                  className="px-4 py-2 rounded-xl bg-[#7c3aed] text-white font-bold hover:bg-[#5b21b6] flex items-center gap-1.5"
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
