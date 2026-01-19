import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { sendJobAlertEmail, type JobAlertJob } from "@/lib/email/resend";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://oumamie.xyz";

// Vercel Cron secret to protect this endpoint
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
  // Verify cron secret if configured
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
  // Get all active job alert preferences
  const preferences = (await sql`
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
  `) as JobAlertPreference[];

  let emailsSent = 0;
  let usersProcessed = 0;

  for (const pref of preferences) {
    // Check if we should send based on frequency
    if (!shouldSendAlert(pref.frequency, pref.lastNotifiedAt)) {
      continue;
    }

    // Find matching jobs since last notification
    const matchingJobs = await findMatchingJobs(pref);

    if (matchingJobs.length === 0) {
      continue;
    }

    // Determine locale (default to 'en')
    const locale = "en"; // Could be stored in preferences later

    const unsubscribeUrl = `${BASE_URL}/${locale}/settings`;

    try {
      await sendJobAlertEmail(pref.email, matchingJobs, locale, unsubscribeUrl);

      // Update last_notified_at
      await sql`
        UPDATE job_alert_preferences
        SET last_notified_at = NOW()
        WHERE id = ${pref.id}
      `;

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
    return true; // Never notified before
  }

  const lastNotified = new Date(lastNotifiedAt);
  const now = new Date();
  const hoursSinceLastNotified =
    (now.getTime() - lastNotified.getTime()) / (1000 * 60 * 60);

  switch (frequency) {
    case "instant":
      return true; // Always send for instant
    case "daily":
      return hoursSinceLastNotified >= 24;
    case "weekly":
      return hoursSinceLastNotified >= 168; // 7 days
    default:
      return false;
  }
}

async function findMatchingJobs(
  pref: Pick<JobAlertPreference, "locations" | "employmentTypes" | "experienceLevels" | "keywords" | "lastNotifiedAt">
): Promise<JobAlertJob[]> {
  // Build the query dynamically based on preferences
  const sinceDate = pref.lastNotifiedAt
    ? new Date(pref.lastNotifiedAt)
    : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default to last 7 days

  // Start with base query
  let jobs = await sql`
    SELECT
      id,
      title,
      company,
      location,
      employment_type as "employmentType",
      experience_level as "experienceLevel",
      description
    FROM jobs
    WHERE created_at > ${sinceDate}
      AND status = 'active'
    ORDER BY created_at DESC
    LIMIT 50
  `;

  // Filter in memory for flexibility with array matching
  const filteredJobs = jobs.filter((job) => {
    // Location filter
    if (pref.locations && pref.locations.length > 0) {
      const jobLocation = (job.location || "").toLowerCase();
      const matchesLocation = pref.locations.some((loc) =>
        jobLocation.includes(loc.toLowerCase())
      );
      if (!matchesLocation) return false;
    }

    // Employment type filter
    if (pref.employmentTypes && pref.employmentTypes.length > 0) {
      if (!pref.employmentTypes.includes(job.employmentType)) {
        return false;
      }
    }

    // Experience level filter
    if (pref.experienceLevels && pref.experienceLevels.length > 0) {
      if (!pref.experienceLevels.includes(job.experienceLevel)) {
        return false;
      }
    }

    // Keyword filter
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

  // Map to JobAlertJob format
  return filteredJobs.slice(0, 10).map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location || "Remote",
    employmentType: job.employmentType || "Full-time",
    url: `${BASE_URL}/en/jobs/${job.id}`,
  }));
}
