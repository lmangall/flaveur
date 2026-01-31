import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedPaths = [
  "/dashboard",
  "/flavours",
  "/substances",
  "/workspaces",
  "/settings",
  "/learn",
  "/molecules",
  "/calculator",
  "/categories",
  "/contribute",
  "/invite",
];

// Routes that should redirect to dashboard if already authenticated
const authPaths = ["/auth/sign-in", "/auth/sign-up"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session token from cookies
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  // Extract locale from path (e.g., /en/dashboard -> en)
  const localeMatch = pathname.match(/^\/(en|fr)(\/|$)/);
  const locale = localeMatch ? localeMatch[1] : "en";
  const pathWithoutLocale = pathname.replace(/^\/(en|fr)/, "") || "/";

  // Check if current path is protected
  const isProtectedPath = protectedPaths.some(
    (path) => pathWithoutLocale === path || pathWithoutLocale.startsWith(`${path}/`)
  );

  // Check if current path is an auth page
  const isAuthPath = authPaths.some(
    (path) => pathWithoutLocale === path || pathWithoutLocale.startsWith(`${path}/`)
  );

  // Redirect to sign-in if accessing protected route without session
  if (isProtectedPath && !sessionToken) {
    const signInUrl = new URL(`/${locale}/auth/sign-in`, request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect to dashboard if accessing auth pages while logged in
  if (isAuthPath && sessionToken) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and api routes
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
