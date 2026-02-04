"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import posthog from "posthog-js";

/**
 * Tracks pageviews on SPA-style route changes for Next.js App Router.
 * Initial pageview is captured automatically by PostHog (capture_pageview: true).
 * This component only handles subsequent client-side navigations.
 */
export function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedUrl = useRef<string | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (!pathname) return;

    // Build the full URL for tracking
    const url = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    // Skip initial mount - PostHog captures this automatically
    if (isInitialMount.current) {
      isInitialMount.current = false;
      lastTrackedUrl.current = url;
      return;
    }

    // Avoid duplicate pageviews for the same URL
    if (url === lastTrackedUrl.current) return;
    lastTrackedUrl.current = url;

    // Capture the pageview for SPA navigation
    posthog.capture("$pageview", {
      $current_url: window.location.href,
    });
  }, [pathname, searchParams]);

  return null;
}
