"use server";

import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { user_profile, user_social_link, users } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

export type UserProfile = InferSelectModel<typeof user_profile>;
export type NewUserProfile = InferInsertModel<typeof user_profile>;
export type UserSocialLink = InferSelectModel<typeof user_social_link>;

export interface ProfileWithLinks extends UserProfile {
  social_links: UserSocialLink[];
  username?: string;
  image?: string | null;
}

export interface ProfileFormData {
  bio?: string | null;
  profile_type?: string | null;
  organization?: string | null;
  job_title?: string | null;
  location?: string | null;
  years_of_experience?: string | null;
  specializations?: string[] | null;
  certifications?: string[] | null;
  field_of_study?: string | null;
  professional_memberships?: string[] | null;
  is_profile_public?: boolean;
  open_to_opportunities?: boolean;
}

export interface SocialLinkFormData {
  platform: string;
  url: string;
}

// Get current user's profile
export async function getMyProfile(): Promise<ProfileWithLinks | null> {
  const session = await getSession();
  if (!session?.user?.id) {
    return null;
  }

  return getUserProfile(session.user.id);
}

// Get a user's profile (for viewing others or own)
export async function getUserProfile(
  userId: string
): Promise<ProfileWithLinks | null> {
  const session = await getSession();
  const isOwnProfile = session?.user?.id === userId;

  // Get user basic info
  const userResult = await db
    .select({
      id: users.id,
      name: users.name,
      image: users.image,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (userResult.length === 0) {
    return null;
  }

  const user = userResult[0];

  // Get profile
  const profileResult = await db
    .select()
    .from(user_profile)
    .where(eq(user_profile.user_id, userId));

  // If not own profile and profile is private, return null
  if (
    !isOwnProfile &&
    profileResult.length > 0 &&
    !profileResult[0].is_profile_public
  ) {
    return null;
  }

  // Get social links
  const socialLinks = await db
    .select()
    .from(user_social_link)
    .where(eq(user_social_link.user_id, userId))
    .orderBy(asc(user_social_link.display_order));

  // If no profile exists, return a default one
  if (profileResult.length === 0) {
    return {
      user_id: userId,
      bio: null,
      profile_type: null,
      organization: null,
      job_title: null,
      location: null,
      years_of_experience: null,
      specializations: null,
      certifications: null,
      field_of_study: null,
      professional_memberships: null,
      is_profile_public: true,
      open_to_opportunities: false,
      onboarding_status: null,
      updated_at: null,
      social_links: socialLinks,
      username: user.name,
      image: user.image,
    };
  }

  return {
    ...profileResult[0],
    social_links: socialLinks,
    username: user.name,
    image: user.image,
  };
}

// Update current user's profile
export async function updateUserProfile(data: ProfileFormData): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "unauthorized" };
  }

  const userId = session.user.id;

  // Validate bio length
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
      bio: data.bio,
      profile_type: data.profile_type,
      organization: data.organization,
      job_title: data.job_title,
      location: data.location,
      years_of_experience: data.years_of_experience,
      specializations: data.specializations,
      certifications: data.certifications,
      field_of_study: data.field_of_study,
      professional_memberships: data.professional_memberships,
      is_profile_public: data.is_profile_public ?? true,
      open_to_opportunities: data.open_to_opportunities ?? false,
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
    console.error("Failed to update profile:", error);
    return { success: false, error: "update_failed" };
  }
}

// Add a social link
export async function addSocialLink(data: SocialLinkFormData): Promise<{
  success: boolean;
  link?: UserSocialLink;
  error?: string;
}> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "unauthorized" };
  }

  const userId = session.user.id;

  // Validate URL
  try {
    new URL(data.url);
  } catch {
    return { success: false, error: "invalid_url" };
  }

  try {
    // Get current max display_order
    const existing = await db
      .select({ display_order: user_social_link.display_order })
      .from(user_social_link)
      .where(eq(user_social_link.user_id, userId))
      .orderBy(asc(user_social_link.display_order));

    const maxOrder =
      existing.length > 0
        ? Math.max(...existing.map((e) => e.display_order ?? 0))
        : -1;

    const result = await db
      .insert(user_social_link)
      .values({
        user_id: userId,
        platform: data.platform,
        url: data.url,
        display_order: maxOrder + 1,
      })
      .returning();

    return { success: true, link: result[0] };
  } catch (error) {
    console.error("Failed to add social link:", error);
    return { success: false, error: "add_failed" };
  }
}

// Update a social link
export async function updateSocialLink(
  linkId: number,
  data: SocialLinkFormData
): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "unauthorized" };
  }

  const userId = session.user.id;

  // Validate URL
  try {
    new URL(data.url);
  } catch {
    return { success: false, error: "invalid_url" };
  }

  try {
    // Verify ownership
    const existing = await db
      .select()
      .from(user_social_link)
      .where(
        and(
          eq(user_social_link.id, linkId),
          eq(user_social_link.user_id, userId)
        )
      );

    if (existing.length === 0) {
      return { success: false, error: "not_found" };
    }

    await db
      .update(user_social_link)
      .set({
        platform: data.platform,
        url: data.url,
      })
      .where(eq(user_social_link.id, linkId));

    return { success: true };
  } catch (error) {
    console.error("Failed to update social link:", error);
    return { success: false, error: "update_failed" };
  }
}

// Remove a social link
export async function removeSocialLink(linkId: number): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "unauthorized" };
  }

  const userId = session.user.id;

  try {
    // Verify ownership
    const existing = await db
      .select()
      .from(user_social_link)
      .where(
        and(
          eq(user_social_link.id, linkId),
          eq(user_social_link.user_id, userId)
        )
      );

    if (existing.length === 0) {
      return { success: false, error: "not_found" };
    }

    await db.delete(user_social_link).where(eq(user_social_link.id, linkId));

    return { success: true };
  } catch (error) {
    console.error("Failed to remove social link:", error);
    return { success: false, error: "remove_failed" };
  }
}

// Reorder social links
export async function reorderSocialLinks(linkIds: number[]): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "unauthorized" };
  }

  const userId = session.user.id;

  try {
    // Update each link's display_order
    for (let i = 0; i < linkIds.length; i++) {
      await db
        .update(user_social_link)
        .set({ display_order: i })
        .where(
          and(
            eq(user_social_link.id, linkIds[i]),
            eq(user_social_link.user_id, userId)
          )
        );
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to reorder social links:", error);
    return { success: false, error: "reorder_failed" };
  }
}

// Get public profiles for community page
export async function getPublicProfiles(filters?: {
  profile_type?: string;
  location?: string;
  open_to_opportunities?: boolean;
}): Promise<ProfileWithLinks[]> {
  let query = db
    .select({
      profile: user_profile,
      user: {
        id: users.id,
        name: users.name,
        image: users.image,
      },
    })
    .from(user_profile)
    .innerJoin(users, eq(user_profile.user_id, users.id))
    .where(eq(user_profile.is_profile_public, true));

  const results = await query;

  // Filter in memory for now (can be optimized with dynamic where clauses later)
  let filtered = results;
  if (filters?.profile_type) {
    filtered = filtered.filter(
      (r) => r.profile.profile_type === filters.profile_type
    );
  }
  if (filters?.location) {
    filtered = filtered.filter((r) =>
      r.profile.location?.toLowerCase().includes(filters.location!.toLowerCase())
    );
  }
  if (filters?.open_to_opportunities !== undefined) {
    filtered = filtered.filter(
      (r) => r.profile.open_to_opportunities === filters.open_to_opportunities
    );
  }

  // Get social links for each profile
  const profilesWithLinks: ProfileWithLinks[] = await Promise.all(
    filtered.map(async (r) => {
      const socialLinks = await db
        .select()
        .from(user_social_link)
        .where(eq(user_social_link.user_id, r.profile.user_id))
        .orderBy(asc(user_social_link.display_order));

      return {
        ...r.profile,
        social_links: socialLinks,
        username: r.user.name,
        image: r.user.image,
      };
    })
  );

  return profilesWithLinks;
}
