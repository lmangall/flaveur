import { createAuthClient } from "better-auth/react";
import { useMemo } from "react";
import { DEMO_USERS } from "@/constants/samples";

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
export const { signIn, signUp, signOut, getSession } = authClient;

// Re-export useSession with dev impersonation support
const { useSession: useSessionOriginal } = authClient;

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

export function useSession() {
  const originalSession = useSessionOriginal();

  return useMemo(() => {
    // Only check impersonation in development
    if (process.env.NODE_ENV !== "development") {
      return originalSession;
    }

    const impersonateUserId = getCookie("dev_impersonate");
    if (!impersonateUserId) {
      return originalSession;
    }

    // Find the demo user details
    const demoUser = DEMO_USERS.find((u) => u.user_id === impersonateUserId);

    // Return impersonated session
    return {
      ...originalSession,
      data: {
        user: {
          id: impersonateUserId,
          email: demoUser?.email ?? `${impersonateUserId}@impersonated.dev`,
          name: demoUser?.username ?? `Impersonated: ${impersonateUserId}`,
          image: null,
        },
        session: { id: "dev-impersonate-session" },
      },
    };
  }, [originalSession]);
}
