import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

// Create the intl middleware
const intlMiddleware = createIntlMiddleware(routing);

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/:locale",
  "/:locale/about",
  "/:locale/privacy-policy",
  "/:locale/terms-of-service",
  "/:locale/auth/(.*)",
  "/:locale/invite",
  "/api/(.*)",
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;

  // Skip proxy entirely for API routes - let them handle their own auth
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Handle root path redirect
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${routing.defaultLocale}`, req.url));
  }

  // Skip localization for auth routes and handle redirects
  if (pathname.startsWith("/auth")) {
    // Only redirect to production auth URL in production environment
    if (process.env.NODE_ENV === "production") {
      // If we're coming from accounts.oumamie.xyz, redirect to home
      const referer = req.headers.get("referer");
      if (referer?.includes("accounts.oumamie.xyz")) {
        return NextResponse.redirect(
          new URL(`/${routing.defaultLocale}`, req.url)
        );
      }
    }
    return NextResponse.next();
  }

  // Protect non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // Use the next-intl middleware for all other routes
  return intlMiddleware(req);
});

export const config = {
  // Match all pathnames except for
  // - … if they start with `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: [
    "/((?!_next|_vercel|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};
