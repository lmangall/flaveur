"use client";

import Link from "next/link";
import { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const routes = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/flavours", label: "My Flavors" },
  { href: "/substances", label: "Substances" },
  { href: "/categories", label: "Categories" },
];

export default function Navbar() {
  const { isSignedIn } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  if (!isSignedIn) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="flex h-16 items-center px-4 md:px-8">
        <Link href="/dashboard" className="font-bold text-lg mr-6">
          FlavorLab
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
          <UserButton afterSignOutUrl="/" />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <Link
                href="/dashboard"
                className="flex items-center mb-6"
                onClick={() => setIsOpen(false)}
              >
                <span className="font-bold text-lg">FlavorLab</span>
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
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
