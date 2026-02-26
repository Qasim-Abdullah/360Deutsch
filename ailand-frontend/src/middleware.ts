import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/api",
  "/forgot-password",
  "/reset-password",
];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const { pathname } = req.nextUrl;

  const isPublic =
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/assets") ||
    pathname === "/favicon.ico" ||
    /\.(.*)$/.test(pathname);

  if (!token && !isPublic) {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("auth_token");
    res.cookies.delete("refresh_token");
    return res;
  }

  // Don't redirect from /login to /dashboard here - let the login page
  // handle it client-side after validating the token with the backend

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
