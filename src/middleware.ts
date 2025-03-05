import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

//https://www.youtube.com/watch?v=vi9VhhMFpWI
//check public routes for clerk to access session but not protect

export const config = {
  matcher: [
    // Allow the sign-in route to be accessible
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)|api|trpc|[[...rest]]).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
