import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { job_search_monitors } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import puppeteer from "puppeteer-core";
import { getExtractor } from "@/lib/job-monitors/extractors";
import { extractLinkedInListings } from "@/lib/job-monitors/extractors/linkedin";
import { extractIndeedListings } from "@/lib/job-monitors/extractors/indeed";
import { sendMonitorSearchReport, sendCronErrorNotification } from "@/lib/email/resend";
import type { ExtractedListing } from "@/lib/job-monitors/types";
import { API_BASED_SITE_KEYS } from "@/constants/job-monitor";

export const maxDuration = 60;

const CRON_SECRET = process.env.CRON_SECRET;
const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN;

export async function GET(request: Request) {
  if (CRON_SECRET) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await processMonitors();
    return NextResponse.json(result);
  } catch (error) {
    // Comprehensive error serialization
    const errorMessage = serializeError(error);
    console.error("[monitor-searches] Error processing search monitors:", errorMessage);

    try {
      await sendCronErrorNotification({
        cronRoute: "monitor-searches",
        errorMessage,
        timestamp: new Date().toISOString(),
      });
    } catch (emailError) {
      const emailErrorMessage = serializeError(emailError);
      console.error("[monitor-searches] Failed to send error notification email:", emailErrorMessage);
    }

    return NextResponse.json(
      { error: "Failed to process search monitors", details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Serialize any error to a readable string format
 */
function serializeError(error: unknown): string {
  if (error instanceof Error) {
    return error.stack || `${error.name}: ${error.message}`;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    try {
      return JSON.stringify(error, null, 2);
    } catch {
      return `Non-serializable error object: ${Object.prototype.toString.call(error)}`;
    }
  }

  return String(error);
}

type MonitorRow = typeof job_search_monitors.$inferSelect;

/** Upsert listings for a monitor and return count of new ones */
async function upsertListings(
  monitor: MonitorRow,
  listings: ExtractedListing[],
  allNewListings: Array<ExtractedListing & { monitorLabel: string }>
): Promise<number> {
  if (listings.length === 0) {
    await db
      .update(job_search_monitors)
      .set({
        last_checked_at: new Date().toISOString(),
        last_listing_count: 0,
        last_error: "0 listings found",
        updated_at: new Date().toISOString(),
      })
      .where(eq(job_search_monitors.id, monitor.id));

    console.warn(
      `[monitor-searches] ${monitor.label}: 0 listings extracted`
    );
    return 0;
  }

  const newForThisMonitor: ExtractedListing[] = [];

  for (const listing of listings) {
    const result = await db.execute(sql`
      INSERT INTO monitored_listings (
        monitor_id, external_id, title, company, location,
        employment_type, salary, listing_url, first_seen_at, last_seen_at
      )
      VALUES (
        ${monitor.id}, ${listing.externalId}, ${listing.title},
        ${listing.company}, ${listing.location},
        ${listing.employmentType}, ${listing.salary},
        ${listing.listingUrl}, NOW(), NOW()
      )
      ON CONFLICT (monitor_id, external_id) DO UPDATE SET
        last_seen_at = NOW(),
        title = EXCLUDED.title,
        company = EXCLUDED.company,
        location = EXCLUDED.location,
        employment_type = EXCLUDED.employment_type,
        salary = EXCLUDED.salary
      RETURNING
        id,
        (xmax = 0) AS is_new
    `);

    const row = result.rows[0] as { id: number; is_new: boolean };
    if (row.is_new) {
      newForThisMonitor.push(listing);
      allNewListings.push({ ...listing, monitorLabel: monitor.label });
    }
  }

  await db
    .update(job_search_monitors)
    .set({
      last_checked_at: new Date().toISOString(),
      last_listing_count: listings.length,
      last_error: null,
      updated_at: new Date().toISOString(),
    })
    .where(eq(job_search_monitors.id, monitor.id));

  console.log(
    `[monitor-searches] ${monitor.label}: ${listings.length} total, ${newForThisMonitor.length} new`
  );

  return newForThisMonitor.length;
}

async function processMonitors() {
  const monitors = await db
    .select()
    .from(job_search_monitors)
    .where(eq(job_search_monitors.is_active, true));

  if (monitors.length === 0) {
    return { success: true, monitorsProcessed: 0, newListings: 0 };
  }

  // Split monitors by extraction strategy
  const apiMonitors = monitors.filter((m) =>
    API_BASED_SITE_KEYS.includes(m.site_key as (typeof API_BASED_SITE_KEYS)[number])
  );
  const browserMonitors = monitors.filter(
    (m) => !API_BASED_SITE_KEYS.includes(m.site_key as (typeof API_BASED_SITE_KEYS)[number])
  );

  let totalNew = 0;
  const allNewListings: Array<ExtractedListing & { monitorLabel: string }> = [];
  const failedMonitorLabels: string[] = [];

  // --- Process API-based monitors (LinkedIn) ---
  for (const monitor of apiMonitors) {
    try {
      let listings: ExtractedListing[];

      if (monitor.site_key === "linkedin") {
        listings = await extractLinkedInListings(monitor.search_url);
      } else if (monitor.site_key === "indeed") {
        listings = await extractIndeedListings(monitor.search_url);
      } else {
        console.error(
          `[monitor-searches] No API extractor for site_key: ${monitor.site_key}`
        );
        await db
          .update(job_search_monitors)
          .set({
            last_error: `No API extractor for site_key: ${monitor.site_key}`,
            updated_at: new Date().toISOString(),
          })
          .where(eq(job_search_monitors.id, monitor.id));
        continue;
      }

      totalNew += await upsertListings(monitor, listings, allNewListings);
    } catch (error) {
      const message = serializeError(error);
      console.error(
        `[monitor-searches] Error for ${monitor.label}:`,
        message
      );
      failedMonitorLabels.push(monitor.label);

      await db
        .update(job_search_monitors)
        .set({
          last_error: message,
          updated_at: new Date().toISOString(),
        })
        .where(eq(job_search_monitors.id, monitor.id));
    }
  }

  // --- Process browser-based monitors (HelloWork, Indeed) ---
  if (browserMonitors.length > 0) {
    if (!BROWSERLESS_TOKEN) {
      console.error(
        "[monitor-searches] BROWSERLESS_TOKEN not configured — skipping browser monitors"
      );
      for (const monitor of browserMonitors) {
        failedMonitorLabels.push(monitor.label);
        await db
          .update(job_search_monitors)
          .set({
            last_error: "BROWSERLESS_TOKEN not configured",
            updated_at: new Date().toISOString(),
          })
          .where(eq(job_search_monitors.id, monitor.id));
      }
    } else {
      const browser = await puppeteer.connect({
        browserWSEndpoint: `wss://production-sfo.browserless.io?token=${BROWSERLESS_TOKEN}&stealth`,
      });

      try {
        for (const monitor of browserMonitors) {
          const extractor = getExtractor(monitor.site_key);
          if (!extractor) {
            console.error(
              `[monitor-searches] No extractor for site_key: ${monitor.site_key}`
            );
            await db
              .update(job_search_monitors)
              .set({
                last_error: `No extractor for site_key: ${monitor.site_key}`,
                updated_at: new Date().toISOString(),
              })
              .where(eq(job_search_monitors.id, monitor.id));
            continue;
          }

          let page;
          try {
            page = await browser.newPage();
            await page.setUserAgent(
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
            );

            await page.goto(monitor.search_url, {
              waitUntil: "domcontentloaded",
              timeout: 20_000,
            });

            const listings = await extractor.extract(page);
            totalNew += await upsertListings(
              monitor,
              listings,
              allNewListings
            );
          } catch (error) {
            const message = serializeError(error);
            console.error(
              `[monitor-searches] Error for ${monitor.label}:`,
              message
            );
            failedMonitorLabels.push(monitor.label);

            await db
              .update(job_search_monitors)
              .set({
                last_error: message,
                updated_at: new Date().toISOString(),
              })
              .where(eq(job_search_monitors.id, monitor.id));
          } finally {
            if (page) await page.close().catch(() => {});
          }
        }
      } finally {
        await browser.close();
      }
    }
  }

  // Cross-reference ALL monitored listings (not just new ones) against job_offers.source_url
  // Sets imported_job_id so the admin UI can link to the platform job
  let crossRefCount = 0;
  try {
    const crossRefResult = await db.execute(sql`
      UPDATE monitored_listings ml
      SET imported_job_id = jo.id::text
      FROM job_offers jo
      WHERE ml.imported_job_id IS NULL
        AND ml.listing_url = jo.source_url
    `);
    crossRefCount = crossRefResult.rowCount ?? 0;
    if (crossRefCount > 0) {
      console.log(
        `[monitor-searches] Cross-referenced ${crossRefCount} listings with existing job_offers`
      );
    }
  } catch (crossRefError) {
    const crossRefErrorMessage = serializeError(crossRefError);
    console.error("[monitor-searches] Cross-reference failed:", crossRefErrorMessage);
  }

  // Send email if there are new listings
  if (allNewListings.length > 0) {
    try {
      await sendMonitorSearchReport({
        totalMonitors: monitors.length,
        newListings: allNewListings.map((l) => ({
          title: l.title,
          company: l.company,
          location: l.location,
          employmentType: l.employmentType,
          url: l.listingUrl,
          monitorLabel: l.monitorLabel,
        })),
      });
    } catch (emailError) {
      const emailErrorMessage = serializeError(emailError);
      console.error("[monitor-searches] Failed to send email:", emailErrorMessage);
    }
  }

  // Notify admin if ALL monitors failed (cron returned 200 but nothing worked)
  if (failedMonitorLabels.length > 0 && failedMonitorLabels.length === monitors.length) {
    try {
      await sendCronErrorNotification({
        cronRoute: "monitor-searches",
        errorMessage: `All ${monitors.length} monitors failed: ${failedMonitorLabels.join(", ")}`,
        timestamp: new Date().toISOString(),
        context: "The cron returned HTTP 200 but every monitor encountered an error. Check individual monitor last_error fields in the database.",
      });
    } catch (emailError) {
      const emailErrorMessage = serializeError(emailError);
      console.error("[monitor-searches] Failed to send all-failed notification:", emailErrorMessage);
    }
  }

  return {
    success: true,
    monitorsProcessed: monitors.length,
    newListings: totalNew,
    crossReferenced: crossRefCount,
    timestamp: new Date().toISOString(),
  };
}
