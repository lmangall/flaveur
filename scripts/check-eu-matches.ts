/**
 * Check which local substances match EU FLAVIS database
 * Run with: npx tsx scripts/check-eu-matches.ts
 */

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { join } from "path";

config({ path: join(__dirname, "../.env.local") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("No DATABASE_URL");
  process.exit(1);
}
const sql = neon(DATABASE_URL);

async function findPotentialMatches() {
  console.log("Fetching EU FLAVIS database...");
  const res = await fetch(
    "https://api.datalake.sante.service.ec.europa.eu/food-flavourings/download?format=json&api-version=v2.0"
  );
  const text = await res.text();
  const euRecords = text.trim().split("\n").map((l) => JSON.parse(l));

  const euNames = new Set(
    euRecords.map((r: { food_flavouring_name: string }) =>
      r.food_flavouring_name.toLowerCase().trim()
    )
  );

  const localSubs = await sql`SELECT common_name, alternative_names FROM substance`;

  console.log(
    `\nChecking ${localSubs.length} local substances against ${euNames.size} EU names...\n`
  );

  const matches: { local: string; matched: string; via: string }[] = [];
  const partialMatches: { local: string; euName: string }[] = [];

  for (const sub of localSubs) {
    const name = (sub.common_name as string).toLowerCase().trim();
    let alts: string[] = [];
    if (sub.alternative_names) {
      const altNames = sub.alternative_names;
      if (Array.isArray(altNames)) {
        alts = altNames.map((a) => String(a).toLowerCase().trim());
      } else if (typeof altNames === "string") {
        try {
          const parsed = JSON.parse(altNames);
          if (Array.isArray(parsed)) {
            alts = parsed.map((a) => String(a).toLowerCase().trim());
          }
        } catch {
          // Not JSON, ignore
        }
      }
    }

    if (euNames.has(name)) {
      matches.push({ local: sub.common_name as string, matched: name, via: "common_name" });
      continue;
    }

    for (const alt of alts) {
      if (euNames.has(alt)) {
        matches.push({ local: sub.common_name as string, matched: alt, via: "alternative" });
        break;
      }
    }

    for (const euName of euNames) {
      if (euName.includes(name) && name.length > 4) {
        partialMatches.push({ local: sub.common_name as string, euName });
        break;
      }
    }
  }

  if (matches.length > 0) {
    console.log("=== EXACT MATCHES ===\n");
    for (const m of matches) {
      console.log(`✓ ${m.local} -> "${m.matched}" (via ${m.via})`);
    }
  } else {
    console.log("No exact matches found.\n");
  }

  if (partialMatches.length > 0) {
    console.log("\n=== PARTIAL MATCHES (EU name contains local name) ===\n");
    for (const m of partialMatches.slice(0, 30)) {
      console.log(`~ ${m.local} might match -> "${m.euName}"`);
    }
    if (partialMatches.length > 30) {
      console.log(`... and ${partialMatches.length - 30} more`);
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Exact matches: ${matches.length}`);
  console.log(`Partial matches: ${partialMatches.length}`);
  console.log(`Total local substances: ${localSubs.length}`);
}

findPotentialMatches();
