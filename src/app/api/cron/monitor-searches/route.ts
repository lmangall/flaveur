import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { job_search_monitors } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import puppeteer from "puppeteer-core";
import { getExtractor } from "@/lib/job-monitors/extractors";
import { sendMonitorSearchReport } from "@/lib/email/resend";
import type { ExtractedListing } from "@/lib/job-monitors/types";

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

  if (!BROWSERLESS_TOKEN) {
    return NextResponse.json(
      { error: "BROWSERLESS_TOKEN is not configured" },
      { status: 500 }
    );
  }

  try {
    const result = await processMonitors();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing search monitors:", error);
    return NextResponse.json(
      { error: "Failed to process search monitors" },
      { status: 500 }
    );
  }
}

async function processMonitors() {
  const monitors = await db
    .select()
    .from(job_search_monitors)
    .where(eq(job_search_monitors.is_active, true));

  if (monitors.length === 0) {
    return { success: true, monitorsProcessed: 0, newListings: 0 };
  }

  const browser = await puppeteer.connect({
    browserWSEndpoint: `wss://production-sfo.browserless.io?token=${BROWSERLESS_TOKEN}&stealth`,
  });

  let totalNew = 0;
  const allNewListings: Array<ExtractedListing & { monitorLabel: string }> = [];

  try {
    for (const monitor of monitors) {
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

        // Warn if page loaded but no listings extracted (possible structure change)
        if (listings.length === 0) {
          await db
            .update(job_search_monitors)
            .set({
              last_checked_at: new Date().toISOString(),
              last_listing_count: 0,
              last_error:
                "0 listings extracted — possible site structure change",
              updated_at: new Date().toISOString(),
            })
            .where(eq(job_search_monitors.id, monitor.id));

          console.warn(
            `[monitor-searches] ${monitor.label}: 0 listings extracted`
          );
          continue;
        }

        // Upsert each listing, detect new ones via xmax = 0
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

        totalNew += newForThisMonitor.length;

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
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        console.error(
          `[monitor-searches] Error for ${monitor.label}:`,
          message
        );

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
    console.error("[monitor-searches] Cross-reference failed:", crossRefError);
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
      console.error("[monitor-searches] Failed to send email:", emailError);
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
