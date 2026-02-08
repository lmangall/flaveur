"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSession, signOut } from "@/lib/auth-client";
import { MenuIcon, Settings, Shield, LogOut, User, Lock, LayoutDashboard } from "lucide-react";
import { Button } from "@/app/[locale]/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/app/[locale]/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/[locale]/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/app/[locale]/components/ui/tooltip";
import { useRouter, usePathname } from "next/navigation";

// Admin emails - must match the server-side list in src/lib/admin.ts
const ADMIN_EMAILS = ["l.mangallon@gmail.com"];

// Public routes shown in navbar (simplified for marketing pages)
const publicRoutes = [
  { href: "/samples", label: "samples", protected: false },
  { href: "/jobs", label: "jobs", protected: false },
  { href: "/about", label: "about", protected: false },
  { href: "/faq", label: "faq", protected: false },
];

// Protected routes (shown with lock icon when logged out)
const protectedRoutes = ["/formulas", "/workspaces", "/substances", "/learn", "/molecules", "/calculator", "/dashboard"];

export default function Navbar() {
  const locale = useLocale();
  const t = useTranslations("Navbar");
  const tAdmin = useTranslations("Admin");
  const { data: session, isPending } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isSignedIn = !!session?.user;
  const isLoaded = !isPending;
  const user = session?.user;

  // Check if user is admin
  const userEmail = user?.email;
  const isAdmin = userEmail ? ADMIN_EMAILS.includes(userEmail) : false;

  const handleSignOut = async () => {
    await signOut();
    router.push(`/${locale}`);
  };

  // Check if a route is active (handles locale prefix)
  const isActiveRoute = (href: string) => {
    const fullPath = `/${locale}${href}`;
    return pathname === fullPath || pathname.startsWith(`${fullPath}/`);
  };

  const handleRouteClick = (href: string, isProtected: boolean) => {
    if (isProtected && !isSignedIn) {
      router.push(`/${locale}/auth/sign-in`);
      return;
    }
    router.push(`/${locale}${href}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <Link href={`/${locale}`} className="flex items-center gap-1">
          <div className="relative h-12 w-12">
            <Image
              src="/logo_transparent_bg_tiny.png"
              alt="Oumamie Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-bold inline-block">Oumamie</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 mx-6">
          {publicRoutes.map((route) => {
            const isActive = isActiveRoute(route.href);
            const isProtected = protectedRoutes.includes(route.href);
            return (
              <Link
                key={route.href}
                href={`/${locale}${route.href}`}
                className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
                  isActive ? "text-primary font-semibold" : "text-muted-foreground"
                }`}
                aria-current={isActive ? "page" : undefined}
                onClick={(e) => {
                  if (isProtected && !isSignedIn) {
                    e.preventDefault();
                    handleRouteClick(route.href, isProtected);
                  }
                }}
              >
                {t(route.label)}
                {isProtected && !isSignedIn && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Sign in required</TooltipContent>
                  </Tooltip>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center space-x-4">
          {isLoaded ? (
            isSignedIn ? (
              <div className="flex items-center space-x-2">
                {/* Go to App button */}
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/${locale}/dashboard`}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Go to App
                  </Link>
                </Button>
                {isAdmin && (
                  <Button variant="ghost" size="icon" asChild title={tAdmin("admin")}>
                    <Link href={`/${locale}/admin`}>
                      <Shield className="h-5 w-5" />
                      <span className="sr-only">{tAdmin("admin")}</span>
                    </Link>
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      {user?.image ? (
                        <Image
                          src={user.image}
                          alt={user.name || "User"}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-2 py-1.5 text-sm">
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-muted-foreground text-xs">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/${locale}/dashboard`}>
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/${locale}/settings`}>
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                className="flex items-center gap-1 mb-6"
                onClick={() => setIsOpen(false)}
              >
                <div className="relative h-10 w-10">
                  <Image
                    src="/logo_transparent_bg_tiny.png"
                    alt="Oumamie Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="font-bold text-lg">Oumamie</span>
              </Link>
              <nav className="flex flex-col space-y-4">
                {publicRoutes.map((route) => {
                  const isActive = isActiveRoute(route.href);
                  const isProtected = protectedRoutes.includes(route.href);
                  return (
                    <Link
                      key={route.href}
                      href={`/${locale}${route.href}`}
                      className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 ${
                        isActive ? "text-primary font-semibold" : "text-muted-foreground"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                      onClick={(e) => {
                        if (isProtected && !isSignedIn) {
                          e.preventDefault();
                          handleRouteClick(route.href, isProtected);
                        }
                        setIsOpen(false);
                      }}
                    >
                      {t(route.label)}
                      {isProtected && !isSignedIn && (
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      )}
                    </Link>
                  );
                })}

                {isSignedIn && (
                  <>
                    <div className="h-px bg-border my-2" />
                    <Link
                      href={`/${locale}/dashboard`}
                      className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 ${
                        isActiveRoute("/dashboard") ? "text-primary font-semibold" : "text-muted-foreground"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Go to App
                    </Link>
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
