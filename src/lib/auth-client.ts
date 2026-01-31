import { createAuthClient } from "better-auth/react";

// Get base URL for client - uses current origin if env var is localhost/empty
function getClientBaseURL() {
  const envUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
  // If env var is set and not localhost, use it
  if (envUrl && !envUrl.includes("localhost")) {
    return envUrl;
  }
  // In browser, use current origin (handles production correctly)
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  // SSR fallback - empty string means better-auth uses request origin
  return "";
}

export const authClient = createAuthClient({
  baseURL: getClientBaseURL(),
  fetchOptions: {
    credentials: "include",
  },
});

// Export commonly used hooks and methods
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
