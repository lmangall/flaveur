import { clerkMiddleware } from "@clerk/nextjs/server";

// defining a set of public routes and allowing access to them without authentication
export default clerkMiddleware((auth, req) => {
  const publicRoutes = ["", "/", "/sign-in", "/sign-up"];
  const isPublicRoute = publicRoutes.includes(new URL(req.url).pathname);

  if (isPublicRoute) {
    return;
  }
});

//https://www.youtube.com/watch?v=vi9VhhMFpWI
//check public routes for clerk to access session but not protect

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)|api|trpc|[[...rest]]).*)",
    "/(api|trpc)(.*)",
  ],
};
