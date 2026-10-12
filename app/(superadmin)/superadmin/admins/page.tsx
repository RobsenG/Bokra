import React from "react";
import prisma from "@/lib/prisma";
import AdminManagementClient from "@/components/superadmin/AdminManagementClient";

export const revalidate = 0;

export default async function SuperAdminAdminsPage() {
  const adminUsersRaw = await prisma.user
    .findMany({
      where: {
        role: { in: ["ADMIN", "FINANCE_ADMIN"] },
      },
      include: {
        adminAccount: true,
      },
      orderBy: { createdAt: "desc" },
    })
    .catch(() => []);

  const admins = adminUsersRaw.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.avatar,
    role: u.role as "ADMIN" | "FINANCE_ADMIN" | "SUPER_ADMIN",
    isVerified: u.isVerified,
    createdAt: u.createdAt,
    assignedBy: u.adminAccount?.assignedBy || "Super Admin",
  }));

  return (
    <div className="space-y-6 font-sans pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-[#1a1208] dark:text-[#f5f0e8] tracking-tight">
          Admin Management
        </h1>
        <p className="text-sm text-[#6b5e4e] dark:text-[#8a8278] mt-1">
          Create, assign roles, suspend, or remove secondary administrative users.
        </p>
      </div>

      <AdminManagementClient admins={admins} />
    </div>
  );
}
