/**
 * Import fragrance ingredients from CSV into the substance table.
 *
 * Run with: npx tsx scripts/import-fragrance-csv.ts [options]
 *
 * Options:
 *   --dry-run      Preview without writing to database
 *   --limit=N      Process only first N rows
 *   --clean        Remove all rows where domain='fragrance' (reset)
 *   --csv=PATH     Path to CSV file (default: auto-detect)
 */

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { join } from "path";
import { readFileSync } from "fs";
import { parse } from "csv-parse/sync";

config({ path: join(__dirname, "../.env.local") });

const sql = neon(process.env.DATABASE_URL!);

const DEFAULT_CSV_PATH =
  "/Users/lmangall/Repos_P/scraping/fragrance_data_pipeline/fragrance_ingredients_CONSOLIDATED.csv";

// Parse CLI args
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const clean = args.includes("--clean");
const limitArg = args.find((a) => a.startsWith("--limit="));
const limit = limitArg ? parseInt(limitArg.split("=")[1]) : Infinity;
const csvArg = args.find((a) => a.startsWith("--csv="));
const csvPath = csvArg ? csvArg.split("=")[1] : DEFAULT_CSV_PATH;

// Transform helpers
function parseBoolean(val: string): boolean | null {
  if (val === "True") return true;
  if (val === "False") return false;
  return null;
}

function parseFloat_(val: string): number | null {
  if (!val) return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

function parseInt_(val: string): number {
  if (!val) return 0;
  const n = parseInt(val);
  return isNaN(n) ? 0 : n;
}

function parsePubchemCid(val: string): string | null {
  if (!val) return null;
  // "7410.0" -> "7410"
  const n = parseFloat(val);
  return isNaN(n) ? null : String(Math.round(n));
}

function parseOdorProfileTags(val: string): string[] | null {
  if (!val) return null;
  return val.split(" > ").map((s) => s.trim()).filter(Boolean);
}

function parseAliases(val: string): string[] | null {
  if (!val) return null;
  return val.split(";").map((s) => s.trim()).filter(Boolean);
}

function normalizePriceRange(val: string): string | null {
  if (!val || val.includes("indisponible") || val.includes("Donnée")) return null;
  return val.trim();
}

function normalizeVolatility(val: string): string | null {
  if (!val || val === "NON TROUVE_N/A") return null;
  return val.trim();
}

function orNull(val: string): string | null {
  return val?.trim() || null;
}

// Stats tracking
const stats = {
  total: 0,
  inserted: 0,
  merged_cas: 0,
  merged_name: 0,
  skipped: 0,
  errors: 0,
};

async function findByCas(cas: string) {
  if (!cas) return null;
  const result = await sql`
    SELECT substance_id, domain, common_name FROM substance
    WHERE cas_id = ${cas} AND cas_id != '' AND cas_id IS NOT NULL
    LIMIT 1
  `;
  return result.length > 0 ? result[0] : null;
}

async function findByName(name: string) {
  if (!name) return null;
  const result = await sql`
    SELECT substance_id, domain, common_name FROM substance
    WHERE LOWER(common_name) = LOWER(${name})
    LIMIT 1
  `;
  return result.length > 0 ? result[0] : null;
}

async function mergeRow(
  substanceId: number,
  row: Record<string, string>
) {
  // Only fill in null/empty columns — never overwrite existing data
  await sql`
    UPDATE substance SET
      volatility_class = COALESCE(volatility_class, ${normalizeVolatility(row.volatility)}),
      olfactive_family = COALESCE(olfactive_family, ${orNull(row.category)}),
      odor_profile_tags = COALESCE(odor_profile_tags, ${JSON.stringify(parseOdorProfileTags(row.odor_profile_tags))}::jsonb),
      substantivity = COALESCE(substantivity, ${orNull(row.substantivity)}),
      uses_in_perfumery = COALESCE(uses_in_perfumery, ${orNull(row.uses_in_perfumery)}),
      density = COALESCE(density, ${orNull(row.density)}),
      refractive_index = COALESCE(refractive_index, ${orNull(row.refractive_index)}),
      vapor_pressure = COALESCE(vapor_pressure, ${orNull(row.vapor_pressure)}),
      inchikey = COALESCE(inchikey, ${orNull(row.inchikey)}),
      log_p = COALESCE(log_p, ${orNull(row.log_p)}),
      source_datasets = COALESCE(source_datasets, ${orNull(row.source_datasets)}),
      pubchem_enriched = COALESCE(pubchem_enriched, ${parseBoolean(row.pubchem_enriched)}),
      odor = COALESCE(odor, ${orNull(row.odor_description)}),
      ec_number = COALESCE(ec_number, ${orNull(row.einecs_number)}),
      smile = COALESCE(smile, ${orNull(row.canonical_smiles)}),
      molecular_formula = COALESCE(molecular_formula, ${orNull(row.molecular_formula)}),
      molecular_weight = COALESCE(molecular_weight, ${parseFloat_(row.molecular_weight)}),
      iupac_name = COALESCE(iupac_name, ${orNull(row.iupac_name)}),
      xlogp = COALESCE(xlogp, ${parseFloat_(row.xlogp)}),
      pubchem_cid = COALESCE(pubchem_cid, ${parsePubchemCid(row.pubchem_cid)}),
      domain = 'both'
    WHERE substance_id = ${substanceId}
  `;
}

async function insertRow(row: Record<string, string>) {
  const altNames = parseAliases(row.aliases);
  await sql`
    INSERT INTO substance (
      common_name, cas_id, ec_number, fema_number,
      molecular_formula, molecular_weight, iupac_name,
      smile, xlogp, pubchem_cid, odor,
      alternative_names,
      volatility_class, olfactive_family, odor_profile_tags,
      substantivity, uses_in_perfumery,
      density, refractive_index, vapor_pressure, inchikey, log_p,
      source_datasets, pubchem_enriched,
      domain
    ) VALUES (
      ${row.generic_name},
      ${orNull(row.cas_number)},
      ${orNull(row.einecs_number)},
      ${parseInt_(row.fema_number)},
      ${orNull(row.molecular_formula)},
      ${parseFloat_(row.molecular_weight)},
      ${orNull(row.iupac_name)},
      ${orNull(row.canonical_smiles)},
      ${parseFloat_(row.xlogp)},
      ${parsePubchemCid(row.pubchem_cid)},
      ${orNull(row.odor_description)},
      ${altNames ? JSON.stringify(altNames) : null}::jsonb,
      ${normalizeVolatility(row.volatility)},
      ${orNull(row.category)},
      ${JSON.stringify(parseOdorProfileTags(row.odor_profile_tags))}::jsonb,
      ${orNull(row.substantivity)},
      ${orNull(row.uses_in_perfumery)},
      ${orNull(row.density)},
      ${orNull(row.refractive_index)},
      ${orNull(row.vapor_pressure)},
      ${orNull(row.inchikey)},
      ${orNull(row.log_p)},
      ${orNull(row.source_datasets)},
      ${parseBoolean(row.pubchem_enriched)},
      'fragrance'
    )
  `;
}

async function run() {
  console.log(`\nFragrance CSV Import`);
  console.log(`  CSV: ${csvPath}`);
  console.log(`  Dry run: ${dryRun}`);
  console.log(`  Limit: ${limit === Infinity ? "none" : limit}`);
  console.log(`  Clean: ${clean}\n`);

  if (clean) {
    if (dryRun) {
      const count = await sql`SELECT COUNT(*) as c FROM substance WHERE domain = 'fragrance'`;
      console.log(`[DRY RUN] Would delete ${count[0].c} fragrance-only substances`);
    } else {
      const result = await sql`DELETE FROM substance WHERE domain = 'fragrance'`;
      console.log(`Cleaned: deleted fragrance-only substances`);
      // Also reset merged rows back to 'flavor'
      await sql`UPDATE substance SET domain = 'flavor' WHERE domain = 'both'`;
      console.log(`Reset 'both' rows back to 'flavor'`);
    }
    if (!args.some((a) => !a.startsWith("--"))) {
      // If only --clean was passed, stop here
      return;
    }
  }

  // Read CSV and parse
  console.log("Reading CSV...");
  const content = readFileSync(csvPath, "utf-8");
  const rows: Record<string, string>[] = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });
  console.log(`  Parsed ${rows.length} rows\n`);

  const toProcess = rows.slice(0, limit);

  for (let i = 0; i < toProcess.length; i++) {
    const row = toProcess[i];
    stats.total++;

    const name = row.generic_name?.trim();
    if (!name) {
      stats.skipped++;
      continue;
    }

    const cas = row.cas_number?.trim() || "";

    try {
      // Step 1: Try CAS match
      const caMatch = cas ? await findByCas(cas) : null;
      if (caMatch) {
        if (dryRun) {
          console.log(`  [MERGE-CAS] "${name}" → existing #${caMatch.substance_id} (${caMatch.common_name})`);
        } else {
          await mergeRow(caMatch.substance_id as number, row);
        }
        stats.merged_cas++;
        continue;
      }

      // Step 2: Try name match
      const nameMatch = await findByName(name);
      if (nameMatch) {
        if (dryRun) {
          console.log(`  [MERGE-NAME] "${name}" → existing #${nameMatch.substance_id} (${nameMatch.common_name})`);
        } else {
          await mergeRow(nameMatch.substance_id as number, row);
        }
        stats.merged_name++;
        continue;
      }

      // Step 3: Insert new
      if (dryRun) {
        console.log(`  [INSERT] "${name}" (CAS: ${cas || "none"}, volatility: ${row.volatility || "none"})`);
      } else {
        await insertRow(row);
      }
      stats.inserted++;
    } catch (err: any) {
      console.error(`  [ERROR] Row ${i + 1} "${name}": ${err.message}`);
      stats.errors++;
    }

    // Progress
    if (stats.total % 100 === 0) {
      console.log(`  ... processed ${stats.total}/${toProcess.length}`);
    }
  }

  console.log(`\n=== Import Summary ===`);
  console.log(`  Total processed: ${stats.total}`);
  console.log(`  Inserted (new):  ${stats.inserted}`);
  console.log(`  Merged (CAS):    ${stats.merged_cas}`);
  console.log(`  Merged (name):   ${stats.merged_name}`);
  console.log(`  Skipped:         ${stats.skipped}`);
  console.log(`  Errors:          ${stats.errors}`);
  if (dryRun) console.log(`\n  [DRY RUN — no changes were made]`);
}

run().catch(console.error);
