"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

// Static route labels for known segments
const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  formulas: "Formulas",
  workspaces: "Workspaces",
  substances: "Substances",
  learn: "Learn",
  molecules: "Molecules",
  calculator: "Calculator",
  settings: "Settings",
  categories: "Categories",
  contribute: "Contribute",
  compare: "Compare",
  edit: "Edit",
  new: "New",
  import: "Import",
  compliance: "Compliance",
  queue: "Queue",
  documents: "Documents",
  submit: "Submit",
  invite: "Invite",
  ingredients: "Ingredients",
  faq: "FAQ",
};

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrentPage: boolean;
}

interface BreadcrumbsProps {
  // Optional dynamic labels for segments that have IDs
  // e.g., { "123": "Vanilla Extract" } for /formulas/123
  dynamicLabels?: Record<string, string>;
  className?: string;
}

export function Breadcrumbs({ dynamicLabels = {}, className }: BreadcrumbsProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("Navbar");

  // Remove locale prefix from pathname
  const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";

  // Skip breadcrumbs for root dashboard
  if (pathWithoutLocale === "/dashboard" || pathWithoutLocale === "/") {
    return null;
  }

  // Split path into segments and filter empty strings
  const segments = pathWithoutLocale.split("/").filter(Boolean);

  // Build breadcrumb items
  const breadcrumbs: BreadcrumbItem[] = segments.map((segment, index) => {
    const href = `/${locale}/${segments.slice(0, index + 1).join("/")}`;
    const isCurrentPage = index === segments.length - 1;

    // Check for dynamic label first (for IDs)
    if (dynamicLabels[segment]) {
      // Dynamic labels (like formula names) should not be translated
      return { label: dynamicLabels[segment], href, isCurrentPage };
    }

    // Check for known route label and translate it
    if (ROUTE_LABELS[segment]) {
      const translationKey = segment.toLowerCase();
      try {
        const translatedLabel = t(translationKey);
        // Only use translation if it doesn't start with "Navbar." (missing key indicator)
        if (!translatedLabel.startsWith("Navbar.")) {
          return { label: translatedLabel, href, isCurrentPage };
        }
      } catch {
        // Translation not found, use static label
      }
      return { label: ROUTE_LABELS[segment], href, isCurrentPage };
    }

    // If no label found, check if it's a number (likely an ID) and use a placeholder
    if (/^\d+$/.test(segment)) {
      return { label: `#${segment}`, href, isCurrentPage };
    }

    // Format the segment (capitalize, replace dashes with spaces)
    const label = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return { label, href, isCurrentPage };
  });

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-sm text-muted-foreground", className)}
    >
      <ol className="flex items-center gap-1">
        {/* Home/Dashboard link */}
        <li>
          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Dashboard</span>
          </Link>
        </li>

        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.href} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4" />
            {breadcrumb.isCurrentPage ? (
              <span
                className="font-medium text-foreground"
                aria-current="page"
              >
                {breadcrumb.label}
              </span>
            ) : (
              <Link
                href={breadcrumb.href}
                className="hover:text-foreground transition-colors"
              >
                {breadcrumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Context provider for dynamic breadcrumb labels
// This allows child pages to set labels for their IDs
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

interface BreadcrumbContextValue {
  labels: Record<string, string>;
  setLabel: (segment: string, label: string) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [labels, setLabels] = useState<Record<string, string>>({});

  const setLabel = useCallback((segment: string, label: string) => {
    setLabels((prev) => ({ ...prev, [segment]: label }));
  }, []);

  return (
    <BreadcrumbContext.Provider value={{ labels, setLabel }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbLabel() {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error("useBreadcrumbLabel must be used within a BreadcrumbProvider");
  }
  return context;
}

// Hook to set breadcrumb label from a page component
export function useSetBreadcrumbLabel(segment: string, label: string | undefined) {
  const { setLabel } = useBreadcrumbLabel();

  useEffect(() => {
    if (label) {
      setLabel(segment, label);
    }
  }, [segment, label, setLabel]);
}

// Connected breadcrumbs that use the context
export function ConnectedBreadcrumbs({ className }: { className?: string }) {
  const context = useContext(BreadcrumbContext);
  return <Breadcrumbs dynamicLabels={context?.labels || {}} className={className} />;
}
