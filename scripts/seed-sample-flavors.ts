/**
 * Seed sample flavors for the demo user (Arthur Dent)
 *
 * This script creates the demo user and duplicates specified flavors as samples.
 * The samples will be visible on the /samples page for all users.
 * NOTE: Prefer using seed-demo-users.ts which creates demo users with full profiles.
 *
 * Usage:
 *   npx tsx scripts/seed-sample-flavors.ts --flavour-ids=1,2,3
 *   npx tsx scripts/seed-sample-flavors.ts --list         # List all flavors with variation groups
 *   npx tsx scripts/seed-sample-flavors.ts --dry-run --flavour-ids=1,2,3
 *
 * Options:
 *   --flavour-ids=N,N,N   Comma-separated list of flavour IDs to duplicate
 *   --list                List all flavors that have variation groups
 *   --dry-run             Preview changes without writing to database
 *   --clean               Remove all flavors owned by demo user (reset samples)
 *
 * Prerequisites:
 *   - DATABASE_URL environment variable must be set
 */

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { join } from "path";

// Load environment variables from .env.local
config({ path: join(__dirname, "../.env.local") });

// Use the same demo user as seed-demo-users.ts for consistency
const DEMO_USER = {
  user_id: "demo_arthur_dent",
  email: "arthur.dent@example.com",
  username: "Arthur Dent",
};

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// Parse command line arguments
const args = process.argv.slice(2);
const flavourIdsArg = args.find((a) => a.startsWith("--flavour-ids="));
const listMode = args.includes("--list");
const dryRun = args.includes("--dry-run");
const cleanMode = args.includes("--clean");

interface Flavour {
  flavour_id: number;
  name: string;
  description: string | null;
  status: string;
  base_unit: string;
  is_public: boolean;
  version: number;
  flavor_profile: unknown;
  category_id: number | null;
  variation_group_id: number | null;
  variation_label: string | null;
  is_main_variation: boolean;
  user_id: string;
}

interface VariationGroup {
  group_id: number;
  name: string;
  description: string | null;
}

interface SubstanceFlavour {
  substance_id: number;
  concentration: number | null;
  unit: string | null;
  order_index: number | null;
  supplier: string | null;
  dilution: string | null;
  price_per_kg: number | null;
}

async function ensureDemoUser(): Promise<void> {
  console.log(`\nEnsuring demo user exists: ${DEMO_USER.username}`);

  const existing = await sql`
    SELECT user_id FROM users WHERE user_id = ${DEMO_USER.user_id}
  `;

  if (existing.length === 0) {
    if (!dryRun) {
      await sql`
        INSERT INTO users (user_id, email, username)
        VALUES (${DEMO_USER.user_id}, ${DEMO_USER.email}, ${DEMO_USER.username})
      `;
      console.log(`✓ Created demo user: ${DEMO_USER.username}`);
    } else {
      console.log(`[DRY RUN] Would create demo user: ${DEMO_USER.username}`);
    }
  } else {
    console.log(`✓ Demo user already exists: ${DEMO_USER.username}`);
  }
}

async function listFlavoursWithVariations(): Promise<void> {
  console.log("\n=== Flavors with Variation Groups ===\n");

  const flavours = await sql`
    SELECT
      f.flavour_id,
      f.name,
      f.user_id,
      f.variation_group_id,
      f.variation_label,
      f.is_main_variation,
      vg.name as group_name,
      u.username as owner
    FROM flavour f
    LEFT JOIN variation_group vg ON f.variation_group_id = vg.group_id
    LEFT JOIN users u ON f.user_id = u.user_id
    WHERE f.variation_group_id IS NOT NULL
    ORDER BY f.variation_group_id, f.is_main_variation DESC, f.flavour_id
  `;

  if (flavours.length === 0) {
    console.log("No flavors with variation groups found.");
    return;
  }

  let currentGroup: number | null = null;
  for (const f of flavours) {
    if (f.variation_group_id !== currentGroup) {
      currentGroup = f.variation_group_id as number;
      console.log(`\n[Group ${currentGroup}] ${f.group_name || "Unnamed"} (Owner: ${f.owner || f.user_id})`);
    }
    const mainFlag = f.is_main_variation ? " [MAIN]" : "";
    console.log(`  ID ${f.flavour_id}: ${f.name} (${f.variation_label || "no label"})${mainFlag}`);
  }

  console.log("\n---");
  console.log("To duplicate a flavor group as samples, run:");
  console.log("  npx tsx scripts/seed-sample-flavors.ts --flavour-ids=<id>");
  console.log("(Use the ID of any flavor in the group - all variations will be copied)");
}

async function cleanDemoFlavors(): Promise<void> {
  console.log("\n=== Cleaning Demo User Flavors ===\n");

  if (dryRun) {
    const count = await sql`
      SELECT COUNT(*) as count FROM flavour WHERE user_id = ${DEMO_USER.user_id}
    `;
    console.log(`[DRY RUN] Would delete ${count[0].count} flavors owned by ${DEMO_USER.username}`);
    return;
  }

  // Delete variation groups first (flavors will cascade due to FK)
  const groupsDeleted = await sql`
    DELETE FROM variation_group WHERE user_id = ${DEMO_USER.user_id}
    RETURNING group_id
  `;

  // Delete any remaining flavors (those without variation groups)
  const flavoursDeleted = await sql`
    DELETE FROM flavour WHERE user_id = ${DEMO_USER.user_id}
    RETURNING flavour_id
  `;

  console.log(`✓ Deleted ${groupsDeleted.length} variation groups`);
  console.log(`✓ Deleted ${flavoursDeleted.length} flavors`);
}

async function duplicateFlavour(sourceFlavourId: number): Promise<void> {
  console.log(`\n--- Duplicating flavour ID ${sourceFlavourId} ---`);

  // Get the source flavour
  const sourceResult = await sql`
    SELECT * FROM flavour WHERE flavour_id = ${sourceFlavourId}
  `;

  if (sourceResult.length === 0) {
    console.error(`✗ Flavour ID ${sourceFlavourId} not found`);
    return;
  }

  const source = sourceResult[0] as Flavour;

  // Check if this flavour belongs to a variation group
  if (source.variation_group_id) {
    // Duplicate the entire variation group
    await duplicateVariationGroup(source.variation_group_id);
  } else {
    // Duplicate single flavour
    await duplicateSingleFlavour(source);
  }
}

async function duplicateVariationGroup(groupId: number): Promise<void> {
  console.log(`Duplicating variation group ID ${groupId} with all variations...`);

  // Get the variation group
  const groupResult = await sql`
    SELECT * FROM variation_group WHERE group_id = ${groupId}
  `;

  if (groupResult.length === 0) {
    console.error(`✗ Variation group ID ${groupId} not found`);
    return;
  }

  const sourceGroup = groupResult[0] as VariationGroup;

  // Check if demo user already has this group (by name)
  const existingGroup = await sql`
    SELECT group_id FROM variation_group
    WHERE user_id = ${DEMO_USER.user_id} AND name = ${sourceGroup.name}
  `;

  if (existingGroup.length > 0) {
    console.log(`✓ Variation group "${sourceGroup.name}" already exists for demo user, skipping`);
    return;
  }

  // Get all flavours in the group
  const groupFlavours = await sql`
    SELECT * FROM flavour WHERE variation_group_id = ${groupId}
    ORDER BY is_main_variation DESC, flavour_id
  `;

  if (groupFlavours.length === 0) {
    console.error(`✗ No flavours found in variation group ${groupId}`);
    return;
  }

  if (dryRun) {
    console.log(`[DRY RUN] Would create variation group: ${sourceGroup.name}`);
    console.log(`[DRY RUN] Would duplicate ${groupFlavours.length} flavours:`);
    for (const f of groupFlavours) {
      console.log(`  - ${f.name} (${f.variation_label || "no label"})`);
    }
    return;
  }

  // Create new variation group for demo user
  const newGroupResult = await sql`
    INSERT INTO variation_group (name, description, user_id)
    VALUES (${sourceGroup.name}, ${sourceGroup.description}, ${DEMO_USER.user_id})
    RETURNING group_id
  `;
  const newGroupId = newGroupResult[0].group_id as number;
  console.log(`✓ Created variation group: ${sourceGroup.name} (ID: ${newGroupId})`);

  // Duplicate each flavour in the group
  for (const sourceFlavour of groupFlavours) {
    const f = sourceFlavour as Flavour;
    const newFlavour = await sql`
      INSERT INTO flavour (
        name, description, is_public, user_id, category_id, status,
        version, base_unit, flavor_profile, variation_group_id,
        variation_label, is_main_variation
      )
      VALUES (
        ${f.name}, ${f.description}, true, ${DEMO_USER.user_id}, ${f.category_id},
        'published', ${f.version}, ${f.base_unit}, ${JSON.stringify(f.flavor_profile)},
        ${newGroupId}, ${f.variation_label}, ${f.is_main_variation}
      )
      RETURNING flavour_id
    `;
    const newFlavourId = newFlavour[0].flavour_id as number;

    // Copy substances
    await copySubstances(f.flavour_id, newFlavourId);
    console.log(`  ✓ Duplicated: ${f.name} (ID: ${newFlavourId})`);
  }
}

async function duplicateSingleFlavour(source: Flavour): Promise<void> {
  // Check if demo user already has this flavour (by name)
  const existing = await sql`
    SELECT flavour_id FROM flavour
    WHERE user_id = ${DEMO_USER.user_id} AND name = ${source.name}
  `;

  if (existing.length > 0) {
    console.log(`✓ Flavour "${source.name}" already exists for demo user, skipping`);
    return;
  }

  if (dryRun) {
    console.log(`[DRY RUN] Would duplicate: ${source.name}`);
    return;
  }

  const newFlavour = await sql`
    INSERT INTO flavour (
      name, description, is_public, user_id, category_id, status,
      version, base_unit, flavor_profile
    )
    VALUES (
      ${source.name}, ${source.description}, true, ${DEMO_USER.user_id},
      ${source.category_id}, 'published', ${source.version}, ${source.base_unit},
      ${JSON.stringify(source.flavor_profile)}
    )
    RETURNING flavour_id
  `;
  const newFlavourId = newFlavour[0].flavour_id as number;

  // Copy substances
  await copySubstances(source.flavour_id, newFlavourId);
  console.log(`✓ Duplicated: ${source.name} (ID: ${newFlavourId})`);
}

async function copySubstances(
  sourceFlavourId: number,
  targetFlavourId: number
): Promise<void> {
  const substances = await sql`
    SELECT substance_id, concentration, unit, order_index, supplier, dilution, price_per_kg
    FROM substance_flavour
    WHERE flavour_id = ${sourceFlavourId}
  `;

  for (const s of substances as SubstanceFlavour[]) {
    await sql`
      INSERT INTO substance_flavour (
        substance_id, flavour_id, concentration, unit, order_index, supplier, dilution, price_per_kg
      )
      VALUES (
        ${s.substance_id}, ${targetFlavourId}, ${s.concentration}, ${s.unit},
        ${s.order_index}, ${s.supplier}, ${s.dilution}, ${s.price_per_kg}
      )
      ON CONFLICT (substance_id, flavour_id) DO NOTHING
    `;
  }
}

async function main(): Promise<void> {
  console.log("=== Sample Flavors Seed Script ===");
  console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);

  if (listMode) {
    await listFlavoursWithVariations();
    return;
  }

  if (cleanMode) {
    await ensureDemoUser();
    await cleanDemoFlavors();
    return;
  }

  if (!flavourIdsArg) {
    console.log("\nUsage:");
    console.log("  npx tsx scripts/seed-sample-flavors.ts --list");
    console.log("  npx tsx scripts/seed-sample-flavors.ts --flavour-ids=1,2,3");
    console.log("  npx tsx scripts/seed-sample-flavors.ts --clean");
    console.log("  npx tsx scripts/seed-sample-flavors.ts --dry-run --flavour-ids=1,2,3");
    return;
  }

  await ensureDemoUser();

  const flavourIds = flavourIdsArg
    .split("=")[1]
    .split(",")
    .map((id) => parseInt(id.trim()))
    .filter((id) => !isNaN(id));

  if (flavourIds.length === 0) {
    console.error("No valid flavour IDs provided");
    return;
  }

  console.log(`\nDuplicating ${flavourIds.length} flavour(s) to demo user...`);

  for (const id of flavourIds) {
    await duplicateFlavour(id);
  }

  console.log("\n=== Done ===");
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
