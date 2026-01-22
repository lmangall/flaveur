-- Migration: Add EU regulatory identifiers
-- Date: 2026-01-22
-- Description: Adds FL (FLAVIS), CoE, and JECFA number fields for EU database integration

-- ============================================
-- 1. ADD EU IDENTIFIER COLUMNS
-- ============================================

-- FL number (FLAVIS - EU flavouring information system)
-- Format: XX.XXX (e.g., 05.001)
ALTER TABLE substance ADD COLUMN IF NOT EXISTS fl_number VARCHAR(20);

-- CoE number (Council of Europe)
ALTER TABLE substance ADD COLUMN IF NOT EXISTS coe_number VARCHAR(20);

-- JECFA number (Joint FAO/WHO Expert Committee on Food Additives)
ALTER TABLE substance ADD COLUMN IF NOT EXISTS jecfa_number INTEGER;

-- ============================================
-- 2. ADD INDEXES FOR LOOKUPS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_substance_fl_number
ON substance(fl_number) WHERE fl_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_substance_coe_number
ON substance(coe_number) WHERE coe_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_substance_jecfa_number
ON substance(jecfa_number) WHERE jecfa_number IS NOT NULL;

-- ============================================
-- 3. ADD UNIQUE CONSTRAINTS
-- ============================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_substance_fl_unique
ON substance(fl_number) WHERE fl_number IS NOT NULL AND fl_number != '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_substance_coe_unique
ON substance(coe_number) WHERE coe_number IS NOT NULL AND coe_number != '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_substance_jecfa_unique
ON substance(jecfa_number) WHERE jecfa_number IS NOT NULL;

-- ============================================
-- 4. UPDATE SEARCH VECTOR FUNCTION
-- ============================================

-- Update the search vector function to include new identifier fields
CREATE OR REPLACE FUNCTION substance_search_vector_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.common_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.alternative_names, ' '), '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.iupac_name, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.flavor_profile, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.fema_flavor_profile, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.olfactory_taste_notes, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.odor, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.taste, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'D') ||
        setweight(to_tsvector('english', COALESCE(NEW.common_applications, '')), 'D') ||
        setweight(to_tsvector('english', COALESCE(NEW.functional_groups, '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. ADD COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON COLUMN substance.fl_number IS 'FLAVIS number from EU Food Flavourings Database (format: XX.XXX)';
COMMENT ON COLUMN substance.coe_number IS 'Council of Europe flavouring substance number';
COMMENT ON COLUMN substance.jecfa_number IS 'JECFA (Joint FAO/WHO Expert Committee on Food Additives) number';
