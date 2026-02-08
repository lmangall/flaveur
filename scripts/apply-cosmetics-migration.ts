import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Applying cosmetics migration...\n");

  // Formula table - add cosmetic columns
  console.log("1. Adding project_type to formula...");
  await sql`ALTER TABLE "formula" ADD COLUMN IF NOT EXISTS "project_type" varchar(20) DEFAULT 'flavor'`;
  console.log("   ✓");

  console.log("2. Adding cosmetic_product_type to formula...");
  await sql`ALTER TABLE "formula" ADD COLUMN IF NOT EXISTS "cosmetic_product_type" varchar(30)`;
  console.log("   ✓");

  console.log("3. Adding target_ph to formula...");
  await sql`ALTER TABLE "formula" ADD COLUMN IF NOT EXISTS "target_ph" double precision`;
  console.log("   ✓");

  console.log("4. Adding preservative_system to formula...");
  await sql`ALTER TABLE "formula" ADD COLUMN IF NOT EXISTS "preservative_system" text`;
  console.log("   ✓");

  console.log("5. Adding manufacturing_notes to formula...");
  await sql`ALTER TABLE "formula" ADD COLUMN IF NOT EXISTS "manufacturing_notes" text`;
  console.log("   ✓");

  // Substance formula table - add phase
  console.log("6. Adding phase to substance_formula...");
  await sql`ALTER TABLE "substance_formula" ADD COLUMN IF NOT EXISTS "phase" varchar(20)`;
  console.log("   ✓");

  // Substance table - add cosmetic columns
  console.log("7. Adding inci_name to substance...");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "inci_name" varchar(500)`;
  console.log("   ✓");

  console.log("8. Adding cosmetic_role to substance...");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "cosmetic_role" jsonb`;
  console.log("   ✓");

  console.log("9. Adding hlb_value to substance...");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "hlb_value" double precision`;
  console.log("   ✓");

  console.log("10. Adding hlb_required to substance...");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "hlb_required" double precision`;
  console.log("   ✓");

  console.log("11. Adding ph_range_min to substance...");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "ph_range_min" double precision`;
  console.log("   ✓");

  console.log("12. Adding ph_range_max to substance...");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "ph_range_max" double precision`;
  console.log("   ✓");

  console.log("13. Adding water_solubility to substance...");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "water_solubility" varchar(100)`;
  console.log("   ✓");

  // CHECK constraints
  console.log("14. Adding project_type CHECK constraint...");
  try {
    await sql`ALTER TABLE "formula" ADD CONSTRAINT "formula_project_type_check" CHECK ((project_type)::text = ANY (ARRAY['flavor'::text, 'perfume'::text, 'cosmetic'::text]) OR project_type IS NULL)`;
    console.log("   ✓");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("already exists")) {
      console.log("   ⚠ Already exists, skipping");
    } else {
      throw err;
    }
  }

  console.log("15. Adding phase CHECK constraint...");
  try {
    await sql`ALTER TABLE "substance_formula" ADD CONSTRAINT "substance_formula_phase_check" CHECK ((phase)::text = ANY (ARRAY['water'::text, 'oil'::text, 'cool_down'::text, 'surfactant'::text, 'dry'::text]) OR phase IS NULL)`;
    console.log("   ✓");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("already exists")) {
      console.log("   ⚠ Already exists, skipping");
    } else {
      throw err;
    }
  }

  console.log("\n✓ Cosmetics migration complete!");
}

main().catch((err) => {
  console.error("\nMigration failed:", err);
  process.exit(1);
});
