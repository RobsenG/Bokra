import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import UserRow from "./UserRow";
import { Users } from "lucide-react";

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      trustBadge: true,
      trustBadgeAt: true,
      adminVerifiedName: true,
      createdAt: true,
      _count: { select: { properties: true, bookings: true } },
    },
  });

  const hostCount = users.filter((u) => u.role === "HOST").length;
  const renterCount = users.filter((u) => u.role === "RENTER").length;
  const verifiedCount = users.filter((u) => u.isVerified).length;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1208] dark:text-[#f8f6f0] tracking-tight">
            Users
          </h1>
          <p className="text-sm text-[#6b5e4e] dark:text-[#9b9080] mt-0.5">
            Manage user accounts.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#6b5e4e] dark:text-[#9b9080] bg-white dark:bg-[#12121a] border border-black/[0.08] dark:border-white/[0.06] rounded-xl px-4 py-2 shadow-xs">
          <Users className="size-4 text-[#b8943d] dark:text-[#c9a84c]" />
          <span className="font-bold text-[#1a1208] dark:text-[#f8f6f0]">
            {users.length}
          </span>{" "}
          total users
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Users", value: users.length },
          { label: "Hosts", value: hostCount },
          { label: "Renters", value: renterCount },
          { label: "Verified", value: verifiedCount },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-[#12121a] rounded-xl border border-black/[0.08] dark:border-white/[0.06] p-3.5 shadow-xs"
          >
            <p className="text-[11px] font-semibold text-[#6b5e4e] dark:text-[#9b9080] uppercase tracking-wider">
              {s.label}
            </p>
            <p className="text-xl font-extrabold text-[#1a1208] dark:text-[#f8f6f0] mt-1">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#12121a] border border-black/[0.08] dark:border-white/[0.06] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.06]">
          <h2 className="font-bold text-sm text-[#1a1208] dark:text-[#f8f6f0]">
            All users
          </h2>
          <p className="text-xs text-[#6b5e4e] dark:text-[#9b9080] mt-0.5">
            View and manage user accounts.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-black/[0.06] dark:divide-white/[0.06] text-left">
            <thead className="bg-[#f5f3ef] dark:bg-[#1a1a2e]">
              <tr>
                <th className="px-5 py-3 text-xs font-bold text-[#6b5e4e] dark:text-[#9b9080] uppercase tracking-wider">
                  User
                </th>
                <th className="px-5 py-3 text-xs font-bold text-[#6b5e4e] dark:text-[#9b9080] uppercase tracking-wider">
                  Email
                </th>
                <th className="px-5 py-3 text-xs font-bold text-[#6b5e4e] dark:text-[#9b9080] uppercase tracking-wider">
                  Role
                </th>
                <th className="px-5 py-3 text-xs font-bold text-[#6b5e4e] dark:text-[#9b9080] uppercase tracking-wider">
                  Trust Badge
                </th>
                <th className="px-5 py-3 text-xs font-bold text-[#6b5e4e] dark:text-[#9b9080] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 text-xs font-bold text-[#6b5e4e] dark:text-[#9b9080] uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-5 py-3 text-xs font-bold text-[#6b5e4e] dark:text-[#9b9080] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-sm text-[#6b5e4e] dark:text-[#9b9080]"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={{
                      ...user,
                      trustBadgeAt: user.trustBadgeAt
                        ? user.trustBadgeAt.toISOString()
                        : null,
                    }}
                    currentAdminId={session.user.id!}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
