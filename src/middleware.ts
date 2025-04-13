import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
  // Handle root path redirect
  if (req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/en", req.url));
  }

  // Skip localization for auth routes
  if (req.nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // Use the next-intl middleware for all other routes
  return createMiddleware(routing)(req);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
