"use server";

import { getUserId } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { referral, users } from "@/db/schema";
import { eq, and, sql, isNull } from "drizzle-orm";
import { getPostHogClient } from "@/lib/posthog-server";
import { nanoid } from "nanoid";

export type ReferralPlatform = "email" | "whatsapp" | "facebook";

export interface ReferralInfo {
  id: number;
  referral_code: string;
  platform: string;
  created_at: string;
  converted_at: string | null;
  referred_user: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

export interface ReferralStats {
  total_referrals: number;
  total_conversions: number;
  pending_referrals: number;
}

/**
 * Create a new referral and return the share URL
 */
export async function createReferral(platform: ReferralPlatform): Promise<{
  referralCode: string;
  shareUrl: string;
  userName: string;
}> {
  const userId = await getUserId();

  // Get user info for personalized message
  const userResult = await db
    .select({ name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, userId));

  if (userResult.length === 0) {
    throw new Error("User not found");
  }

  const userName = userResult[0].name || userResult[0].email || "A friend";

  // Generate unique referral code
  const referralCode = nanoid(10);

  // Store the referral
  await db.insert(referral).values({
    referrer_id: userId,
    referral_code: referralCode,
    platform,
  });

  // Build share URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://oumamie.com";
  const shareUrl = `${baseUrl}?ref=${referralCode}`;

  // Track referral creation in PostHog
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: userId,
    event: "referral_created",
    properties: {
      platform,
      referral_code: referralCode,
    },
  });

  return {
    referralCode,
    shareUrl,
    userName,
  };
}

/**
 * Track when a referred user signs up
 */
export async function trackReferralConversion(
  referralCode: string,
  newUserId: string
): Promise<{ success: boolean; referrerId: string | null }> {
  // Find the referral
  const referralResult = await db
    .select()
    .from(referral)
    .where(
      and(
        eq(referral.referral_code, referralCode),
        isNull(referral.referred_user_id)
      )
    );

  if (referralResult.length === 0) {
    // Referral not found or already converted
    return { success: false, referrerId: null };
  }

  const ref = referralResult[0];

  // Don't let users refer themselves
  if (ref.referrer_id === newUserId) {
    return { success: false, referrerId: null };
  }

  // Update the referral with conversion
  await db
    .update(referral)
    .set({
      referred_user_id: newUserId,
      converted_at: new Date().toISOString(),
    })
    .where(eq(referral.id, ref.id));

  // Track conversion in PostHog
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: newUserId,
    event: "referral_converted",
    properties: {
      referral_code: referralCode,
      referrer_id: ref.referrer_id,
      platform: ref.platform,
    },
  });

  // Also track for the referrer
  posthog.capture({
    distinctId: ref.referrer_id,
    event: "referral_successful",
    properties: {
      referral_code: referralCode,
      referred_user_id: newUserId,
      platform: ref.platform,
    },
  });

  return { success: true, referrerId: ref.referrer_id };
}

/**
 * Get referral statistics for the current user
 */
export async function getUserReferralStats(): Promise<ReferralStats> {
  const userId = await getUserId();

  const result = await db.execute(sql`
    SELECT
      COUNT(*) as total_referrals,
      COUNT(referred_user_id) as total_conversions,
      COUNT(*) FILTER (WHERE referred_user_id IS NULL) as pending_referrals
    FROM referral
    WHERE referrer_id = ${userId}
  `);

  const stats = result.rows[0] as Record<string, unknown>;

  return {
    total_referrals: Number(stats.total_referrals) || 0,
    total_conversions: Number(stats.total_conversions) || 0,
    pending_referrals: Number(stats.pending_referrals) || 0,
  };
}

/**
 * Get all referrals for the current user
 */
export async function getUserReferrals(): Promise<ReferralInfo[]> {
  const userId = await getUserId();

  const result = await db.execute(sql`
    SELECT
      r.id,
      r.referral_code,
      r.platform,
      r.created_at,
      r.converted_at,
      r.referred_user_id,
      u.username as referred_username,
      u.email as referred_email
    FROM referral r
    LEFT JOIN users u ON r.referred_user_id = u.user_id
    WHERE r.referrer_id = ${userId}
    ORDER BY r.created_at DESC
    LIMIT 50
  `);

  return (result.rows as Record<string, unknown>[]).map((r) => ({
    id: Number(r.id),
    referral_code: String(r.referral_code),
    platform: String(r.platform),
    created_at: String(r.created_at),
    converted_at: r.converted_at ? String(r.converted_at) : null,
    referred_user: r.referred_user_id
      ? {
          id: String(r.referred_user_id),
          name: r.referred_username ? String(r.referred_username) : null,
          email: r.referred_email ? String(r.referred_email) : null,
        }
      : null,
  }));
}

/**
 * Validate a referral code (used during signup)
 */
export async function validateReferralCode(
  referralCode: string
): Promise<{ valid: boolean; referrerName: string | null }> {
  const result = await db.execute(sql`
    SELECT r.referrer_id, u.username, u.email
    FROM referral r
    JOIN users u ON r.referrer_id = u.user_id
    WHERE r.referral_code = ${referralCode}
      AND r.referred_user_id IS NULL
    LIMIT 1
  `);

  if (result.rows.length === 0) {
    return { valid: false, referrerName: null };
  }

  const ref = result.rows[0] as Record<string, unknown>;
  const referrerName = String(ref.username || ref.email || "A friend");

  return { valid: true, referrerName };
}
