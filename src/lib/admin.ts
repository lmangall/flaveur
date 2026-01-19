import { auth, currentUser } from "@clerk/nextjs/server";

// Admin emails - in production, use Clerk metadata or a database table
const ADMIN_EMAILS = [
  "l.mangallon@gmail.com",
  // Add more admin emails as needed
];

export async function isAdmin(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const user = await currentUser();
  if (!user) return false;

  const email = user.primaryEmailAddress?.emailAddress;
  if (!email) return false;

  // Check if user's email is in the admin list
  // In production, you could also check Clerk publicMetadata:
  // return user.publicMetadata?.role === 'admin';
  return ADMIN_EMAILS.includes(email);
}

export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("Unauthorized: Admin access required");
  }
}
