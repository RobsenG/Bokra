import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  const searchParams = req.nextUrl.searchParams;
  const targetRole = searchParams.get("role")?.toUpperCase();
  const callbackUrl = searchParams.get("callbackUrl");

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Protect administrative roles from being modified
  const currentRole = session.user.role;
  const isProtectedAdmin =
    currentRole === "ADMIN" ||
    currentRole === "SUPER_ADMIN" ||
    currentRole === "FINANCE_ADMIN";

  if (!isProtectedAdmin) {
    if (targetRole === "HOST") {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          role: "HOST" as Role,
          // Hosts require verification of documents
          isVerified: false,
          termsAcceptedAt: new Date(),
        },
      });
      return NextResponse.redirect(new URL(callbackUrl || "/host/dashboard", req.url));
    } else if (targetRole === "RENTER") {
      // If user was RENTER or default
      if (currentRole !== "HOST") {
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            role: "RENTER" as Role,
            isVerified: true,
            termsAcceptedAt: new Date(),
          },
        });
      }
    }
  }

  const destination =
    callbackUrl || (currentRole === "HOST" || targetRole === "HOST" ? "/host/dashboard" : "/");
  return NextResponse.redirect(new URL(destination, req.url));
}
