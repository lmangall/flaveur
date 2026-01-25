import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";

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

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Skip middleware entirely for API routes - let them handle their own auth
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

  // Protect non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // Use the next-intl middleware for all other routes
  return intlMiddleware(req);
});

export const config = {
  // Match all pathnames except for:
  // - _next, _vercel (Next.js internals)
  // - Files with extensions (favicon.ico, images, etc.)
  matcher: ["/((?!_next|_vercel|.*\\..*).*)", "/(api|trpc)(.*)"],
};
