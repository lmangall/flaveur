import { getSession } from "./auth-server";

// Admin emails - in production, use a database table
const ADMIN_EMAILS = [
  "l.mangallon@gmail.com",
  // Add more admin emails as needed
];

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  if (!session?.user) return false;

  const email = session.user.email;
  if (!email) return false;

  return ADMIN_EMAILS.includes(email);
}

export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("Unauthorized: Admin access required");
  }
}
