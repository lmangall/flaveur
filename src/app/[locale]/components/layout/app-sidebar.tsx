"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useSession, signOut } from "@/lib/auth-client";
import {
  LayoutDashboard,
  FlaskConical,
  FolderKanban,
  Beaker,
  BookMarked,
  BookOpen,
  Atom,
  Calculator,
  Settings,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Menu,
  Briefcase,
  Shield,
  Radar,
  Share2,
  Image as ImageIcon,
  Database,
  MessageCircle,
  Mail,
} from "lucide-react";
import { Button } from "@/app/[locale]/components/ui/button";
import { ScrollArea } from "@/app/[locale]/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/app/[locale]/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger } from "@/app/[locale]/components/ui/sheet";
import { Separator } from "@/app/[locale]/components/ui/separator";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { InviteFriendDialog } from "@/app/[locale]/components/invite-friend-dialog";

// Admin emails - must match the server-side list in src/lib/admin.ts
const ADMIN_EMAILS = ["l.mangallon@gmail.com"];

const navItems = [
  { href: "/dashboard", label: "dashboard", icon: LayoutDashboard },
  { href: "/formulas", label: "myFormulas", icon: FlaskConical },
  { href: "/community", label: "community", icon: User },
  { href: "/workspaces", label: "workspaces", icon: FolderKanban },
  { href: "/substances", label: "substances", icon: Beaker },
  { href: "/learn", label: "learn", icon: BookOpen },
  { href: "/molecules", label: "molecules", icon: Atom },
  { href: "/calculator", label: "calculator", icon: Calculator },
  { href: "/ingredients", label: "ingredients", icon: BookMarked },
];

const adminNavItems = [
  { href: "/admin", label: "dashboard", icon: LayoutDashboard },
  {
    section: "jobs",
    items: [
      { href: "/admin/jobs", label: "jobs", icon: Briefcase },
      { href: "/admin/job-monitors", label: "monitors", icon: Radar },
    ]
  },
  {
    section: "content",
    items: [
      { href: "/admin/jobs-social", label: "jobsSocial", icon: Share2 },
      { href: "/admin/snippets", label: "snippets", icon: ImageIcon },
      { href: "/admin/newsletter", label: "newsletter", icon: Mail },
    ]
  },
  {
    section: "system",
    items: [
      { href: "/admin/data-quality", label: "dataQuality", icon: Database },
      { href: "/admin/support", label: "support", icon: MessageCircle },
    ]
  }
];

interface AppSidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function AppSidebar({ collapsed = false, onCollapsedChange }: AppSidebarProps) {
  const locale = useLocale();
  const t = useTranslations("Navbar");
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const [mounted, setMounted] = useState(false);

  // Check if user is admin
  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActiveRoute = (href: string) => {
    const fullPath = `/${locale}${href}`;
    return pathname === fullPath || pathname.startsWith(`${fullPath}/`);
  };

  const isOnAdminRoute = pathname.includes('/admin');

  const handleSignOut = async () => {
    await signOut();
    router.push(`/${locale}`);
  };

  const NavLink = ({
    href,
    label,
    icon: Icon,
  }: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }) => {
    const isActive = isActiveRoute(href);
    const linkContent = (
      <Link
        href={`/${locale}${href}`}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground"
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span>{t(label)}</span>}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-4">
            {t(label)}
          </TooltipContent>
        </Tooltip>
      );
    }

    return linkContent;
  };

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link
          href={`/${locale}`}
          className={cn("flex items-center gap-1", collapsed && "justify-center")}
        >
          <div className="relative h-8 w-8 shrink-0">
            <Image
              src="/logo_transparent_bg_tiny.png"
              alt="Oumamie Logo"
              fill
              className="object-contain"
            />
          </div>
          {!collapsed && <span className="font-bold text-lg">Oumamie</span>}
        </Link>
        {onCollapsedChange && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCollapsedChange(!collapsed)}
            className={cn("h-8 w-8", collapsed && "absolute -right-3 top-5 z-10 rounded-full border bg-background shadow-sm")}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {isOnAdminRoute && isAdmin ? (
            // Show admin navigation
            <>
              {adminNavItems.map((item) => {
                if ('section' in item) {
                  return (
                    <div key={item.section}>
                      {!collapsed && (
                        <p className="px-3 pt-4 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {t(`sections.${item.section}`)}
                        </p>
                      )}
                      {item.items?.map((subItem) => (
                        <NavLink key={subItem.href} {...subItem} />
                      ))}
                    </div>
                  );
                }
                return <NavLink key={item.href} {...item} />;
              })}
              <div className="my-2 h-px bg-border" />
              <NavLink href="/dashboard" label="dashboard" icon={LayoutDashboard} />
            </>
          ) : (
            // Show regular navigation
            <>
              {navItems.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
              {isAdmin && (
                <>
                  <div className="my-2 h-px bg-border" />
                  <NavLink href="/admin" label="admin" icon={Shield} />
                </>
              )}
            </>
          )}
        </nav>
      </ScrollArea>

      {/* Footer - Invite + Jobs + User Menu */}
      <div className="border-t p-3">
        <div className="mb-3">
          <InviteFriendDialog collapsed={collapsed} />
        </div>
        <nav className="mb-3">
          <NavLink href="/jobs" label="jobs" icon={Briefcase} />
        </nav>
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          {user?.image ? (
            <Image
              src={user.image}
              alt={user.name || "User"}
              width={32}
              height={32}
              className="rounded-full shrink-0"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted shrink-0">
              <User className="h-4 w-4" />
            </div>
          )}
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{mounted ? user?.name : ""}</p>
              <p className="truncate text-xs text-muted-foreground">{mounted ? user?.email : ""}</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="mt-3 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href={`/${locale}/settings`}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
        {collapsed && (
          <div className="mt-3 flex flex-col gap-2">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/${locale}/settings`}>
                    <Settings className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Sign out</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </aside>
  );
}

// Mobile sidebar using Sheet
export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const locale = useLocale();
  const t = useTranslations("Navbar");
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  // Check if user is admin
  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActiveRoute = (href: string) => {
    const fullPath = `/${locale}${href}`;
    return pathname === fullPath || pathname.startsWith(`${fullPath}/`);
  };

  const isOnAdminRoute = pathname.includes('/admin');

  const handleSignOut = async () => {
    await signOut();
    router.push(`/${locale}`);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            <Link
              href={`/${locale}`}
              className="flex items-center gap-1"
              onClick={() => setOpen(false)}
            >
              <div className="relative h-8 w-8">
                <Image
                  src="/logo_transparent_bg_tiny.png"
                  alt="Oumamie Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-lg">Oumamie</span>
            </Link>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="flex flex-col gap-1">
              {isOnAdminRoute && isAdmin ? (
                // Show admin navigation
                <>
                  {adminNavItems.map((item) => {
                    if ('section' in item) {
                      return (
                        <div key={item.section}>
                          <p className="px-3 pt-4 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {t(`sections.${item.section}`)}
                          </p>
                          {item.items?.map((subItem) => {
                            const isActive = isActiveRoute(subItem.href);
                            return (
                              <Link
                                key={subItem.href}
                                href={`/${locale}${subItem.href}`}
                                onClick={() => setOpen(false)}
                                className={cn(
                                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                  "hover:bg-accent hover:text-accent-foreground",
                                  isActive
                                    ? "bg-accent text-accent-foreground"
                                    : "text-muted-foreground"
                                )}
                              >
                                <subItem.icon className="h-5 w-5" />
                                <span>{t(subItem.label)}</span>
                              </Link>
                            );
                          })}
                        </div>
                      );
                    }
                    const isActive = isActiveRoute(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={`/${locale}${item.href}`}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{t(item.label)}</span>
                      </Link>
                    );
                  })}
                  <div className="my-2 h-px bg-border" />
                  <Link
                    href={`/${locale}/dashboard`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActiveRoute("/dashboard")
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    <span>{t("dashboard")}</span>
                  </Link>
                </>
              ) : (
                // Show regular navigation
                <>
                  {navItems.map((item) => {
                    const isActive = isActiveRoute(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={`/${locale}${item.href}`}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{t(item.label)}</span>
                      </Link>
                    );
                  })}
                  {isAdmin && (
                    <>
                      <div className="my-2 h-px bg-border" />
                      <Link
                        href={`/${locale}/admin`}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          isActiveRoute("/admin")
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        <Shield className="h-5 w-5" />
                        <span>{t("admin")}</span>
                      </Link>
                    </>
                  )}
                </>
              )}
            </nav>
          </ScrollArea>

          {/* Footer - Invite + Jobs + User Menu */}
          <div className="border-t p-3">
            <div className="mb-3">
              <InviteFriendDialog />
            </div>
            <nav className="mb-3">
              <Link
                href={`/${locale}/jobs`}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActiveRoute("/jobs")
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <Briefcase className="h-5 w-5" />
                <span>{t("jobs")}</span>
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "User"}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <User className="h-4 w-4" />
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{mounted ? user?.name : ""}</p>
                <p className="truncate text-xs text-muted-foreground">{mounted ? user?.email : ""}</p>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                asChild
                onClick={() => setOpen(false)}
              >
                <Link href={`/${locale}/settings`}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
