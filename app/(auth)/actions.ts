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

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "User already exists with this email." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        isVerified: role === "RENTER", // Renters are auto-verified, hosts require document approval
      },
    });

    return { success: true, role: user.role };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    return { error: "Failed to register user. Please try again." };
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
    // NextAuth redirect triggers a special error which we shouldn't block,
    // but redirect: false avoids it anyway.
    return { error: "Invalid credentials. Please try again." };
  }
}

export async function getSessionRole() {
  const session = await auth();
  return session?.user?.role || null;
}
