"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl"; // Import useTranslations
import { UserButton, useUser } from "@clerk/nextjs";
import { MenuIcon } from "lucide-react";
import { Button } from "@/app/[locale]/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/app/[locale]/components/ui/sheet";
import { useRouter } from "next/navigation";

// Routes for authenticated users
const authRoutes = [
  // { href: "/dashboard", label: "Dashboard" },
  { href: "/flavours", label: "myFlavours" },
  { href: "/substances", label: "substances" },
  { href: "/jobs", label: "jobs" },
  { href: "/about", label: "about" },
];

export default function Navbar() {
  const locale = useLocale(); // Get current locale
  const t = useTranslations("Navbar"); // Initialize translations with Navbar namespace
  const { isSignedIn, isLoaded } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

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
          {routes.map((route) => (
            <Link
              key={route.href}
              href={`/${locale}${route.href}`}
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={(e) => {
                e.preventDefault();
                handleRouteClick(route.href);
              }}
            >
              {t(route.label)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center space-x-4">
          {isLoaded ? (
            isSignedIn ? (
              <UserButton afterSignOutUrl={`/${locale}`} />
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
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={`/${locale}${route.href}`}
                    className="text-sm font-medium transition-colors hover:text-primary"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRouteClick(route.href);
                      setIsOpen(false);
                    }}
                  >
                    {t(route.label)}
                  </Link>
                ))}

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
