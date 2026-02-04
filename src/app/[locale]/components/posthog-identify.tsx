"use client";

import { useEffect, useRef } from "react";
import posthog from "posthog-js";
import { useSession } from "@/lib/auth-client";

/**
 * Identifies users with PostHog when they're logged in.
 * This enables:
 * - Seeing user names and emails in the Persons view
 * - Filtering events by email or name
 * - Creating cohorts based on user properties
 * - Filtering out internal users by email domain
 */
export function PostHogIdentify() {
  const { data: session } = useSession();
  const lastIdentifiedUserId = useRef<string | null>(null);

  useEffect(() => {
    const user = session?.user;

    // User is logged in - identify them
    if (user?.id) {
      // Avoid redundant identify calls for the same user
      if (lastIdentifiedUserId.current === user.id) return;

      posthog.identify(user.id, {
        email: user.email ?? undefined,
        name: user.name ?? undefined,
      });

      lastIdentifiedUserId.current = user.id;
    } else if (lastIdentifiedUserId.current) {
      // User logged out - reset to unlink future events
      posthog.reset();
      lastIdentifiedUserId.current = null;
    }
  }, [session?.user]);

  return null;
}
