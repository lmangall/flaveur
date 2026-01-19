"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
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

  const result = await sql`
    SELECT
      id,
      user_id as "userId",
      email,
      locations,
      employment_types as "employmentTypes",
      experience_levels as "experienceLevels",
      keywords,
      is_active as "isActive",
      frequency,
      last_notified_at as "lastNotifiedAt",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM job_alert_preferences
    WHERE user_id = ${userId}
  `;

  if (result.length === 0) {
    return null;
  }

  return result[0] as JobAlertPreferences;
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

  // Validate input
  const validation = jobAlertPreferencesSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: "invalid_input" };
  }

  const { locations, employmentTypes, experienceLevels, keywords, frequency, isActive } = validation.data;

  // Upsert the preferences
  const result = await sql`
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
  `;

  return { success: true, id: result[0].id };
}

export async function toggleJobAlerts(isActive: boolean) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "unauthorized" };
  }

  const result = await sql`
    UPDATE job_alert_preferences
    SET is_active = ${isActive}, updated_at = NOW()
    WHERE user_id = ${userId}
    RETURNING id
  `;

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

  await sql`
    DELETE FROM job_alert_preferences
    WHERE user_id = ${userId}
  `;

  return { success: true };
}
