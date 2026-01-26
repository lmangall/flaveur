import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { job_alert_preferences } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { sendJobAlertEmail, type JobAlertJob } from "@/lib/email/resend";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://oumamie.xyz";

const CRON_SECRET = process.env.CRON_SECRET;

interface JobAlertPreference {
  id: number;
  userId: string;
  email: string;
  locations: string[];
  employmentTypes: string[];
  experienceLevels: string[];
  keywords: string[];
  frequency: "instant" | "daily" | "weekly";
  lastNotifiedAt: string | null;
}

export async function GET(request: Request) {
  if (CRON_SECRET) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await processJobAlerts();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing job alerts:", error);
    return NextResponse.json(
      { error: "Failed to process job alerts" },
      { status: 500 }
    );
  }
}

async function processJobAlerts() {
  const result = await db.execute(sql`
    SELECT
      id,
      user_id as "userId",
      email,
      locations,
      employment_types as "employmentTypes",
      experience_levels as "experienceLevels",
      keywords,
      frequency,
      last_notified_at as "lastNotifiedAt"
    FROM job_alert_preferences
    WHERE is_active = true
  `);

  const preferences = (result.rows as Record<string, unknown>[]).map((row) => ({
    id: Number(row.id),
    userId: String(row.userId),
    email: String(row.email),
    locations: (row.locations as string[]) || [],
    employmentTypes: (row.employmentTypes as string[]) || [],
    experienceLevels: (row.experienceLevels as string[]) || [],
    keywords: (row.keywords as string[]) || [],
    frequency: row.frequency as "instant" | "daily" | "weekly",
    lastNotifiedAt: row.lastNotifiedAt ? String(row.lastNotifiedAt) : null,
  })) satisfies JobAlertPreference[];

  let emailsSent = 0;
  let usersProcessed = 0;

  for (const pref of preferences) {
    if (!shouldSendAlert(pref.frequency, pref.lastNotifiedAt)) {
      continue;
    }

    const matchingJobs = await findMatchingJobs(pref);

    if (matchingJobs.length === 0) {
      continue;
    }

    const locale = "en";
    const unsubscribeUrl = `${BASE_URL}/${locale}/settings`;

    try {
      await sendJobAlertEmail(pref.email, matchingJobs, locale, unsubscribeUrl);

      await db
        .update(job_alert_preferences)
        .set({ last_notified_at: new Date().toISOString() })
        .where(eq(job_alert_preferences.id, pref.id));

      emailsSent++;
    } catch (error) {
      console.error(`Failed to send job alert to ${pref.email}:`, error);
    }

    usersProcessed++;
  }

  return {
    success: true,
    usersProcessed,
    emailsSent,
    timestamp: new Date().toISOString(),
  };
}

function shouldSendAlert(
  frequency: "instant" | "daily" | "weekly",
  lastNotifiedAt: string | null
): boolean {
  if (!lastNotifiedAt) {
    return true;
  }

  const lastNotified = new Date(lastNotifiedAt);
  const now = new Date();
  const hoursSinceLastNotified =
    (now.getTime() - lastNotified.getTime()) / (1000 * 60 * 60);

  switch (frequency) {
    case "instant":
      return true;
    case "daily":
      return hoursSinceLastNotified >= 24;
    case "weekly":
      return hoursSinceLastNotified >= 168;
    default:
      return false;
  }
}

async function findMatchingJobs(
  pref: Pick<JobAlertPreference, "locations" | "employmentTypes" | "experienceLevels" | "keywords" | "lastNotifiedAt">
): Promise<JobAlertJob[]> {
  const sinceDate = pref.lastNotifiedAt
    ? new Date(pref.lastNotifiedAt)
    : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const result = await db.execute(sql`
    SELECT
      id,
      title,
      company_name as company,
      location,
      employment_type as "employmentType",
      experience_level as "experienceLevel",
      description
    FROM job_offers
    WHERE created_at > ${sinceDate.toISOString()}
      AND status = true
    ORDER BY created_at DESC
    LIMIT 50
  `);

  const jobs = (result.rows as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    title: String(row.title),
    company: String(row.company ?? ""),
    location: String(row.location ?? ""),
    employmentType: String(row.employmentType ?? ""),
    experienceLevel: String(row.experienceLevel ?? ""),
    description: String(row.description ?? ""),
  }));

  const filteredJobs = jobs.filter((job) => {
    if (pref.locations && pref.locations.length > 0) {
      const jobLocation = (job.location || "").toLowerCase();
      const matchesLocation = pref.locations.some((loc) =>
        jobLocation.includes(loc.toLowerCase())
      );
      if (!matchesLocation) return false;
    }

    if (pref.employmentTypes && pref.employmentTypes.length > 0) {
      if (!pref.employmentTypes.includes(job.employmentType)) {
        return false;
      }
    }

    if (pref.experienceLevels && pref.experienceLevels.length > 0) {
      if (!pref.experienceLevels.includes(job.experienceLevel)) {
        return false;
      }
    }

    if (pref.keywords && pref.keywords.length > 0) {
      const searchText =
        `${job.title} ${job.description} ${job.company}`.toLowerCase();
      const matchesKeyword = pref.keywords.some((keyword) =>
        searchText.includes(keyword.toLowerCase())
      );
      if (!matchesKeyword) return false;
    }

    return true;
  });

  return filteredJobs.slice(0, 10).map((job) => ({
    id: Number(job.id),
    title: job.title,
    company: job.company,
    location: job.location || "Remote",
    employmentType: job.employmentType || "Full-time",
    url: `${BASE_URL}/en/jobs/${job.id}`,
  }));
}
