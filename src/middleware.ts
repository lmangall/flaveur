import { clerkMiddleware } from "@clerk/nextjs/server";

// defining a set of public routes and allowing access to them without authentication
export default clerkMiddleware((auth, req) => {
  const publicRoutes = ["", "/", "/auth/sign-in", "/auth/sign-up"];
  const isPublicRoute = publicRoutes.includes(new URL(req.url).pathname);

  if (isPublicRoute) {
    return;
  }
});

//https://www.youtube.com/watch?v=vi9VhhMFpWI
//check public routes for clerk to access session but not protect

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)", "/(api|trpc)(.*)"],
};
