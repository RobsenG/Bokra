import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import UserRow from "./UserRow";

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  let users: any[] = [];
  try {
    users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("[DB Error] Could not fetch users:", error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-800 dark:text-white tracking-tight">User Management</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          View and edit roles and verification statuses of all Bokra Stay users.
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-850 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-100 dark:divide-neutral-850">
            <thead className="bg-neutral-50 dark:bg-neutral-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">Verification</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">Joined At</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-100 dark:divide-neutral-850">
              {users.map((user) => (
                <UserRow key={user.id} user={user} currentAdminId={session.user.id!} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
