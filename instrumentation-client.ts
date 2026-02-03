import posthog from "posthog-js";

if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  // In development, use direct PostHog URL to avoid proxy issues with Turbopack
  // In production, use /ingest proxy to avoid ad blockers
  const apiHost =
    process.env.NODE_ENV === "development"
      ? process.env.NEXT_PUBLIC_POSTHOG_HOST
      : "/ingest";

  // Skip initialization if host is not configured in development
  if (process.env.NODE_ENV === "development" && !apiHost) {
    console.warn(
      "PostHog: NEXT_PUBLIC_POSTHOG_HOST not configured, skipping initialization"
    );
  } else {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: apiHost,
      ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      // Include the defaults option as required by PostHog
      defaults: "2025-11-30",
      // Enables capturing unhandled exceptions via Error Tracking
      capture_exceptions: true,
      // Turn on debug in development mode
      debug: process.env.NODE_ENV === "development",
      // Disable persistence to avoid errors when PostHog is unreachable
      disable_persistence: process.env.NODE_ENV === "development",
      // Handle initialization errors gracefully
      on_request_error: (error) => {
        if (process.env.NODE_ENV === "development") {
          console.warn("PostHog request failed:", error);
        }
      },
    });
  }
}

// IMPORTANT: Never combine this approach with other client-side PostHog initialization approaches,
// especially components like a PostHogProvider. instrumentation-client.ts is the correct solution
// for initializing client-side PostHog in Next.js 15.3+ apps.
