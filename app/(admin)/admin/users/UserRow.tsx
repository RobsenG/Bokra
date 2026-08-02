"use client";

import { useState } from "react";
import { suspendUser, activateUser } from "./actions";
import { ShieldAlert, UserCheck, Loader2 } from "lucide-react";

interface UserRowProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: "RENTER" | "HOST" | "ADMIN";
    isVerified: boolean;
    createdAt: Date;
    _count?: { properties: number; bookings: number };
  };
  currentAdminId: string;
}

const roleBadge: Record<string, string> = {
  ADMIN: "bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-900/40",
  HOST: "bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-900/40",
  RENTER: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40",
};

export default function UserRow({ user, currentAdminId }: UserRowProps) {
  const [isVerified, setIsVerified] = useState(user.isVerified);
  const [loading, setLoading] = useState(false);
  const isSelf = user.id === currentAdminId;

  const handleSuspend = async () => {
    if (!confirm(`Suspend ${user.name || user.email}? They will lose access.`)) return;
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

  return (
    <tr className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
      {/* Name */}
      <td className="px-5 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
            {(user.name || user.email || "U").substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              {user.name || "No Name"}
            </p>
            {isSelf && (
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">(You)</span>
            )}
          </div>
        </div>
      </td>

      {/* Email */}
      <td className="px-5 py-4 whitespace-nowrap text-xs text-neutral-500 dark:text-neutral-400">
        {user.email}
      </td>

      {/* Role — READ ONLY badge */}
      <td className="px-5 py-4 whitespace-nowrap">
        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${roleBadge[user.role] ?? ""}`}>
          {user.role}
        </span>
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
          {isVerified ? <UserCheck className="size-3" /> : <ShieldAlert className="size-3" />}
          {isVerified ? "Verified" : "Unverified"}
        </span>
      </td>

      {/* Stats */}
      <td className="px-5 py-4 whitespace-nowrap text-xs text-neutral-500 dark:text-neutral-400">
        <span className="font-mono">{new Date(user.createdAt).toLocaleDateString()}</span>
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
                {loading ? <Loader2 className="size-3 animate-spin" /> : <ShieldAlert className="size-3" />}
                Suspend
              </button>
            ) : (
              <button
                onClick={handleActivate}
                disabled={loading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold border border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="size-3 animate-spin" /> : <UserCheck className="size-3" />}
                Activate
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}
