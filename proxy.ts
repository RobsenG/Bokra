import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const superAdminRoutes = ["/superadmin"];
const financeRoutes = ["/finance"];
const adminRoutes = ["/admin"];
const hostRoutes = ["/host"];
const renterRoutes = ["/renter"];
const authRoutes = ["/login", "/register"];

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session;
  const pathname = nextUrl.pathname;

  const isSuperAdminRoute = superAdminRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isFinanceRoute = financeRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isHostRoute = hostRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isRenterRoute = renterRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Redirect logged-in users away from auth pages to home page
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  // Protect /superadmin routes — only SUPER_ADMIN
  if (isSuperAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  // Protect /finance routes — only FINANCE_ADMIN or SUPER_ADMIN
  if (isFinanceRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (
      session.user.role !== "FINANCE_ADMIN" &&
      session.user.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  // Protect /admin routes — only ADMIN or SUPER_ADMIN
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (
      session.user.role !== "ADMIN" &&
      session.user.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  // Protect /host routes — only HOST or SUPER_ADMIN
  if (isHostRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (
      session.user.role !== "HOST" &&
      session.user.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  // Protect /renter routes — only RENTER or SUPER_ADMIN
  if (isRenterRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (
      session.user.role !== "RENTER" &&
      session.user.role !== "SUPER_ADMIN"
    ) {
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
