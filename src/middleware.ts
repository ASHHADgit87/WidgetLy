import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";

export default auth(async (req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/widgets");
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/widgets/:path*", "/login", "/register"],
};
