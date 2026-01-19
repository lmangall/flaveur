"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { UserButton, useUser } from "@clerk/nextjs";
import { MenuIcon, Settings, Shield } from "lucide-react";
import { Button } from "@/app/[locale]/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/app/[locale]/components/ui/sheet";
import { useRouter, usePathname } from "next/navigation";

// Admin emails - must match the server-side list in src/lib/admin.ts
const ADMIN_EMAILS = ["l.mangallon@gmail.com"];

// Routes for authenticated users
const authRoutes = [
  // { href: "/dashboard", label: "Dashboard" },
  { href: "/flavours", label: "myFlavours" },
  { href: "/substances", label: "substances" },
  { href: "/jobs", label: "jobs" },
  { href: "/about", label: "about" },
];

export default function Navbar() {
  const locale = useLocale();
  const t = useTranslations("Navbar");
  const tAdmin = useTranslations("Admin");
  const { isSignedIn, isLoaded, user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check if user is admin
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const isAdmin = userEmail ? ADMIN_EMAILS.includes(userEmail) : false;

  // Check if a route is active (handles locale prefix)
  const isActiveRoute = (href: string) => {
    const fullPath = `/${locale}${href}`;
    return pathname === fullPath || pathname.startsWith(`${fullPath}/`);
  };

  // Always show the same routes, but handle auth redirects in the click handler
  const routes = authRoutes;

  const handleRouteClick = (href: string) => {
    // If the route requires auth and user is not signed in, redirect to sign in
    if (
      !isSignedIn &&
      ["/dashboard", "/flavours", "/substances"].includes(href)
    ) {
      router.push(`/${locale}/auth/sign-in`);
      return;
    }
    // If user is signed in or route doesn't require auth, navigate to the route
    router.push(`/${locale}${href}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="flex h-16 items-center px-4 md:px-8">
        <Link href={`/${locale}`} className="flex items-center space-x-2">
          <div className="relative h-12 w-12">
            <Image
              src="/logo_transparent_bg_tiny.png"
              alt="Flaveur Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-bold inline-block">Oumamie</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 mx-6">
          {routes.map((route) => {
            const isActive = isActiveRoute(route.href);
            return (
              <Link
                key={route.href}
                href={`/${locale}${route.href}`}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-primary font-semibold" : "text-muted-foreground"
                }`}
                aria-current={isActive ? "page" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  handleRouteClick(route.href);
                }}
              >
                {t(route.label)}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center space-x-4">
          {isLoaded ? (
            isSignedIn ? (
              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <Button variant="ghost" size="icon" asChild title={tAdmin("admin")}>
                    <Link href={`/${locale}/admin`}>
                      <Shield className="h-5 w-5" />
                      <span className="sr-only">{tAdmin("admin")}</span>
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/${locale}/settings`}>
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Settings</span>
                  </Link>
                </Button>
                <UserButton afterSignOutUrl={`/${locale}`} />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/${locale}/auth/sign-in`}>Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={`/${locale}/auth/sign-up`}>Sign Up</Link>
                </Button>
              </div>
            )
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          )}

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <Link
                href={`/${locale}`}
                className="flex items-center mb-6"
                onClick={() => setIsOpen(false)}
              >
                <div className="relative h-10 w-10 mr-2">
                  <Image
                    src="/logo_transparent_bg_tiny.png"
                    alt="Flaveur Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="font-bold text-lg">Oumamie</span>
              </Link>
              <nav className="flex flex-col space-y-4">
                {routes.map((route) => {
                  const isActive = isActiveRoute(route.href);
                  return (
                    <Link
                      key={route.href}
                      href={`/${locale}${route.href}`}
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        isActive ? "text-primary font-semibold" : "text-muted-foreground"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        handleRouteClick(route.href);
                        setIsOpen(false);
                      }}
                    >
                      {t(route.label)}
                    </Link>
                  );
                })}

                {isSignedIn && (
                  <>
                    <div className="h-px bg-border my-2" />
                    {isAdmin && (
                      <Link
                        href={`/${locale}/admin`}
                        className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 ${
                          isActiveRoute("/admin") ? "text-primary font-semibold" : "text-muted-foreground"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Shield className="h-4 w-4" />
                        {tAdmin("admin")}
                      </Link>
                    )}
                    <Link
                      href={`/${locale}/settings`}
                      className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 ${
                        isActiveRoute("/settings") ? "text-primary font-semibold" : "text-muted-foreground"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </>
                )}

                {!isSignedIn && (
                  <>
                    <div className="h-px bg-border my-2" />
                    <Link
                      href={`/${locale}/auth/sign-in`}
                      className="text-sm font-medium transition-colors hover:text-primary"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href={`/${locale}/auth/sign-up`}
                      className="text-sm font-medium transition-colors hover:text-primary"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
