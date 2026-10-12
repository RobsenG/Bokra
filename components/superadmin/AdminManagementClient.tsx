"use client";

import React, { useState } from "react";
import {
  UserPlus,
  Shield,
  Briefcase,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Trash2,
  RefreshCw,
  X,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  createAdminAccount,
  changeAdminRole,
  suspendAdmin,
  removeAdmin,
} from "../../app/(superadmin)/superadmin/admins/actions";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  role: "ADMIN" | "FINANCE_ADMIN" | "SUPER_ADMIN";
  isVerified: boolean;
  createdAt: Date;
  assignedBy?: string;
}

interface Props {
  admins: AdminUser[];
}

export default function AdminManagementClient({ admins }: Props) {
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [roleModalUser, setRoleModalUser] = useState<AdminUser | null>(null);
  const [removeModalUser, setRemoveModalUser] = useState<AdminUser | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "FINANCE_ADMIN">("ADMIN");
  const [showPassword, setShowPassword] = useState(false);

  const [confirmText, setConfirmText] = useState("");
  const [selectedNewRole, setSelectedNewRole] = useState<"ADMIN" | "FINANCE_ADMIN">("ADMIN");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await createAdminAccount(name, email, password, role);
      if (res.success) {
        setSuccess(res.message || "Admin account created successfully!");
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setIsCreateOpen(false);
        setCreateStep(1);
      } else {
        setError(res.error || "Failed to create admin.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRoleSubmit = async () => {
    if (!roleModalUser) return;
    setLoading(true);
    setError(null);
    try {
      const res = await changeAdminRole(roleModalUser.id, selectedNewRole);
      if (res.success) {
        setRoleModalUser(null);
      } else {
        setError(res.error || "Failed to change role.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendToggle = async (userId: string) => {
    setLoading(true);
    try {
      await suspendAdmin(userId);
    } catch (err: any) {
      alert(err.message || "Failed to toggle suspension status.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSubmit = async () => {
    if (!removeModalUser) return;
    if (confirmText !== "CONFIRM") {
      setError("Please type CONFIRM to proceed.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await removeAdmin(removeModalUser.id);
      if (res.success) {
        setRemoveModalUser(null);
        setConfirmText("");
      } else {
        setError(res.error || "Failed to remove admin.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header action button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#141310] p-6 rounded-3xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-[#1a1208] dark:text-[#f5f0e8]">
            Admin Account Directory ({admins.length})
          </h2>
          <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278] mt-0.5">
            Manage platform verification and finance administrators.
          </p>
        </div>

        <button
          onClick={() => {
            setError(null);
            setSuccess(null);
            setCreateStep(1);
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#b8943d] dark:bg-[#c9a84c] hover:bg-[#d4b458] text-white dark:text-[#0c0b09] font-bold text-xs shadow-xs transition-all cursor-pointer"
        >
          <UserPlus className="size-4" />
          <span>+ Create Admin Account</span>
        </button>
      </div>

      {/* Global Alerts */}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Admins List Table */}
      <div className="overflow-x-auto rounded-3xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] bg-white dark:bg-[#141310] shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#faf9f7] dark:bg-[#1c1a16] border-b border-black/[0.06] dark:border-[#fff8dc]/[0.05] text-[#6b5e4e] dark:text-[#8a8278] uppercase font-bold text-[10px]">
            <tr>
              <th className="px-5 py-4">Admin User</th>
              <th className="px-5 py-4">Role Badge</th>
              <th className="px-5 py-4">Assigned By</th>
              <th className="px-5 py-4">Created Date</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.05] dark:divide-[#fff8dc]/[0.04] text-[#1a1208] dark:text-[#f5f0e8]">
            {admins.length > 0 ? (
              admins.map((adm) => (
                <tr key={adm.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {adm.avatar ? (
                        <img src={adm.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-black/10" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#b8943d]/20 text-[#b8943d] dark:text-[#c9a84c] font-bold flex items-center justify-center text-xs">
                          {adm.name?.charAt(0).toUpperCase() || "A"}
                        </div>
                      )}
                      <div>
                        <p className="font-extrabold text-sm text-[#1a1208] dark:text-[#f5f0e8]">{adm.name || "Admin"}</p>
                        <p className="text-[11px] text-[#6b5e4e] dark:text-[#8a8278] font-mono">{adm.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {adm.role === "FINANCE_ADMIN" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-[#b8943d]/10 text-[#b8943d] dark:bg-[#c9a84c]/10 dark:text-[#c9a84c] border border-[#b8943d]/20 dark:border-[#c9a84c]/20">
                        <Briefcase className="size-3" />
                        FINANCE_ADMIN
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#1a1208] text-white dark:bg-[#fff8dc]/[0.06] dark:text-[#d4cfc7] border border-black/10 dark:border-[#fff8dc]/[0.12]">
                        <Shield className="size-3" />
                        ADMIN
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-[#6b5e4e] dark:text-[#8a8278] font-medium">
                    {adm.assignedBy || "Super Admin"}
                  </td>
                  <td className="px-5 py-4 text-[#6b5e4e] dark:text-[#8a8278]">
                    {new Date(adm.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        adm.isVerified
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200"
                          : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200"
                      }`}
                    >
                      {adm.isVerified ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setSelectedNewRole(adm.role === "FINANCE_ADMIN" ? "ADMIN" : "FINANCE_ADMIN");
                        setRoleModalUser(adm);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      Change Role
                    </button>
                    <button
                      onClick={() => handleSuspendToggle(adm.id)}
                      disabled={loading}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                        adm.isVerified
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                      }`}
                    >
                      {adm.isVerified ? "Suspend" : "Activate"}
                    </button>
                    <button
                      onClick={() => {
                        setConfirmText("");
                        setError(null);
                        setRemoveModalUser(adm);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-[#9b8e7e] italic">
                  No secondary admin accounts found. Click "Create Admin Account" to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: Step-by-Step Create Admin Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141310] rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-black/[0.08] dark:border-[#fff8dc]/[0.08] shadow-2xl space-y-6 animate-in fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-[#fff8dc]/[0.05] pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-[#1a1208] dark:text-[#f5f0e8] flex items-center gap-2">
                  <UserPlus className="size-5 text-[#b8943d] dark:text-[#c9a84c]" />
                  <span>Create Admin Account</span>
                </h3>
                <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278] mt-0.5">
                  Step {createStep} of 2: {createStep === 1 ? "User Information" : "Role Assignment"}
                </p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-[#9b8e7e] hover:text-[#1a1208]"
              >
                <X className="size-5" />
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-600 dark:text-red-300 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              {createStep === 1 ? (
                /* Step 1: Credentials */
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold mb-1 uppercase tracking-wider text-[#6b5e4e] dark:text-[#8a8278]">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Abebe Bikila"
                      className="w-full h-11 px-4 rounded-xl border border-black/10 dark:border-[#fff8dc]/[0.07] bg-white dark:bg-[#1c1a16] text-[#1a1208] dark:text-[#f5f0e8] outline-none focus:border-[#b8943d]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 uppercase tracking-wider text-[#6b5e4e] dark:text-[#8a8278]">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@bokrastay.com"
                      className="w-full h-11 px-4 rounded-xl border border-black/10 dark:border-[#fff8dc]/[0.07] bg-white dark:bg-[#1c1a16] text-[#1a1208] dark:text-[#f5f0e8] outline-none focus:border-[#b8943d]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 uppercase tracking-wider text-[#6b5e4e] dark:text-[#8a8278]">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        className="w-full h-11 px-4 rounded-xl border border-black/10 dark:border-[#fff8dc]/[0.07] bg-white dark:bg-[#1c1a16] text-[#1a1208] dark:text-[#f5f0e8] outline-none focus:border-[#b8943d]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-[#9b8e7e]"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1 uppercase tracking-wider text-[#6b5e4e] dark:text-[#8a8278]">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full h-11 px-4 rounded-xl border border-black/10 dark:border-[#fff8dc]/[0.07] bg-white dark:bg-[#1c1a16] text-[#1a1208] dark:text-[#f5f0e8] outline-none focus:border-[#b8943d]"
                    />
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (!name || !email || !password) {
                          setError("Please complete all fields before continuing.");
                          return;
                        }
                        setError(null);
                        setCreateStep(2);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-[#b8943d] dark:bg-[#c9a84c] text-white dark:text-[#0c0b09] font-bold text-xs"
                    >
                      Next Step: Select Role →
                    </button>
                  </div>
                </div>
              ) : (
                /* Step 2: Role Selection */
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold mb-2 uppercase tracking-wider text-[#6b5e4e] dark:text-[#8a8278]">
                      Assign Administrative Role
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setRole("ADMIN")}
                        className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          role === "ADMIN"
                            ? "border-black/40 bg-black/5 dark:bg-white/5 text-[#1a1208] dark:text-[#f5f0e8] ring-2 ring-black dark:ring-white"
                            : "border-black/10 dark:border-white/10 text-[#6b5e4e] dark:text-[#8a8278]"
                        }`}
                      >
                        <Shield className="size-5 mb-2" />
                        <div>
                          <p className="font-extrabold text-sm">ADMIN</p>
                          <p className="text-[10px] opacity-80 mt-0.5">Verification &amp; Listing Reviews</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole("FINANCE_ADMIN")}
                        className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          role === "FINANCE_ADMIN"
                            ? "border-[#b8943d] bg-[#b8943d]/10 text-[#b8943d] dark:text-[#c9a84c] ring-2 ring-[#b8943d]"
                            : "border-black/10 dark:border-white/10 text-[#6b5e4e] dark:text-[#8a8278]"
                        }`}
                      >
                        <Briefcase className="size-5 mb-2" />
                        <div>
                          <p className="font-extrabold text-sm">FINANCE_ADMIN</p>
                          <p className="text-[10px] opacity-80 mt-0.5">Payouts &amp; Withdrawals</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setCreateStep(1)}
                      className="px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 font-bold text-xs"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 rounded-xl bg-[#b8943d] dark:bg-[#c9a84c] text-white dark:text-[#0c0b09] font-bold text-xs shadow-xs"
                    >
                      {loading ? "Creating..." : "Confirm & Create Admin"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Change Role Modal */}
      {roleModalUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141310] rounded-3xl max-w-sm w-full p-6 border border-black/[0.08] dark:border-[#fff8dc]/[0.08] shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-[#1a1208] dark:text-[#f5f0e8]">
              Change Role for {roleModalUser.name}
            </h3>
            <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278]">
              Current role: <span className="font-bold text-[#1a1208] dark:text-[#f5f0e8]">{roleModalUser.role}</span>
            </p>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6b5e4e] dark:text-[#8a8278]">
                Select New Role:
              </label>
              <select
                value={selectedNewRole}
                onChange={(e) => setSelectedNewRole(e.target.value as any)}
                className="w-full h-11 px-4 rounded-xl border border-black/10 dark:border-[#fff8dc]/[0.07] bg-white dark:bg-[#1c1a16] text-xs font-bold text-[#1a1208] dark:text-[#f5f0e8] outline-none"
              >
                <option value="ADMIN">ADMIN (Verification)</option>
                <option value="FINANCE_ADMIN">FINANCE_ADMIN (Payouts)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setRoleModalUser(null)}
                className="px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeRoleSubmit}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-[#b8943d] dark:bg-[#c9a84c] text-white dark:text-[#0c0b09] font-bold text-xs"
              >
                {loading ? "Saving..." : "Confirm Role"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Remove Admin Confirmation Modal */}
      {removeModalUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141310] rounded-3xl max-w-sm w-full p-6 border border-black/[0.08] dark:border-[#fff8dc]/[0.08] shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="size-5" />
              <h3 className="text-sm font-extrabold">Remove Admin Account</h3>
            </div>
            <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278]">
              Are you sure you want to permanently delete account for{" "}
              <strong className="text-red-600 font-mono">{removeModalUser.email}</strong>?
            </p>

            <div>
              <label className="block text-[11px] font-bold mb-1 text-red-600 uppercase">
                Type "CONFIRM" to verify:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="CONFIRM"
                className="w-full h-10 px-3 rounded-xl border border-red-500/30 bg-white dark:bg-[#1c1a16] text-xs font-bold text-red-600 outline-none"
              />
            </div>

            {error && <p className="text-xs text-red-600 font-bold">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRemoveModalUser(null)}
                className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveSubmit}
                disabled={loading || confirmText !== "CONFIRM"}
                className="px-5 py-2 rounded-xl bg-red-600 text-white font-bold text-xs disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
