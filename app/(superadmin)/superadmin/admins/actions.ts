"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

async function verifySuperAdmin() {
  const session = await auth();
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Only Super Admin can perform this action.");
  }
  return session.user;
}

export async function createAdminAccount(
  name: string,
  email: string,
  password: string,
  role: "ADMIN" | "FINANCE_ADMIN"
) {
  const superUser = await verifySuperAdmin();

  if (!name || !email || !password || !role) {
    return { success: false, error: "All fields are required." };
  }

  if (role !== "ADMIN" && role !== "FINANCE_ADMIN") {
    return { success: false, error: "Invalid admin role requested." };
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { success: false, error: "A user with this email address already exists." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user record
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role as any,
      isVerified: true,
      termsAcceptedAt: new Date(),
    },
  });

  // Create AdminAccount tracking record
  await prisma.adminAccount.create({
    data: {
      userId: newUser.id,
      assignedBy: superUser.name || superUser.email || "Super Admin",
      permissions: role === "FINANCE_ADMIN" ? ["FINANCE_READ", "FINANCE_WRITE"] : ["VERIFICATION_READ", "VERIFICATION_WRITE"],
    },
  });

  revalidatePath("/superadmin/admins");
  return { success: true, message: "Admin account created successfully." };
}

export async function changeAdminRole(userId: string, newRole: "ADMIN" | "FINANCE_ADMIN") {
  await verifySuperAdmin();

  if (!userId || (newRole !== "ADMIN" && newRole !== "FINANCE_ADMIN")) {
    return { success: false, error: "Invalid parameters." };
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!targetUser) {
    return { success: false, error: "Admin user not found." };
  }

  if (targetUser.role === "SUPER_ADMIN") {
    return { success: false, error: "Cannot modify Super Admin account role." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole as any },
  });

  // Update permissions in AdminAccount tracking table
  await prisma.adminAccount.upsert({
    where: { userId },
    update: {
      permissions: newRole === "FINANCE_ADMIN" ? ["FINANCE_READ", "FINANCE_WRITE"] : ["VERIFICATION_READ", "VERIFICATION_WRITE"],
    },
    create: {
      userId,
      assignedBy: "Super Admin",
      permissions: newRole === "FINANCE_ADMIN" ? ["FINANCE_READ", "FINANCE_WRITE"] : ["VERIFICATION_READ", "VERIFICATION_WRITE"],
    },
  });

  revalidatePath("/superadmin/admins");
  return { success: true, message: `Role updated to ${newRole === "ADMIN" ? "Verification Admin" : "Finance Admin"}.` };
}

export async function suspendAdmin(userId: string) {
  await verifySuperAdmin();

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!targetUser) {
    return { success: false, error: "User not found." };
  }

  if (targetUser.role === "SUPER_ADMIN") {
    return { success: false, error: "Cannot suspend Super Admin account." };
  }

  // Toggle suspension status via isVerified boolean
  const nextStatus = !targetUser.isVerified;
  await prisma.user.update({
    where: { id: userId },
    data: { isVerified: nextStatus },
  });

  revalidatePath("/superadmin/admins");
  return {
    success: true,
    message: nextStatus ? "Admin account reactivated." : "Admin account suspended successfully.",
  };
}

export async function removeAdmin(userId: string) {
  await verifySuperAdmin();

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!targetUser) {
    return { success: false, error: "User not found." };
  }

  if (targetUser.role === "SUPER_ADMIN") {
    return { success: false, error: "Cannot delete Super Admin account." };
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath("/superadmin/admins");
  return { success: true, message: "Admin account permanently deleted." };
}
