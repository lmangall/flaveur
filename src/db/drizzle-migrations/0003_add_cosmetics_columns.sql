-- Add cosmetics-specific columns to formula table
ALTER TABLE "formula" ADD COLUMN IF NOT EXISTS "project_type" varchar(20) DEFAULT 'flavor';
ALTER TABLE "formula" ADD COLUMN IF NOT EXISTS "cosmetic_product_type" varchar(30);
ALTER TABLE "formula" ADD COLUMN IF NOT EXISTS "target_ph" double precision;
ALTER TABLE "formula" ADD COLUMN IF NOT EXISTS "preservative_system" text;
ALTER TABLE "formula" ADD COLUMN IF NOT EXISTS "manufacturing_notes" text;

-- Add phase column to substance_formula table
ALTER TABLE "substance_formula" ADD COLUMN IF NOT EXISTS "phase" varchar(20);

-- Add cosmetics-specific columns to substance table
ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "inci_name" varchar(500);
ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "cosmetic_role" jsonb;
ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "hlb_value" double precision;
ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "hlb_required" double precision;
ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "ph_range_min" double precision;
ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "ph_range_max" double precision;
ALTER TABLE "substance" ADD COLUMN IF NOT EXISTS "water_solubility" varchar(100);

-- Add CHECK constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'formula_project_type_check'
  ) THEN
    ALTER TABLE "formula" ADD CONSTRAINT "formula_project_type_check"
      CHECK ((project_type)::text = ANY (ARRAY[('flavor'::character varying)::text, ('perfume'::character varying)::text, ('cosmetic'::character varying)::text]) OR project_type IS NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'substance_formula_phase_check'
  ) THEN
    ALTER TABLE "substance_formula" ADD CONSTRAINT "substance_formula_phase_check"
      CHECK ((phase)::text = ANY (ARRAY[('water'::character varying)::text, ('oil'::character varying)::text, ('cool_down'::character varying)::text, ('surfactant'::character varying)::text, ('dry'::character varying)::text]) OR phase IS NULL);
  END IF;
END $$;
