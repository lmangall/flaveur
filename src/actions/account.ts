"use server";

import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import {
  users,
  session,
  account,
  verification,
  user_badge,
  job_alert_preferences,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { getPostHogClient } from "@/lib/posthog-server";
import { resend } from "@/lib/email/resend";

const DEV_EMAIL = "l.mangallon@gmail.com";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.oumamie.xyz";

export interface DeleteAccountResult {
  success: boolean;
  error?: "unauthorized" | "email_mismatch" | "deletion_failed";
}

/**
 * Delete the current user's account and all associated data.
 * Requires the user to confirm by typing their email.
 */
export async function deleteAccount(
  confirmEmail: string
): Promise<DeleteAccountResult> {
  const currentSession = await getSession();

  if (!currentSession?.user?.id) {
    return { success: false, error: "unauthorized" };
  }

  const userId = currentSession.user.id;
  const userEmail = currentSession.user.email;

  // Verify email confirmation matches
  if (confirmEmail.toLowerCase().trim() !== userEmail?.toLowerCase().trim()) {
    return { success: false, error: "email_mismatch" };
  }

  try {
    // Phase 1: Delete tables without FK constraints to users
    // Delete all sessions for this user
    await db.delete(session).where(eq(session.userId, userId));

    // Delete all OAuth accounts for this user
    await db.delete(account).where(eq(account.userId, userId));

    // Delete job alert preferences (no FK)
    await db
      .delete(job_alert_preferences)
      .where(eq(job_alert_preferences.user_id, userId));

    // Delete user badges (has index but no FK in current schema)
    await db.delete(user_badge).where(eq(user_badge.user_id, userId));

    // Clean up any verification tokens for this user's email
    if (userEmail) {
      await db
        .delete(verification)
        .where(eq(verification.identifier, userEmail));
    }

    // Phase 2: Delete the user - CASCADE handles the rest
    // (flavours, workspaces, profiles, learning data, shares, etc.)
    await db.delete(users).where(eq(users.id, userId));

    // Track account deletion in PostHog
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: userId,
      event: "account_deleted",
      properties: {
        user_email_domain: userEmail?.split("@")[1] || "unknown",
      },
    });
    await posthog.flush();

    // Send admin notification
    await sendAccountDeletionNotification(userId, userEmail || "unknown");

    return { success: true };
  } catch (error) {
    console.error("[deleteAccount] Failed to delete account:", error);
    return { success: false, error: "deletion_failed" };
  }
}

/**
 * Notify admin when a user deletes their account
 */
async function sendAccountDeletionNotification(userId: string, email: string) {
  try {
    await resend.emails.send({
      from: "Oumamie <hello@oumamie.xyz>",
      to: DEV_EMAIL,
      subject: `[Oumamie] Account deleted: ${email}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: sans-serif; padding: 20px;">
  <h2>Account Deletion</h2>
  <p><strong>User ID:</strong> ${userId}</p>
  <p><strong>Email:</strong> ${email}</p>
  <p><strong>Time:</strong> ${new Date().toISOString()}</p>
  <p style="color: #666;">User has requested account deletion. All data has been removed.</p>
</body>
</html>
      `,
    });
  } catch (error) {
    // Log but don't fail - deletion already succeeded
    console.error(
      "[sendAccountDeletionNotification] Failed to send notification:",
      error
    );
  }
}
