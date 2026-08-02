"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn, auth } from "@/lib/auth";
import { AuthError } from "next-auth";
import * as z from "zod";

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
