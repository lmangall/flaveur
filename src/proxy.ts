import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

// Create the intl middleware
const intlMiddleware = createIntlMiddleware(routing);

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/about",
  "/privacy-policy",
  "/terms-of-service",
  "/auth",
  "/invite",
  "/api/auth",
];

function isPublicRoute(pathname: string): boolean {
  // Remove locale prefix for checking
  const pathWithoutLocale = pathname.replace(/^\/(en|fr)/, "") || "/";

  return publicRoutes.some((route) => {
    if (route === "/") return pathWithoutLocale === "/";
    return pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`);
  });
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip proxy entirely for API routes - let them handle their own auth
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Handle root path redirect
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${routing.defaultLocale}`, req.url));
  }

  // Skip localization for auth routes
  if (pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // Check if route is public
  if (!isPublicRoute(pathname)) {
    // Check for Better Auth session cookie (both HTTP and HTTPS versions)
    const sessionCookie =
      req.cookies.get("better-auth.session_token") ||
      req.cookies.get("__Secure-better-auth.session_token");

    if (!sessionCookie) {
      // Redirect to sign-in page
      const locale = pathname.match(/^\/(en|fr)/)?.[1] || routing.defaultLocale;
      const signInUrl = new URL(`/${locale}/auth/sign-in`, req.url);
      signInUrl.searchParams.set("redirect_url", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Use the next-intl middleware for all other routes
  return intlMiddleware(req);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: [
    "/((?!_next|_vercel|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};
