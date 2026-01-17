import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

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

  // Use the next-intl middleware for all other routes
  return createMiddleware(routing)(req);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
