import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const hostRoutes = ["/host"];
const adminRoutes = ["/admin"];
const renterRoutes = ["/renter"];
const authRoutes = ["/login", "/register"];

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session;
  const pathname = nextUrl.pathname;

  // Check if the path starts with any of the protected route prefixes
  const isHostRoute = hostRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isRenterRoute = renterRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Redirect logged-in users away from auth pages
  if (isAuthRoute) {
    if (isLoggedIn) {
      const role = session.user.role;
      let redirectUrl = "/";
      if (role === "HOST") redirectUrl = "/host/dashboard";
      else if (role === "ADMIN") redirectUrl = "/admin/dashboard";
      else redirectUrl = "/";
      return NextResponse.redirect(new URL(redirectUrl, nextUrl));
    }
    return NextResponse.next();
  }

  // Protect host routes — only HOST or ADMIN
  if (isHostRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (session.user.role !== "HOST" && session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  // Protect admin routes — only ADMIN
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  // Protect renter routes — only RENTER or ADMIN
  if (isRenterRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (session.user.role !== "RENTER" && session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all routes except static files, _next internals, and API routes
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
