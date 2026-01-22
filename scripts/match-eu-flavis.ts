/**
 * EU FLAVIS Matching script: Cross-reference substances with EU FLAVIS database
 *
 * Run with: npx tsx scripts/match-eu-flavis.ts [--dry-run]
 *
 * Options:
 *   --dry-run    Preview matches without writing to database
 *
 * Prerequisites:
 * - DATABASE_URL environment variable must be set
 * - Migration 012 must be applied (adds fl_number column)
 */

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { join } from "path";

// Load environment variables from .env.local
config({ path: join(__dirname, "../.env.local") });

interface EUFlavouringRecord {
  policy_item_code: string;
  food_flavouring_name: string;
  fip_url: string;
  food_category: string;
  restriction_type: string | null;
  restriction_value: string | null;
  restriction_unit: string | null;
  restriction_comment: string | null;
  legislation_short: string;
  legislation_reference: string;
}

const EU_API_URL =
  "https://api.datalake.sante.service.ec.europa.eu/food-flavourings/download?format=json&api-version=v2.0";

async function fetchEUFlavourings(): Promise<EUFlavouringRecord[]> {
  console.log("Fetching EU FLAVIS database...");
  const response = await fetch(EU_API_URL);

  if (!response.ok) {
    throw new Error(`EU API request failed: ${response.status}`);
  }

  const text = await response.text();

  // Parse newline-delimited JSON
  const records = text
    .trim()
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line) as EUFlavouringRecord);

  console.log(`Loaded ${records.length} EU flavouring records\n`);
  return records;
}

/**
 * Extract FL number from fip_url or policy_item_code
 * FL numbers are in format XX.XXX (e.g., 02.001, 14.128)
 * Note: The new EU API no longer provides FL numbers directly
 */
function extractFLNumber(record: EUFlavouringRecord): string | null {
  // Try to extract from fip_url (legacy URL format)
  // Old URL format: https://webgate.ec.europa.eu/fip/.../FL/XX.XXX
  const urlMatch = record.fip_url?.match(/FL\/(\d{2}\.\d{3})/);
  if (urlMatch) {
    return urlMatch[1];
  }

  // Try to extract from policy_item_code if it contains FL number
  const codeMatch = record.policy_item_code?.match(/(\d{2}\.\d{3})/);
  if (codeMatch) {
    return codeMatch[1];
  }

  return null;
}

/**
 * Extract the policy item code from the EU record
 * Format: POL-FFL-IMPORT-XXXX
 */
function extractPolicyCode(record: EUFlavouringRecord): string | null {
  return record.policy_item_code || null;
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

async function matchEUFlavourings() {
  console.log(`EU FLAVIS Matching Script`);
  console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}\n`);

  const euRecords = await fetchEUFlavourings();

  // Build name lookup (normalized)
  const euByName = new Map<string, EUFlavouringRecord>();
  for (const r of euRecords) {
    const normalizedName = r.food_flavouring_name.toLowerCase().trim();
    // Store only first occurrence (most authoritative)
    if (!euByName.has(normalizedName)) {
      euByName.set(normalizedName, r);
    }
  }

  console.log(`Built lookup with ${euByName.size} unique names\n`);

  // Get substances without EU policy code
  const substances = await sql`
    SELECT substance_id, common_name, alternative_names, fl_number
    FROM substance
    WHERE eu_policy_code IS NULL OR eu_policy_code = ''
  `;

  console.log(`Found ${substances.length} substances without EU policy code\n`);

  let matchedWithFl = 0;
  let matchedWithCode = 0;
  let notFound = 0;

  for (const sub of substances) {
    const substanceId = sub.substance_id as number;
    const commonName = sub.common_name as string;
    const alternativeNames = sub.alternative_names;
    const existingFlNumber = sub.fl_number as string | null;

    // Try exact match on common_name
    let match = euByName.get(commonName.toLowerCase().trim());

    // Try alternative names (handle both JSONB array and null)
    if (!match && alternativeNames && Array.isArray(alternativeNames)) {
      for (const alt of alternativeNames) {
        match = euByName.get(String(alt).toLowerCase().trim());
        if (match) break;
      }
    }

    if (match) {
      const flNumber = extractFLNumber(match);
      const policyCode = extractPolicyCode(match);

      if (!dryRun && policyCode) {
        // Update both eu_policy_code and fl_number (if available and not already set)
        if (flNumber && !existingFlNumber) {
          await sql`
            UPDATE substance
            SET eu_policy_code = ${policyCode}, fl_number = ${flNumber}
            WHERE substance_id = ${substanceId}
          `;
        } else {
          await sql`
            UPDATE substance
            SET eu_policy_code = ${policyCode}
            WHERE substance_id = ${substanceId}
          `;
        }
      }

      if (flNumber) {
        matchedWithFl++;
        console.log(`✓ Matched: ${commonName} -> FL ${flNumber} (${policyCode})`);
      } else if (policyCode) {
        matchedWithCode++;
        console.log(`✓ Matched: ${commonName} -> ${policyCode}`);
      }
    } else {
      notFound++;
    }
  }

  console.log("\n--- Matching Summary ---");
  console.log(`Matched with FL number: ${matchedWithFl}`);
  console.log(`Matched with policy code only: ${matchedWithCode}`);
  console.log(`Total matched: ${matchedWithFl + matchedWithCode}`);
  console.log(`Not found in EU database: ${notFound}`);
  console.log(`Total processed: ${substances.length}`);
  if (dryRun) {
    console.log("\n(Dry run - no changes were made)");
  }
}

matchEUFlavourings().catch((err) => {
  console.error("Matching failed:", err);
  process.exit(1);
});
