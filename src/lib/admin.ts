import { getSession } from "./auth-server";
import { DEMO_USERS } from "@/constants/samples";

// Admin emails - in production, use a database table
const ADMIN_EMAILS = [
  "l.mangallon@gmail.com",
  ...DEMO_USERS.map((u) => u.email),
];

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  if (!session?.user) return false;

  const email = session.user.email;
  if (email && ADMIN_EMAILS.includes(email)) return true;

  // Also check user ID for dev impersonation
  const userId = session.user.id;
  if (userId && DEMO_USERS.some((u) => u.user_id === userId)) return true;

  return false;
}

export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("Unauthorized: Admin access required");
  }
}
