-- Migration: Add EU policy code column
-- Date: 2026-01-22
-- Description: Adds eu_policy_code column for EU Food Flavourings database matching
--              (The new EU API uses policy codes instead of FL numbers)

-- ============================================
-- 1. ADD EU POLICY CODE COLUMN
-- ============================================

-- EU policy item code (e.g., POL-FFL-IMPORT-4227)
-- This is the identifier used in the new EU Food Flavourings database
ALTER TABLE substance ADD COLUMN IF NOT EXISTS eu_policy_code VARCHAR(50);

-- ============================================
-- 2. ADD INDEX FOR LOOKUPS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_substance_eu_policy_code
ON substance(eu_policy_code) WHERE eu_policy_code IS NOT NULL;

-- ============================================
-- 3. ADD UNIQUE CONSTRAINT
-- ============================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_substance_eu_policy_code_unique
ON substance(eu_policy_code) WHERE eu_policy_code IS NOT NULL AND eu_policy_code != '';

-- ============================================
-- 4. ADD COMMENT
-- ============================================

COMMENT ON COLUMN substance.eu_policy_code IS 'EU Food Flavourings database policy item code (format: POL-FFL-IMPORT-XXXX)';
