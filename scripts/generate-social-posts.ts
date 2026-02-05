/**
 * Generate social media posts from active job offers.
 *
 * Usage:
 *   npx tsx scripts/generate-social-posts.ts                          # all active jobs, daily format, linkedin
 *   npx tsx scripts/generate-social-posts.ts --format=weekly          # weekly roundup
 *   npx tsx scripts/generate-social-posts.ts --format=spotlight       # grouped by industry
 *   npx tsx scripts/generate-social-posts.ts --format=story           # short story/reel format
 *   npx tsx scripts/generate-social-posts.ts --platform=x             # target X/Twitter
 *   npx tsx scripts/generate-social-posts.ts --platform=instagram     # target Instagram
 *   npx tsx scripts/generate-social-posts.ts --limit=3                # limit number of jobs
 *   npx tsx scripts/generate-social-posts.ts --industry="Arômes"      # filter by industry
 */

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { join } from "path";

config({ path: join(__dirname, "../.env.local") });

// Import types only — we inline the generator logic to avoid path alias issues in tsx
import type {
  JobPost,
  PostFormat,
  Platform,
} from "../src/constants/social-posts";

// Re-import generators via relative path (tsx doesn't resolve @/ aliases)
import {
  generateDailyPost,
  generateWeeklyRoundup,
  generateSpotlight,
  generateStory,
} from "../src/constants/social-posts";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// --- CLI arg parsing ---

function parseArgs() {
  const args = process.argv.slice(2);
  const opts: { format: PostFormat; platform: Platform; limit: number; industry?: string } = {
    format: "daily",
    platform: "linkedin",
    limit: 10,
  };

  for (const arg of args) {
    const [key, val] = arg.split("=");
    switch (key) {
      case "--format":
        opts.format = val as PostFormat;
        break;
      case "--platform":
        opts.platform = val as Platform;
        break;
      case "--limit":
        opts.limit = parseInt(val, 10);
        break;
      case "--industry":
        opts.industry = val;
        break;
    }
  }

  return opts;
}

// --- Main ---

async function main() {
  const opts = parseArgs();

  // Fetch active jobs
  const rows = opts.industry
    ? await sql`SELECT * FROM job_offers WHERE status = true AND industry ILIKE ${"%" + opts.industry + "%"} ORDER BY posted_at DESC`
    : await sql`SELECT * FROM job_offers WHERE status = true ORDER BY posted_at DESC`;

  if (rows.length === 0) {
    console.log("No active job offers found.");
    return;
  }

  const jobs: JobPost[] = rows.slice(0, opts.limit).map((r) => ({
    id: String(r.id),
    title: String(r.title),
    company_name: r.company_name ? String(r.company_name) : null,
    location: String(r.location),
    employment_type: r.employment_type ? String(r.employment_type) : null,
    experience_level: r.experience_level ? String(r.experience_level) : null,
    salary: r.salary ? String(r.salary) : null,
    requirements: r.requirements as string[] | null,
    tags: r.tags as string[] | null,
    industry: String(r.industry),
    source_url: String(r.source_url),
    description: String(r.description),
    through_recruiter: Boolean(r.through_recruiter),
  }));

  console.log(
    `\n--- ${opts.format.toUpperCase()} | ${opts.platform.toUpperCase()} | ${jobs.length} job(s) ---\n`
  );

  const separator = "\n" + "=".repeat(60) + "\n";

  switch (opts.format) {
    case "daily":
      for (const job of jobs) {
        console.log(generateDailyPost(job, opts.platform));
        console.log(separator);
      }
      break;

    case "weekly":
      console.log(generateWeeklyRoundup(jobs, opts.platform));
      break;

    case "spotlight": {
      // Group by industry
      const byIndustry = new Map<string, JobPost[]>();
      for (const job of jobs) {
        const group = byIndustry.get(job.industry) ?? [];
        group.push(job);
        byIndustry.set(job.industry, group);
      }
      for (const [industry, group] of byIndustry) {
        console.log(generateSpotlight(group, industry, opts.platform));
        console.log(separator);
      }
      break;
    }

    case "story":
      for (const job of jobs) {
        console.log(generateStory(job));
        console.log(separator);
      }
      break;

    default:
      console.error(`Unknown format: ${opts.format}`);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
