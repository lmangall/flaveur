import { headers, cookies } from "next/headers";
import { auth } from "./auth";

/**
 * Get the current session in server components and server actions.
 * Returns null if not authenticated.
 * In development, checks for dev_impersonate cookie to allow impersonation.
 */
export async function getSession() {
  // Dev-only impersonation
  if (process.env.NODE_ENV === "development") {
    const cookieStore = await cookies();
    const impersonateUserId = cookieStore.get("dev_impersonate")?.value;
    if (impersonateUserId) {
      // Return a fake session for the impersonated user
      return {
        user: {
          id: impersonateUserId,
          email: `${impersonateUserId}@impersonated.dev`,
          name: `Impersonated: ${impersonateUserId}`,
        },
        session: { id: "dev-impersonate-session" },
      };
    }
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

/**
 * Get the current user ID. Throws if not authenticated.
 */
export async function getUserId(): Promise<string> {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

/**
 * Get the current user. Throws if not authenticated.
 */
export async function getUser() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}
