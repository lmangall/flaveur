"use server";

import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { user_profile } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { OnboardingStatusValue } from "@/constants/profile";
import { getPostHogClient } from "@/lib/posthog-server";

export interface OnboardingData {
  profile_type: string | null;
  bio: string | null;
  organization: string | null;
  location: string | null;
}

export interface OnboardingStatusResult {
  needsOnboarding: boolean;
  status: OnboardingStatusValue | null;
}

// Check if user needs onboarding
export async function getOnboardingStatus(): Promise<OnboardingStatusResult> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { needsOnboarding: false, status: null };
  }

  try {
    const profile = await db
      .select({ onboarding_status: user_profile.onboarding_status })
      .from(user_profile)
      .where(eq(user_profile.user_id, session.user.id));

    if (profile.length === 0) {
      // No profile = new user, needs onboarding
      return { needsOnboarding: true, status: "not_started" };
    }

    const status = profile[0].onboarding_status as OnboardingStatusValue | null;
    return {
      needsOnboarding: status === "not_started" || status === "in_progress",
      status,
    };
  } catch (error) {
    console.error("Failed to get onboarding status:", error);
    // Fail gracefully - assume no onboarding needed if we can't check
    return { needsOnboarding: false, status: null };
  }
}

// Save onboarding progress (partial save)
export async function saveOnboardingProgress(
  data: Partial<OnboardingData>
): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "unauthorized" };
  }

  const userId = session.user.id;

  // Validate bio length if provided
  if (data.bio && data.bio.length > 500) {
    return { success: false, error: "bio_too_long" };
  }

  try {
    // Check if profile exists
    const existing = await db
      .select({ user_id: user_profile.user_id })
      .from(user_profile)
      .where(eq(user_profile.user_id, userId));

    const profileData = {
      ...(data.profile_type !== undefined && { profile_type: data.profile_type }),
      ...(data.bio !== undefined && { bio: data.bio }),
      ...(data.organization !== undefined && { organization: data.organization }),
      ...(data.location !== undefined && { location: data.location }),
      onboarding_status: "in_progress" as const,
    };

    if (existing.length === 0) {
      // Insert new profile
      await db.insert(user_profile).values({
        user_id: userId,
        ...profileData,
      });
    } else {
      // Update existing profile
      await db
        .update(user_profile)
        .set(profileData)
        .where(eq(user_profile.user_id, userId));
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to save onboarding progress:", error);
    return { success: false, error: "save_failed" };
  }
}

// Complete onboarding
export async function completeOnboarding(data: OnboardingData): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "unauthorized" };
  }

  const userId = session.user.id;

  // Validate bio length if provided
  if (data.bio && data.bio.length > 500) {
    return { success: false, error: "bio_too_long" };
  }

  try {
    // Check if profile exists
    const existing = await db
      .select({ user_id: user_profile.user_id })
      .from(user_profile)
      .where(eq(user_profile.user_id, userId));

    const profileData = {
      profile_type: data.profile_type,
      bio: data.bio,
      organization: data.organization,
      location: data.location,
      onboarding_status: "completed" as const,
    };

    if (existing.length === 0) {
      // Insert new profile
      await db.insert(user_profile).values({
        user_id: userId,
        ...profileData,
      });
    } else {
      // Update existing profile
      await db
        .update(user_profile)
        .set(profileData)
        .where(eq(user_profile.user_id, userId));
    }

    // Track onboarding completion in PostHog
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: userId,
      event: "onboarding_completed",
      properties: {
        profile_type: data.profile_type,
        has_bio: !!data.bio,
        has_organization: !!data.organization,
        has_location: !!data.location,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to complete onboarding:", error);
    return { success: false, error: "complete_failed" };
  }
}

// Skip onboarding
export async function skipOnboarding(): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "unauthorized" };
  }

  const userId = session.user.id;

  try {
    // Check if profile exists
    const existing = await db
      .select({ user_id: user_profile.user_id })
      .from(user_profile)
      .where(eq(user_profile.user_id, userId));

    if (existing.length === 0) {
      // Insert new profile with skipped status
      await db.insert(user_profile).values({
        user_id: userId,
        onboarding_status: "skipped",
      });
    } else {
      // Update existing profile
      await db
        .update(user_profile)
        .set({ onboarding_status: "skipped" })
        .where(eq(user_profile.user_id, userId));
    }

    // Track onboarding skip in PostHog
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: userId,
      event: "onboarding_skipped",
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to skip onboarding:", error);
    return { success: false, error: "skip_failed" };
  }
}
