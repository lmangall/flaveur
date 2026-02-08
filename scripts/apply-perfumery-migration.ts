import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env.local") });

const sql = neon(process.env.DATABASE_URL!);

async function run() {
  console.log("Applying migration: perfumery schema extension...\n");

  // Flavour table
  await sql`ALTER TABLE "flavour" ADD COLUMN IF NOT EXISTS "project_type" varchar(20) DEFAULT 'flavor'`;
  console.log("  ✓ flavour.project_type");
  await sql`ALTER TABLE "flavour" ADD COLUMN IF NOT EXISTS "concentration_type" varchar(20)`;
  console.log("  ✓ flavour.concentration_type");

  // Substance table - perfumery columns
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "volatility_class" varchar(20)`;
  console.log("  ✓ substance.volatility_class");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "olfactive_family" varchar(100)`;
  console.log("  ✓ substance.olfactive_family");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "odor_profile_tags" jsonb`;
  console.log("  ✓ substance.odor_profile_tags");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "substantivity" varchar(50)`;
  console.log("  ✓ substance.substantivity");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "performance_notes" text`;
  console.log("  ✓ substance.performance_notes");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "uses_in_perfumery" text`;
  console.log("  ✓ substance.uses_in_perfumery");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "use_level" varchar(100)`;
  console.log("  ✓ substance.use_level");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "stability_notes" text`;
  console.log("  ✓ substance.stability_notes");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "price_range" varchar(20)`;
  console.log("  ✓ substance.price_range");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "is_blend" boolean`;
  console.log("  ✓ substance.is_blend");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "botanical_name" varchar(500)`;
  console.log("  ✓ substance.botanical_name");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "extraction_process" text`;
  console.log("  ✓ substance.extraction_process");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "major_components" text`;
  console.log("  ✓ substance.major_components");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "vegan" boolean`;
  console.log("  ✓ substance.vegan");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "biodegradability" varchar(100)`;
  console.log("  ✓ substance.biodegradability");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "renewable_pct" varchar(50)`;
  console.log("  ✓ substance.renewable_pct");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "appearance" varchar(255)`;
  console.log("  ✓ substance.appearance");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "density" varchar(100)`;
  console.log("  ✓ substance.density");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "refractive_index" varchar(100)`;
  console.log("  ✓ substance.refractive_index");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "optical_rotation" varchar(100)`;
  console.log("  ✓ substance.optical_rotation");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "flash_point" varchar(100)`;
  console.log("  ✓ substance.flash_point");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "vapor_pressure" varchar(200)`;
  console.log("  ✓ substance.vapor_pressure");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "inchikey" varchar(100)`;
  console.log("  ✓ substance.inchikey");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "log_p" varchar(50)`;
  console.log("  ✓ substance.log_p");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "source_datasets" varchar(255)`;
  console.log("  ✓ substance.source_datasets");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "review_flags" text`;
  console.log("  ✓ substance.review_flags");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "pubchem_enriched" boolean`;
  console.log("  ✓ substance.pubchem_enriched");
  await sql`ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "domain" varchar(20) DEFAULT 'flavor'`;
  console.log("  ✓ substance.domain");

  // Indexes
  await sql`CREATE INDEX IF NOT EXISTS "idx_substance_volatility_class" ON "substance" USING btree ("volatility_class") WHERE (volatility_class IS NOT NULL)`;
  console.log("  ✓ idx_substance_volatility_class");
  await sql`CREATE INDEX IF NOT EXISTS "idx_substance_olfactive_family" ON "substance" USING btree ("olfactive_family") WHERE (olfactive_family IS NOT NULL)`;
  console.log("  ✓ idx_substance_olfactive_family");
  await sql`CREATE INDEX IF NOT EXISTS "idx_substance_domain" ON "substance" USING btree ("domain")`;
  console.log("  ✓ idx_substance_domain");
  await sql`CREATE INDEX IF NOT EXISTS "idx_substance_inchikey" ON "substance" USING btree ("inchikey") WHERE (inchikey IS NOT NULL)`;
  console.log("  ✓ idx_substance_inchikey");

  console.log("\n✓ Migration complete! 34 statements applied.");
}

run().catch(console.error);
