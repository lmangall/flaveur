/**
 * Migration script: Migrate functional groups from VARCHAR field to normalized tables
 *
 * Run with: npx tsx scripts/migrate-functional-groups.ts
 *
 * Prerequisites:
 * - Migration 013 must be applied first (creates functional_group and substance_functional_group tables)
 * - DATABASE_URL environment variable must be set
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

async function migrateFunctionalGroups() {
  console.log("Starting functional groups migration...\n");

  // Get all substances with functional_groups data
  const substances = await sql`
    SELECT substance_id, common_name, functional_groups
    FROM substance
    WHERE functional_groups IS NOT NULL AND functional_groups != ''
  `;

  console.log(`Found ${substances.length} substances with functional groups\n`);

  // Get existing functional groups
  const groups = await sql`SELECT functional_group_id, name FROM functional_group`;
  const groupMap = new Map<string, number>(
    groups.map((g) => [
      (g.name as string).toLowerCase(),
      g.functional_group_id as number,
    ])
  );

  console.log(`Existing functional groups: ${groupMap.size}\n`);

  let processed = 0;
  let linkedTotal = 0;
  let newGroupsCreated = 0;

  for (const sub of substances) {
    const substanceId = sub.substance_id as number;
    const functionalGroups = sub.functional_groups as string;

    // Parse comma/semicolon separated groups
    const groupNames = functionalGroups
      .split(/[,;]/)
      .map((g: string) => g.trim())
      .filter((g: string) => g.length > 0);

    for (const rawName of groupNames) {
      const normalizedName = rawName.toLowerCase();
      let groupId = groupMap.get(normalizedName);

      // Create new group if doesn't exist
      if (!groupId) {
        const capitalizedName =
          rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();
        const [newGroup] = await sql`
          INSERT INTO functional_group (name)
          VALUES (${capitalizedName})
          ON CONFLICT (name) DO NOTHING
          RETURNING functional_group_id
        `;

        if (newGroup) {
          groupId = newGroup.functional_group_id as number;
          groupMap.set(normalizedName, groupId);
          newGroupsCreated++;
          console.log(`  Created new group: ${capitalizedName}`);
        } else {
          // Conflict - group was created by another row, fetch it
          const [existing] = await sql`
            SELECT functional_group_id FROM functional_group
            WHERE LOWER(name) = ${normalizedName}
          `;
          if (existing) {
            groupId = existing.functional_group_id as number;
            groupMap.set(normalizedName, groupId);
          }
        }
      }

      if (groupId) {
        await sql`
          INSERT INTO substance_functional_group (substance_id, functional_group_id)
          VALUES (${substanceId}, ${groupId})
          ON CONFLICT DO NOTHING
        `;
        linkedTotal++;
      }
    }

    processed++;
    if (processed % 100 === 0) {
      console.log(`Processed ${processed}/${substances.length} substances...`);
    }
  }

  console.log("\n--- Migration Summary ---");
  console.log(`Substances processed: ${processed}`);
  console.log(`New functional groups created: ${newGroupsCreated}`);
  console.log(`Total links created: ${linkedTotal}`);
  console.log("\nMigration complete!");
}

migrateFunctionalGroups().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
