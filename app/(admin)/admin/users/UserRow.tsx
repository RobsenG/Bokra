"use client";

import { useState } from "react";
import { updateUserRole, toggleUserVerification } from "./actions";
import { Role } from "@prisma/client";
import { Check, ShieldAlert, UserCheck } from "lucide-react";

interface UserRowProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: Role;
    isVerified: boolean;
    createdAt: Date;
  };
  currentAdminId: string;
}

export default function UserRow({ user, currentAdminId }: UserRowProps) {
  const [role, setRole] = useState<Role>(user.role);
  const [isVerified, setIsVerified] = useState(user.isVerified);
  const [loading, setLoading] = useState(false);

  const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as Role;
    setLoading(true);
    try {
      await updateUserRole(user.id, newRole);
      setRole(newRole);
    } catch (err: any) {
      alert(err.message || "Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async () => {
    setLoading(true);
    try {
      await toggleUserVerification(user.id, !isVerified);
      setIsVerified(!isVerified);
    } catch (err: any) {
      alert(err.message || "Failed to toggle verification");
    } finally {
      setLoading(false);
    }
  };

  const isSelf = user.id === currentAdminId;

  return (
    <tr className="border-b border-neutral-100 dark:border-neutral-850 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-neutral-800 dark:text-neutral-200">
        {user.name || "No Name"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
        {user.email}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
        {isSelf ? (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400">
            ADMIN (You)
          </span>
        ) : (
          <select
            value={role}
            onChange={handleRoleChange}
            disabled={loading}
            className="h-9 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-xs focus:border-teal-500 outline-none text-neutral-800 dark:text-neutral-200"
          >
            <option value="RENTER">Renter</option>
            <option value="HOST">Host</option>
            <option value="ADMIN">Admin</option>
          </select>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={handleToggleVerification}
          disabled={loading || isSelf}
          className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
            isVerified
              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-100/50"
              : "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-900/30 hover:bg-orange-100/50"
          }`}
        >
          {isVerified ? (
            <>
              <UserCheck className="size-3.5" />
              Verified
            </>
          ) : (
            <>
              <ShieldAlert className="size-3.5" />
              Not Verified
            </>
          )}
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-xs text-neutral-500 dark:text-neutral-400">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
    </tr>
  );
}
