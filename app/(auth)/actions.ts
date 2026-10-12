"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn, auth } from "@/lib/auth";
import { AuthError } from "next-auth";
import * as z from "zod";
import { sendPasswordResetEmail } from "@/lib/email";

// Use Web Crypto API — safe in all Next.js environments (server actions, Node, Edge)
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["RENTER", "HOST"]),
});

export async function registerUser(data: any) {
  try {
    const validatedData = registerSchema.parse(data);
    const { name, email, password, role } = validatedData;

    // Check for duplicate email with a specific error message
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "An account with this email already exists." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        termsAcceptedAt: new Date(),
        // Renters are auto-verified; hosts require document approval
        isVerified: role === "RENTER",
      },
    });

    // SUCCESS: Do NOT auto sign-in — return success so the client redirects to /login
    return { success: true };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    // Catch Prisma unique constraint violation as a fallback
    if (error?.code === "P2002") {
      return { error: "An account with this email already exists." };
    }
    return { error: "Failed to create account. Please try again." };
  }
}

export async function loginUser(data: any) {
  try {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong during sign in." };
      }
    }
    return { error: "Invalid credentials. Please try again." };
  }
}

export async function getSessionRole() {
  const session = await auth();
  return session?.user?.role || null;
}

// Send password reset email
export async function forgotPassword(email: string) {
  try {
    if (!email || !z.string().email().safeParse(email).success) {
      return { error: "Please enter a valid email address." };
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Security: return success without revealing email non-existence
      return { success: true };
    }

    const token = generateToken();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    await sendPasswordResetEmail({
      email: user.email,
      name: user.name || "User",
      resetUrl,
    });

    return { success: true };
  } catch (error) {
    console.error("[forgotPassword] Unexpected error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return { error: `Failed to send reset link: ${message}` };
  }
}

// Reset password with token
export async function resetPassword(token: string, newPassword: string) {
  try {
    if (!token) {
      return { error: "Invalid or missing token." };
    }

    if (!newPassword || newPassword.length < 8) {
      return { error: "Password must be at least 8 characters long." };
    }

    const user = await prisma.user.findUnique({
      where: { resetToken: token },
    });

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return { error: "This reset link has expired or is invalid. Request a new one." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("[resetPassword] Unexpected error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return { error: `Failed to reset password: ${message}` };
  }
}
