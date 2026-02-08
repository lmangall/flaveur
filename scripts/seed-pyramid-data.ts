/**
 * Seed perfume formulas with volatility data for Pyramid Visualization
 *
 * Creates perfume-type flavours with substances that have volatility_class set,
 * so the Olfactive Pyramid visualization can render properly.
 *
 * Usage:
 *   npx tsx scripts/seed-pyramid-data.ts
 *   npx tsx scripts/seed-pyramid-data.ts --dry-run
 *   npx tsx scripts/seed-pyramid-data.ts --clean
 *   npx tsx scripts/seed-pyramid-data.ts --email=l.mangallon@gmail.com
 *
 * Prerequisites:
 *   - DATABASE_URL environment variable must be set
 *   - Substances with volatility_class must exist (from fragrance CSV import)
 */

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { join } from "path";

// Load environment variables from .env.local
config({ path: join(__dirname, "../.env.local") });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const cleanMode = args.includes("--clean");
const emailArg = args.find((a) => a.startsWith("--email="));
const targetEmail = emailArg?.split("=")[1] || "l.mangallon@gmail.com";

// =============================================================================
// PERFUME FORMULAS WITH VOLATILITY DATA
// Each formula has a balanced pyramid (top/heart/base notes)
// =============================================================================

interface PerfumeIngredient {
  common_name: string;
  concentration: number; // in %(v/v) for perfumery
  order_index: number;
  pyramid_position?: "top" | "heart" | "base";
}

interface PerfumeFormula {
  name: string;
  description: string;
  base_unit: string;
  flavor_profile: { attribute: string; value: number }[];
  substances: PerfumeIngredient[];
}

// Classic perfume formulas with proper pyramid structure
// Using actual substance names from the database that have volatility_class set
const PERFUME_FORMULAS: PerfumeFormula[] = [
  {
    name: "Citrus Fresh",
    description:
      "A fresh citrus cologne with bright top notes of bergamot and lemon, a floral heart, and a warm woody base. Perfect for summer days.",
    base_unit: "%(v/v)",
    flavor_profile: [
      { attribute: "Freshness", value: 90 },
      { attribute: "Intensity", value: 50 },
      { attribute: "Longevity", value: 40 },
      { attribute: "Warmth", value: 20 },
      { attribute: "Sweetness", value: 30 },
    ],
    substances: [
      // Top notes
      { common_name: "Bergamot Mint", concentration: 8.0, order_index: 1, pyramid_position: "top" },
      { common_name: "Aldehyde C-11 undecylenic", concentration: 0.5, order_index: 2, pyramid_position: "top" },
      { common_name: "Benzyl Acetate", concentration: 4.0, order_index: 3, pyramid_position: "top" },
      { common_name: "Camphor", concentration: 1.0, order_index: 4, pyramid_position: "top" },
      // Heart notes
      { common_name: "Linalool", concentration: 6.0, order_index: 5, pyramid_position: "heart" },
      { common_name: "Geraniol", concentration: 4.0, order_index: 6, pyramid_position: "heart" },
      { common_name: "Benzyl Salicylate", concentration: 3.0, order_index: 7, pyramid_position: "heart" },
      { common_name: "2-Phenylethanol", concentration: 2.0, order_index: 8, pyramid_position: "heart" },
      // Base notes
      { common_name: "Cedarwood Virginia", concentration: 5.0, order_index: 9, pyramid_position: "base" },
      { common_name: "Sandalwood oil (album)", concentration: 3.0, order_index: 10, pyramid_position: "base" },
      { common_name: "Musk R1", concentration: 2.0, order_index: 11, pyramid_position: "base" },
      { common_name: "Patchouli oil", concentration: 2.0, order_index: 12, pyramid_position: "base" },
    ],
  },
  {
    name: "Oriental Spice",
    description:
      "A warm oriental fragrance with spicy top notes, rich floral heart, and deep amber base. Ideal for evening wear.",
    base_unit: "%(v/v)",
    flavor_profile: [
      { attribute: "Freshness", value: 25 },
      { attribute: "Intensity", value: 85 },
      { attribute: "Longevity", value: 90 },
      { attribute: "Warmth", value: 95 },
      { attribute: "Sweetness", value: 70 },
    ],
    substances: [
      // Top notes (Head)
      { common_name: "Benzaldehyde", concentration: 1.5, order_index: 1, pyramid_position: "top" },
      { common_name: "Camphor", concentration: 1.0, order_index: 2, pyramid_position: "top" },
      { common_name: "Acetophenone", concentration: 0.8, order_index: 3, pyramid_position: "top" },
      // Heart notes
      { common_name: "Jasmine Sambac absolute", concentration: 4.0, order_index: 4, pyramid_position: "heart" },
      { common_name: "Jasmine Egypt SFE", concentration: 3.0, order_index: 5, pyramid_position: "heart" },
      { common_name: "Geraniol", concentration: 3.0, order_index: 6, pyramid_position: "heart" },
      { common_name: "Black Pepper Oil", concentration: 2.0, order_index: 7, pyramid_position: "heart" },
      { common_name: "Allspice Oil", concentration: 1.5, order_index: 8, pyramid_position: "heart" },
      // Base notes
      { common_name: "Vanilla Absolute", concentration: 5.0, order_index: 9, pyramid_position: "base" },
      { common_name: "Benzoin absolute", concentration: 4.0, order_index: 10, pyramid_position: "base" },
      { common_name: "Sandalwood oil (album)", concentration: 4.0, order_index: 11, pyramid_position: "base" },
      { common_name: "Patchouli oil", concentration: 3.0, order_index: 12, pyramid_position: "base" },
      { common_name: "Coumarin", concentration: 2.0, order_index: 13, pyramid_position: "base" },
    ],
  },
  {
    name: "Floral Garden",
    description:
      "A romantic floral bouquet with fresh green opening, lush floral heart of jasmine and rose-like notes, and a soft powdery base.",
    base_unit: "%(v/v)",
    flavor_profile: [
      { attribute: "Freshness", value: 60 },
      { attribute: "Intensity", value: 65 },
      { attribute: "Longevity", value: 70 },
      { attribute: "Warmth", value: 40 },
      { attribute: "Sweetness", value: 55 },
    ],
    substances: [
      // Top notes (Head)
      { common_name: "(Z)-3-Hexenol", concentration: 1.0, order_index: 1, pyramid_position: "top" },
      { common_name: "Aldehyde C-11 undecylenic", concentration: 0.5, order_index: 2, pyramid_position: "top" },
      { common_name: "Benzyl Acetate", concentration: 3.0, order_index: 3, pyramid_position: "top" },
      { common_name: "Allyl Hexanoate", concentration: 0.5, order_index: 4, pyramid_position: "top" },
      // Heart notes
      { common_name: "Jasmine Sambac absolute", concentration: 6.0, order_index: 5, pyramid_position: "heart" },
      { common_name: "Jasmine Egypt SFE", concentration: 4.0, order_index: 6, pyramid_position: "heart" },
      { common_name: "Geraniol", concentration: 4.0, order_index: 7, pyramid_position: "heart" },
      { common_name: "2-Phenylethanol", concentration: 3.0, order_index: 8, pyramid_position: "heart" },
      { common_name: "Linalool", concentration: 3.0, order_index: 9, pyramid_position: "heart" },
      // Base notes
      { common_name: "Musk R1", concentration: 3.0, order_index: 10, pyramid_position: "base" },
      { common_name: "Musk Z 4", concentration: 2.0, order_index: 11, pyramid_position: "base" },
      { common_name: "Sandalwood oil (album)", concentration: 2.0, order_index: 12, pyramid_position: "base" },
      { common_name: "Cedarwood Virginia", concentration: 2.0, order_index: 13, pyramid_position: "base" },
    ],
  },
  {
    name: "Woody Elegance",
    description:
      "A sophisticated woody fragrance with aromatic top notes, herbal heart, and rich vetiver and cedar base. Perfect for the office.",
    base_unit: "%(v/v)",
    flavor_profile: [
      { attribute: "Freshness", value: 45 },
      { attribute: "Intensity", value: 70 },
      { attribute: "Longevity", value: 85 },
      { attribute: "Warmth", value: 65 },
      { attribute: "Sweetness", value: 20 },
    ],
    substances: [
      // Top notes (Head)
      { common_name: "Bergamot Mint", concentration: 5.0, order_index: 1, pyramid_position: "top" },
      { common_name: "Camphor", concentration: 1.5, order_index: 2, pyramid_position: "top" },
      { common_name: "(-)-Borneol", concentration: 1.0, order_index: 3, pyramid_position: "top" },
      // Heart notes
      { common_name: "Geraniol", concentration: 3.0, order_index: 4, pyramid_position: "heart" },
      { common_name: "Chamomile roman oil", concentration: 2.0, order_index: 5, pyramid_position: "heart" },
      { common_name: "Basil Sweet - Vietnam", concentration: 2.0, order_index: 6, pyramid_position: "heart" },
      { common_name: "Linalool", concentration: 2.0, order_index: 7, pyramid_position: "heart" },
      // Base notes
      { common_name: "Vetiver oil Haiti", concentration: 5.0, order_index: 8, pyramid_position: "base" },
      { common_name: "Cedarwood Virginia", concentration: 6.0, order_index: 9, pyramid_position: "base" },
      { common_name: "Cedarwood Oil Extra", concentration: 3.0, order_index: 10, pyramid_position: "base" },
      { common_name: "Sandalwood oil (album)", concentration: 4.0, order_index: 11, pyramid_position: "base" },
      { common_name: "Patchouli oil", concentration: 2.0, order_index: 12, pyramid_position: "base" },
    ],
  },
  {
    name: "Aquatic Breeze",
    description:
      "A modern marine fragrance with ozonic top notes, watery floral heart, and clean musk base. Evokes the ocean air.",
    base_unit: "%(v/v)",
    flavor_profile: [
      { attribute: "Freshness", value: 95 },
      { attribute: "Intensity", value: 45 },
      { attribute: "Longevity", value: 50 },
      { attribute: "Warmth", value: 15 },
      { attribute: "Sweetness", value: 25 },
    ],
    substances: [
      // Top notes (Head)
      { common_name: "Bergamot Mint", concentration: 5.0, order_index: 1, pyramid_position: "top" },
      { common_name: "Aldehyde C-11 undecylenic", concentration: 0.8, order_index: 2, pyramid_position: "top" },
      { common_name: "Benzyl Acetate", concentration: 3.0, order_index: 3, pyramid_position: "top" },
      { common_name: "(Z)-3-Hexenol", concentration: 1.0, order_index: 4, pyramid_position: "top" },
      // Heart notes
      { common_name: "Linalool", concentration: 3.0, order_index: 5, pyramid_position: "heart" },
      { common_name: "Geraniol", concentration: 2.0, order_index: 6, pyramid_position: "heart" },
      { common_name: "2-Phenylethanol", concentration: 2.0, order_index: 7, pyramid_position: "heart" },
      { common_name: "Cascalone", concentration: 1.5, order_index: 8, pyramid_position: "heart" },
      // Base notes
      { common_name: "Musk R1", concentration: 4.0, order_index: 9, pyramid_position: "base" },
      { common_name: "Musk Z 4", concentration: 2.0, order_index: 10, pyramid_position: "base" },
      { common_name: "Cedarwood Virginia", concentration: 3.0, order_index: 11, pyramid_position: "base" },
      { common_name: "Ambroxan", concentration: 2.0, order_index: 12, pyramid_position: "base" },
    ],
  },
];

// Demo users to create flavours for
const DEMO_USERS = [
  "demo_arthur_dent",
  "demo_ford_prefect",
  "demo_trillian",
];

// =============================================================================
// MAIN FUNCTIONS
// =============================================================================

async function findUserByEmail(email: string): Promise<string | null> {
  const result = await sql`
    SELECT user_id FROM users WHERE email = ${email} LIMIT 1
  `;
  return result.length > 0 ? String(result[0].user_id) : null;
}

async function findSubstanceByName(
  name: string
): Promise<{ substance_id: number; volatility_class: string | null } | null> {
  // Try exact match first
  let result = await sql`
    SELECT substance_id, volatility_class
    FROM substance
    WHERE LOWER(common_name) = LOWER(${name})
    LIMIT 1
  `;

  if (result.length === 0) {
    // Try partial match
    result = await sql`
      SELECT substance_id, volatility_class
      FROM substance
      WHERE LOWER(common_name) LIKE LOWER(${`%${name}%`})
      LIMIT 1
    `;
  }

  return result.length > 0
    ? {
        substance_id: Number(result[0].substance_id),
        volatility_class: result[0].volatility_class as string | null,
      }
    : null;
}

async function getSubstancesWithVolatility(): Promise<
  { substance_id: number; common_name: string; volatility_class: string }[]
> {
  const result = await sql`
    SELECT substance_id, common_name, volatility_class
    FROM substance
    WHERE volatility_class IS NOT NULL
    ORDER BY volatility_class, common_name
    LIMIT 100
  `;
  return result.map((r) => ({
    substance_id: Number(r.substance_id),
    common_name: String(r.common_name),
    volatility_class: String(r.volatility_class),
  }));
}

async function createPerfumeFormula(
  userId: string,
  formula: PerfumeFormula
): Promise<number | null> {
  if (dryRun) {
    console.log(`  [DRY RUN] Would create: ${formula.name}`);
    return null;
  }

  // Create the formula
  const result = await sql`
    INSERT INTO formula (
      name, description, is_public, status, base_unit, user_id,
      flavor_profile, project_type
    )
    VALUES (
      ${formula.name},
      ${formula.description},
      true,
      'published',
      ${formula.base_unit},
      ${userId},
      ${JSON.stringify(formula.flavor_profile)}::jsonb,
      'perfume'
    )
    RETURNING formula_id
  `;

  return Number(result[0].formula_id);
}

async function linkSubstanceToFormula(
  formulaId: number,
  substanceId: number,
  concentration: number,
  unit: string,
  orderIndex: number,
  pyramidPosition?: "top" | "heart" | "base"
): Promise<void> {
  if (dryRun) return;

  await sql`
    INSERT INTO substance_formula (substance_id, formula_id, concentration, unit, order_index, pyramid_position)
    VALUES (${substanceId}, ${formulaId}, ${concentration}, ${unit}, ${orderIndex}, ${pyramidPosition ?? null})
    ON CONFLICT (substance_id, formula_id) DO UPDATE
    SET concentration = ${concentration}, unit = ${unit}, order_index = ${orderIndex}, pyramid_position = ${pyramidPosition ?? null}
  `;
}

async function cleanPyramidData(userIds: string[]): Promise<void> {
  console.log("\nCleaning existing pyramid data...");

  for (const userId of userIds) {
    const result = await sql`
      DELETE FROM formula
      WHERE user_id = ${userId}
      AND project_type = 'perfume'
      RETURNING formula_id, name
    `;

    if (result.length > 0) {
      console.log(`  Deleted ${result.length} perfume formulas for ${userId}`);
    }
  }
}

async function seedForUser(
  userId: string,
  formulas: PerfumeFormula[]
): Promise<void> {
  console.log(`\nSeeding perfume formulas for: ${userId}`);

  for (const formula of formulas) {
    console.log(`  Creating: ${formula.name}`);

    const formulaId = await createPerfumeFormula(userId, formula);
    if (!formulaId) continue;

    let linkedCount = 0;
    let missingCount = 0;

    for (const ingredient of formula.substances) {
      const substance = await findSubstanceByName(ingredient.common_name);

      if (substance) {
        await linkSubstanceToFormula(
          formulaId,
          substance.substance_id,
          ingredient.concentration,
          formula.base_unit,
          ingredient.order_index,
          ingredient.pyramid_position
        );
        linkedCount++;

        if (substance.volatility_class) {
          console.log(
            `    + ${ingredient.common_name} (${substance.volatility_class})`
          );
        } else {
          console.log(`    + ${ingredient.common_name} (no volatility data)`);
        }
      } else {
        missingCount++;
        console.log(`    ! Missing: ${ingredient.common_name}`);
      }
    }

    console.log(
      `    -> Linked ${linkedCount}/${formula.substances.length} substances`
    );
    if (missingCount > 0) {
      console.log(`    -> ${missingCount} substances not found in database`);
    }
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log("Pyramid Visualization Seed Script");
  console.log("=".repeat(60));

  if (dryRun) {
    console.log("\n[DRY RUN MODE - No changes will be made]\n");
  }

  // Check available substances with volatility data
  console.log("\nChecking substances with volatility data...");
  const volatileSubstances = await getSubstancesWithVolatility();
  console.log(`  Found ${volatileSubstances.length} substances with volatility_class`);

  if (volatileSubstances.length === 0) {
    console.log("\n  WARNING: No substances with volatility_class found!");
    console.log("  You may need to import fragrance data first:");
    console.log("    npx tsx scripts/import-fragrance-csv.ts");
    console.log("\n  Continuing anyway with formula creation...\n");
  } else {
    // Show sample by tier
    const byTier = {
      Head: volatileSubstances.filter((s) => s.volatility_class === "Head"),
      "Head/Heart": volatileSubstances.filter(
        (s) => s.volatility_class === "Head/Heart"
      ),
      Heart: volatileSubstances.filter((s) => s.volatility_class === "Heart"),
      "Heart/Base": volatileSubstances.filter(
        (s) => s.volatility_class === "Heart/Base"
      ),
      Base: volatileSubstances.filter((s) => s.volatility_class === "Base"),
    };

    console.log("\n  By volatility tier:");
    for (const [tier, substances] of Object.entries(byTier)) {
      console.log(`    ${tier}: ${substances.length} substances`);
    }
  }

  // Build list of user IDs to seed
  const userIds: string[] = [];

  // Find target user by email
  console.log(`\nLooking up user: ${targetEmail}`);
  const userId = await findUserByEmail(targetEmail);
  if (userId) {
    console.log(`  Found: ${userId}`);
    userIds.push(userId);
  } else {
    console.log(`  Not found in database`);
  }

  // Check demo users
  console.log("\nChecking demo users...");
  for (const demoId of DEMO_USERS) {
    const exists = await sql`SELECT user_id FROM users WHERE user_id = ${demoId} LIMIT 1`;
    if (exists.length > 0) {
      console.log(`  Found: ${demoId}`);
      userIds.push(demoId);
    } else {
      console.log(`  Not found: ${demoId}`);
    }
  }

  if (userIds.length === 0) {
    console.log("\nNo valid users found. Exiting.");
    process.exit(1);
  }

  // Clean mode
  if (cleanMode) {
    await cleanPyramidData(userIds);
    console.log("\nClean complete.");
    if (!dryRun) {
      process.exit(0);
    }
  }

  // Seed formulas for each user
  for (const uid of userIds) {
    await seedForUser(uid, PERFUME_FORMULAS);
  }

  console.log("\n" + "=".repeat(60));
  console.log("Done!");
  console.log("=".repeat(60));
  console.log("\nTo view the pyramid visualization:");
  console.log("  1. Go to /flavours");
  console.log("  2. Click on a perfume formula");
  console.log("  3. Look for the Olfactive Pyramid card");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
