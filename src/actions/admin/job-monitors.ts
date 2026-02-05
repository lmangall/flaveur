"use server";

import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { job_search_monitors, monitored_listings } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import puppeteer from "puppeteer-core";
import { getDetailExtractor } from "@/lib/job-monitors/detail-extractors";
import { extractLinkedInDetail } from "@/lib/job-monitors/detail-extractors/linkedin";
import { mapDetailToJobFormData } from "@/lib/job-monitors/field-mapping";
import type { JobFormPrefillData } from "@/lib/job-monitors/field-mapping";
import { API_BASED_SITE_KEYS } from "@/constants/job-monitor";

export async function getJobSearchMonitors() {
  await requireAdmin();
  return await db
    .select()
    .from(job_search_monitors)
    .orderBy(desc(job_search_monitors.created_at));
}

export async function createJobSearchMonitor(data: {
  label: string;
  search_url: string;
  site_key: string;
}) {
  await requireAdmin();
  const result = await db
    .insert(job_search_monitors)
    .values(data)
    .returning();
  return result[0];
}

export async function updateJobSearchMonitor(
  id: number,
  data: {
    label?: string;
    search_url?: string;
    site_key?: string;
    is_active?: boolean;
  }
) {
  await requireAdmin();
  const result = await db
    .update(job_search_monitors)
    .set({ ...data, updated_at: new Date().toISOString() })
    .where(eq(job_search_monitors.id, id))
    .returning();
  return result[0];
}

export async function deleteJobSearchMonitor(id: number) {
  await requireAdmin();
  await db
    .delete(job_search_monitors)
    .where(eq(job_search_monitors.id, id));
  return { success: true };
}

export async function getMonitoredListings(monitorId: number) {
  await requireAdmin();
  return await db
    .select()
    .from(monitored_listings)
    .where(eq(monitored_listings.monitor_id, monitorId))
    .orderBy(desc(monitored_listings.first_seen_at));
}

export async function getRecentNewListings(limit = 50) {
  await requireAdmin();
  const result = await db.execute(sql`
    SELECT ml.*, jsm.label as monitor_label, jsm.site_key,
      CASE WHEN ml.imported_job_id IS NOT NULL THEN true ELSE false END as on_platform
    FROM monitored_listings ml
    JOIN job_search_monitors jsm ON ml.monitor_id = jsm.id
    ORDER BY ml.first_seen_at DESC
    LIMIT ${limit}
  `);
  return result.rows;
}

export async function scrapeListingDetail(
  listingId: number
): Promise<JobFormPrefillData> {
  await requireAdmin();

  // Fetch listing with its monitor's site_key
  const result = await db.execute(sql`
    SELECT ml.*, jsm.site_key
    FROM monitored_listings ml
    JOIN job_search_monitors jsm ON ml.monitor_id = jsm.id
    WHERE ml.id = ${listingId}
  `);

  if (result.rows.length === 0) {
    throw new Error("Listing not found");
  }

  const listing = result.rows[0] as {
    listing_url: string;
    site_key: string;
    imported_job_id: string | null;
  };

  if (listing.imported_job_id) {
    throw new Error("This listing has already been imported");
  }

  // --- API-based extraction (LinkedIn) ---
  if (
    API_BASED_SITE_KEYS.includes(
      listing.site_key as (typeof API_BASED_SITE_KEYS)[number]
    )
  ) {
    if (listing.site_key === "linkedin") {
      const detail = await extractLinkedInDetail(listing.listing_url);
      return mapDetailToJobFormData(detail);
    }
    throw new Error(
      `No API detail extractor for site: ${listing.site_key}`
    );
  }

  // --- Browser-based extraction (HelloWork, Indeed) ---
  const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN;
  if (!BROWSERLESS_TOKEN) {
    throw new Error("BROWSERLESS_TOKEN is not configured");
  }

  const extractor = getDetailExtractor(listing.site_key);
  if (!extractor) {
    throw new Error(`No detail extractor for site: ${listing.site_key}`);
  }

  const browser = await puppeteer.connect({
    browserWSEndpoint: `wss://production-sfo.browserless.io?token=${BROWSERLESS_TOKEN}&stealth`,
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    );

    await page.goto(listing.listing_url, {
      waitUntil: "domcontentloaded",
      timeout: 20_000,
    });

    const detail = await extractor.extractDetail(page);
    await page.close();

    return mapDetailToJobFormData(detail);
  } finally {
    await browser.close();
  }
}

export async function linkListingToJob(listingId: number, jobId: string) {
  await requireAdmin();

  await db
    .update(monitored_listings)
    .set({ imported_job_id: jobId })
    .where(eq(monitored_listings.id, listingId));

  return { success: true };
}
