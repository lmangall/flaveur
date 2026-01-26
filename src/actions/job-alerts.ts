"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { job_alert_preferences } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { jobAlertPreferencesSchema, type JobAlertPreferencesInput } from "@/lib/validations/job-alerts";

export interface JobAlertPreferences {
  id: number;
  userId: string;
  email: string;
  locations: string[];
  employmentTypes: string[];
  experienceLevels: string[];
  keywords: string[];
  isActive: boolean;
  frequency: "instant" | "daily" | "weekly";
  lastNotifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getJobAlertPreferences(): Promise<JobAlertPreferences | null> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const result = await db
    .select()
    .from(job_alert_preferences)
    .where(eq(job_alert_preferences.user_id, userId));

  if (result.length === 0) {
    return null;
  }

  const row = result[0];
  return {
    id: row.id,
    userId: row.user_id,
    email: row.email,
    locations: row.locations || [],
    employmentTypes: row.employment_types || [],
    experienceLevels: row.experience_levels || [],
    keywords: row.keywords || [],
    isActive: row.is_active ?? true,
    frequency: (row.frequency as "instant" | "daily" | "weekly") || "daily",
    lastNotifiedAt: row.last_notified_at,
    createdAt: row.created_at!,
    updatedAt: row.updated_at!,
  };
}

export async function saveJobAlertPreferences(input: JobAlertPreferencesInput) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return { success: false, error: "unauthorized" };
  }

  const email = user.primaryEmailAddress?.emailAddress;
  if (!email) {
    return { success: false, error: "no_email" };
  }

  const validation = jobAlertPreferencesSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: "invalid_input" };
  }

  const { locations, employmentTypes, experienceLevels, keywords, frequency, isActive } = validation.data;

  const result = await db.execute(sql`
    INSERT INTO job_alert_preferences (
      user_id, email, locations, employment_types, experience_levels,
      keywords, frequency, is_active
    )
    VALUES (
      ${userId}, ${email}, ${locations}, ${employmentTypes}, ${experienceLevels},
      ${keywords}, ${frequency}, ${isActive}
    )
    ON CONFLICT (user_id) DO UPDATE SET
      email = EXCLUDED.email,
      locations = EXCLUDED.locations,
      employment_types = EXCLUDED.employment_types,
      experience_levels = EXCLUDED.experience_levels,
      keywords = EXCLUDED.keywords,
      frequency = EXCLUDED.frequency,
      is_active = EXCLUDED.is_active,
      updated_at = NOW()
    RETURNING id
  `);

  return { success: true, id: (result.rows[0] as { id: number }).id };
}

export async function toggleJobAlerts(isActive: boolean) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "unauthorized" };
  }

  const result = await db
    .update(job_alert_preferences)
    .set({ is_active: isActive, updated_at: new Date().toISOString() })
    .where(eq(job_alert_preferences.user_id, userId))
    .returning({ id: job_alert_preferences.id });

  if (result.length === 0) {
    return { success: false, error: "not_found" };
  }

  return { success: true };
}

export async function deleteJobAlertPreferences() {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "unauthorized" };
  }

  await db
    .delete(job_alert_preferences)
    .where(eq(job_alert_preferences.user_id, userId));

  return { success: true };
}
