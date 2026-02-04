import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { job_offers } from "@/db/schema";
import { eq } from "drizzle-orm";
import puppeteer from "puppeteer-core";
import { sendJobCheckReport } from "@/lib/email/resend";

// Allow up to 300s on Vercel Pro for browser-based checks
export const maxDuration = 300;

const CRON_SECRET = process.env.CRON_SECRET;
const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN;

const CONCURRENCY = 3;
const PAGE_TIMEOUT_MS = 20_000;

// HTTP status codes that indicate a dead page
// Note: 403 is excluded — sites like Indeed block bots with 403, not because the job is gone
const DEAD_STATUS_CODES = new Set([404, 410, 451]);

// Text patterns (lowercase) that indicate the job listing has expired/been removed
const EXPIRED_PATTERNS = [
  "this job is no longer available",
  "this position has been filled",
  "this job has expired",
  "this listing has expired",
  "offre expirée",
  "cette offre n'est plus disponible",
  "cette offre a expiré",
  "annonce expirée",
  "job not found",
  "posting has been removed",
  "position is no longer available",
  "no longer accepting applications",
  "this job posting is no longer active",
  "the job you are looking for is no longer available",
  "cette annonce n'existe plus",
  "l'offre d'emploi n'est plus disponible",
];

// URL patterns that suggest a redirect to a generic/search page (not the original listing)
const REDIRECT_PATTERNS = [
  /\/jobs\/?$/,
  /\/careers\/?$/,
  /\/search\/?$/,
  /\/offres\/?$/,
  /\/emploi\/?$/,
  /\/404\/?$/,
  /\/error\/?$/,
];

type CheckResult = {
  id: string;
  title: string;
  company: string | null;
  source_url: string;
  status: "active" | "dead" | "error";
  reason?: string;
};

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
    const result = await checkJobUrls();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error checking job URLs:", error);
    return NextResponse.json(
      { error: "Failed to check job URLs" },
      { status: 500 }
    );
  }
}

async function checkJobUrls() {
  // Fetch all active jobs
  const activeJobs = await db
    .select({
      id: job_offers.id,
      title: job_offers.title,
      company_name: job_offers.company_name,
      source_url: job_offers.source_url,
    })
    .from(job_offers)
    .where(eq(job_offers.status, true));

  if (activeJobs.length === 0) {
    return { success: true, checked: 0, deactivated: 0, results: [] };
  }

  // Connect to Browserless remote browser with stealth mode
  // Stealth removes automation signals that sites use to detect bots
  const browser = await puppeteer.connect({
    browserWSEndpoint: `wss://production-sfo.browserless.io?token=${BROWSERLESS_TOKEN}&stealth`,
  });

  const results: CheckResult[] = [];

  try {
    // Process in batches with limited concurrency
    for (let i = 0; i < activeJobs.length; i += CONCURRENCY) {
      const batch = activeJobs.slice(i, i + CONCURRENCY);
      const batchResults = await Promise.all(
        batch.map((job) => checkSingleUrl(browser, job))
      );
      results.push(...batchResults);
    }
  } finally {
    await browser.close();
  }

  // Deactivate dead jobs
  const deadJobs = results.filter((r) => r.status === "dead");
  for (const job of deadJobs) {
    await db
      .update(job_offers)
      .set({ status: false, updated_at: new Date().toISOString() })
      .where(eq(job_offers.id, job.id));
  }

  const summary = {
    success: true,
    checked: results.length,
    deactivated: deadJobs.length,
    active: results.filter((r) => r.status === "active").length,
    errors: results.filter((r) => r.status === "error").length,
    timestamp: new Date().toISOString(),
    results,
  };

  console.log(
    `[check-jobs] Checked ${summary.checked} jobs: ${summary.deactivated} deactivated, ${summary.active} still active, ${summary.errors} errors`
  );

  // Send email report when jobs were deactivated
  if (deadJobs.length > 0) {
    try {
      await sendJobCheckReport({
        checked: summary.checked,
        deactivated: summary.deactivated,
        active: summary.active,
        errors: summary.errors,
        deadJobs: deadJobs.map((j) => ({
          title: j.title,
          company: j.company,
          source_url: j.source_url,
          reason: j.reason,
        })),
      });
    } catch (emailError) {
      console.error("[check-jobs] Failed to send email report:", emailError);
    }
  }

  return summary;
}

async function checkSingleUrl(
  browser: Awaited<ReturnType<typeof puppeteer.connect>>,
  job: {
    id: string;
    title: string;
    company_name: string | null;
    source_url: string;
  }
): Promise<CheckResult> {
  const base = {
    id: job.id,
    title: job.title,
    company: job.company_name,
    source_url: job.source_url,
  };

  let page;
  try {
    page = await browser.newPage();

    // Set a realistic user agent
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    );

    const response = await page.goto(job.source_url, {
      waitUntil: "domcontentloaded",
      timeout: PAGE_TIMEOUT_MS,
    });

    if (!response) {
      return { ...base, status: "dead", reason: "No response received" };
    }

    const httpStatus = response.status();

    // Check HTTP status
    if (DEAD_STATUS_CODES.has(httpStatus)) {
      return {
        ...base,
        status: "dead",
        reason: `HTTP ${httpStatus}`,
      };
    }

    // Check if redirected to a generic page
    const finalUrl = page.url();
    const originalPath = new URL(job.source_url).pathname;
    const finalPath = new URL(finalUrl).pathname;

    if (
      originalPath !== finalPath &&
      REDIRECT_PATTERNS.some((pattern) => pattern.test(finalPath))
    ) {
      return {
        ...base,
        status: "dead",
        reason: `Redirected to generic page: ${finalUrl}`,
      };
    }

    // Check page content for expired patterns
    const bodyText = await page.evaluate(
      () => document.body?.innerText?.toLowerCase() || ""
    );

    for (const pattern of EXPIRED_PATTERNS) {
      if (bodyText.includes(pattern)) {
        return {
          ...base,
          status: "dead",
          reason: `Page contains: "${pattern}"`,
        };
      }
    }

    return { ...base, status: "active" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    // Timeouts and navigation failures often mean the page is gone
    if (message.includes("net::ERR_NAME_NOT_RESOLVED")) {
      return { ...base, status: "dead", reason: "Domain not found" };
    }
    if (message.includes("net::ERR_CONNECTION_REFUSED")) {
      return { ...base, status: "dead", reason: "Connection refused" };
    }

    return { ...base, status: "error", reason: message };
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }
  }
}
