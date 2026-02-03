"use client";

import { useState, useEffect } from "react";
import { AppSidebar, MobileSidebar } from "@/components/layout/app-sidebar";
import { BreadcrumbProvider, ConnectedBreadcrumbs } from "@/components/layout/Breadcrumbs";
import { SupportChatWidget } from "@/app/[locale]/components/support/SupportChatWidget";
import { cn } from "@/app/lib/utils";
import { useSession } from "@/lib/auth-client";
import posthog from "posthog-js";

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  // Identify user in PostHog when session is available
  useEffect(() => {
    if (session?.user) {
      posthog.identify(session.user.id, {
        email: session.user.email,
        name: session.user.name,
      });
    }
  }, [session?.user]);

  // Persist sidebar state in localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setCollapsed(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  return (
    <BreadcrumbProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex">
          <AppSidebar collapsed={collapsed} onCollapsedChange={setCollapsed} />
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile Header */}
          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
            <MobileSidebar />
            <ConnectedBreadcrumbs className="flex-1" />
          </header>

          {/* Desktop Breadcrumb Bar */}
          <div className="hidden md:flex h-10 items-center border-b bg-muted/30 px-6">
            <ConnectedBreadcrumbs />
          </div>

          {/* Page Content */}
          <main
            className={cn(
              "flex-1 overflow-y-auto",
              "bg-muted/10"
            )}
          >
            {children}
          </main>
        </div>

        {/* Support Chat Widget */}
        <SupportChatWidget />
      </div>
    </BreadcrumbProvider>
  );
}
