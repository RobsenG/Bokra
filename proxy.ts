import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Protect Admin routes
  if (nextUrl.pathname.startsWith("/admin")) {
    if (!isAuthenticated) return NextResponse.redirect(new URL("/login", req.url));
    if (userRole !== "ADMIN") return NextResponse.redirect(new URL("/", req.url));
  }

  // Protect Host routes
  if (nextUrl.pathname.startsWith("/host")) {
    if (!isAuthenticated) return NextResponse.redirect(new URL("/login", req.url));
    if (userRole !== "HOST" && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Protect Renter (User) routes - example: specific renter dashboard or bookings
  if (nextUrl.pathname.startsWith("/renter") || nextUrl.pathname.startsWith("/dashboard")) {
    if (!isAuthenticated) return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
