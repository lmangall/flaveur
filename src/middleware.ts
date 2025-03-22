// src/middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse, NextFetchEvent } from "next/server";
import i18nConfig from "../next-intl.config"; // Use direct import

// Create next-intl middleware
const intlMiddleware = createMiddleware(i18nConfig);

// Clerk authentication middleware
const authMiddleware = clerkMiddleware(async (auth, req: NextRequest) => {
  const publicRoutes = ["", "/", "/auth/sign-in", "/auth/sign-up"];
  const isPublicRoute = publicRoutes.includes(new URL(req.url).pathname);

  // If the route is public, just run the intlMiddleware
  if (isPublicRoute) {
    return intlMiddleware(req);
  }

  // If it's a protected route, handle authentication logic
  return NextResponse.next();
});

// Combined middleware function
const combinedMiddleware = (req: NextRequest, event: NextFetchEvent) => {
  // Pass the request and event to clerkMiddleware
  return authMiddleware(req, event);
};

// Export the combined middleware
export default combinedMiddleware;

// Matcher config to apply the middleware to desired routes
export const config = {
  matcher: ["/((?!api|_next|_vercel\\..*).*)"], // this solved: Unable to find `next-intl` locale because the middleware didn't run on this request.
};
