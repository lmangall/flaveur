-- Add perfumery-specific columns to substance table
ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "source_datasets" varchar(255);
ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "log_p" varchar(50);
ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "vapor_pressure" varchar(200);
ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "density" varchar(500);
ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "refractive_index" varchar(500);
ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "odor_profile_tags" jsonb;
ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "olfactive_family" varchar(100);
ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "volatility_class" varchar(20);
ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "substantivity" varchar(50);
ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "uses_in_perfumery" text;
ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "inchikey" varchar(100);
ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "pubchem_enriched" boolean;
ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "domain" varchar(20) DEFAULT 'flavor';

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS "idx_substance_volatility_class" ON "substance" USING btree ("volatility_class") WHERE (volatility_class IS NOT NULL);
CREATE INDEX IF NOT EXISTS "idx_substance_olfactive_family" ON "substance" USING btree ("olfactive_family") WHERE (olfactive_family IS NOT NULL);
CREATE INDEX IF NOT EXISTS "idx_substance_domain" ON "substance" USING btree ("domain");
CREATE INDEX IF NOT EXISTS "idx_substance_inchikey" ON "substance" USING btree ("inchikey") WHERE (inchikey IS NOT NULL);
