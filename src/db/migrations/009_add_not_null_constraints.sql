-- Migration: Add NOT NULL constraints for required fields
-- Date: 2026-01-22
-- Description: Ensures critical fields have values

-- ============================================
-- 1. FILL MISSING common_name VALUES
-- ============================================

-- First, fill any NULL common_names using available data
UPDATE substance
SET common_name = COALESCE(
    iupac_name,
    CASE WHEN fema_number > 0 THEN 'FEMA #' || fema_number::text ELSE NULL END,
    CASE WHEN cas_id IS NOT NULL AND cas_id != '' THEN 'CAS ' || cas_id ELSE NULL END,
    'Substance #' || substance_id::text
)
WHERE common_name IS NULL;

-- ============================================
-- 2. ADD NOT NULL CONSTRAINT ON common_name
-- ============================================

ALTER TABLE substance ALTER COLUMN common_name SET NOT NULL;

-- ============================================
-- 3. ADD CHECK CONSTRAINTS FOR DATA VALIDITY
-- ============================================

-- Ensure molecular weight is positive when present
ALTER TABLE substance ADD CONSTRAINT chk_molecular_weight_positive
CHECK (molecular_weight IS NULL OR molecular_weight > 0);

-- Ensure FEMA number is non-negative
ALTER TABLE substance ADD CONSTRAINT chk_fema_number_non_negative
CHECK (fema_number IS NULL OR fema_number >= 0);

-- Ensure exact mass is positive when present
ALTER TABLE substance ADD CONSTRAINT chk_exact_mass_positive
CHECK (exact_mass IS NULL OR exact_mass > 0);

-- ============================================
-- 4. SET DEFAULT VALUES FOR BOOLEAN FIELDS
-- ============================================

-- Default boolean flags to false instead of null
UPDATE substance SET is_natural = false WHERE is_natural IS NULL;
UPDATE substance SET synthetic = false WHERE synthetic IS NULL;
UPDATE substance SET unknown_natural = false WHERE unknown_natural IS NULL;

-- Add defaults for future inserts
ALTER TABLE substance ALTER COLUMN is_natural SET DEFAULT false;
ALTER TABLE substance ALTER COLUMN synthetic SET DEFAULT false;
ALTER TABLE substance ALTER COLUMN unknown_natural SET DEFAULT false;
