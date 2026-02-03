"use server";

import { db } from "@/lib/db";
import { users, referral } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { sendNewUserNotification } from "@/lib/email/resend";

export async function getUsers() {
  return await db.select().from(users);
}

export async function createUser(data: { email: string; username?: string }) {
  const result = await db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      email: data.email,
      name: data.username ?? data.email.split("@")[0],
    })
    .returning();
  return result[0];
}

/**
 * Notify admin when a new user signs up.
 * Looks up referral info if a referral code is provided.
 */
export async function notifyNewUserSignup(data: {
  userId: string;
  email: string;
  name: string;
  signupMethod: "email" | "google";
  referralCode?: string;
}) {
  const { userId, email, name, signupMethod, referralCode } = data;

  let referrerName: string | null = null;
  let referrerEmail: string | null = null;

  // If there's a referral code, look up the referrer
  if (referralCode) {
    const referralResult = await db
      .select({
        referrer_id: referral.referrer_id,
        referrer_name: users.name,
        referrer_email: users.email,
      })
      .from(referral)
      .innerJoin(users, eq(referral.referrer_id, users.id))
      .where(eq(referral.referral_code, referralCode))
      .limit(1);

    if (referralResult.length > 0) {
      referrerName = referralResult[0].referrer_name;
      referrerEmail = referralResult[0].referrer_email;
    }
  }

  try {
    await sendNewUserNotification({
      userId,
      email,
      name,
      signupMethod,
      referrerName,
      referrerEmail,
      referralCode: referralCode || null,
    });
  } catch (error) {
    // Log but don't throw - we don't want to fail signup if email fails
    console.error("[notifyNewUserSignup] Failed to send notification:", error);
  }
}
