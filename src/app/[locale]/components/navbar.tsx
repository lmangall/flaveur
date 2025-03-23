"use client";
import Link from "next/link";
import { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { MenuIcon, Beaker } from "lucide-react";
import { Button } from "@/app/[locale]/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/app/[locale]/components/ui/sheet";

// Routes for authenticated users
const authRoutes = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/flavours", label: "My Flavors" },
  { href: "/substances", label: "Substances" },
  { href: "/categories", label: "Categories" },
  { href: "/jobs", label: "Jobs" },
];

// Routes for guests
const publicRoutes = [
  { href: "/explore", label: "Explore" },
  { href: "/about", label: "About" },
  { href: "/jobs", label: "Jobs" },
];

export default function Navbar() {
  const { isSignedIn, isLoaded } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  // Which routes to show based on auth status
  const routes = isSignedIn ? authRoutes : publicRoutes;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="flex h-16 items-center px-4 md:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <Beaker className="h-6 w-6" />
          <span className="font-bold inline-block">Oumamie</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 mx-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {route.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center space-x-4">
          {isLoaded ? (
            isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/sign-up">Sign Up</Link>
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
                href="/"
                className="flex items-center mb-6"
                onClick={() => setIsOpen(false)}
              >
                <Beaker className="h-6 w-6 mr-2" />
                <span className="font-bold text-lg">Oumamie</span>
              </Link>
              <nav className="flex flex-col space-y-4">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className="text-sm font-medium transition-colors hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    {route.label}
                  </Link>
                ))}

                {!isSignedIn && (
                  <>
                    <div className="h-px bg-border my-2" />
                    <Link
                      href="/sign-in"
                      className="text-sm font-medium transition-colors hover:text-primary"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/sign-up"
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
