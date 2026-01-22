-- Migration: Add full-text search for substances
-- Date: 2026-01-22
-- Description: Adds tsvector column with GIN index for fast text search

-- ============================================
-- 1. ADD TSVECTOR COLUMN FOR FULL-TEXT SEARCH
-- ============================================

-- Add the search vector column
ALTER TABLE substance ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- ============================================
-- 2. CREATE GIN INDEX FOR FAST SEARCH
-- ============================================

CREATE INDEX IF NOT EXISTS idx_substance_search_vector
ON substance USING GIN (search_vector);

-- ============================================
-- 3. CREATE FUNCTION TO UPDATE SEARCH VECTOR
-- ============================================

-- Function to build search vector with weighted fields
-- Weights: A (highest) - common_name, B - alternative_names, C - flavor/odor, D (lowest) - other fields
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
-- 4. CREATE TRIGGER FOR AUTO-UPDATE
-- ============================================

DROP TRIGGER IF EXISTS substance_search_vector_trigger ON substance;
CREATE TRIGGER substance_search_vector_trigger
    BEFORE INSERT OR UPDATE OF
        common_name, alternative_names, iupac_name, flavor_profile,
        fema_flavor_profile, olfactory_taste_notes, odor, taste,
        description, common_applications, functional_groups
    ON substance
    FOR EACH ROW
    EXECUTE FUNCTION substance_search_vector_update();

-- ============================================
-- 5. POPULATE EXISTING ROWS
-- ============================================

-- Update all existing rows to populate search_vector
UPDATE substance SET
    search_vector =
        setweight(to_tsvector('english', COALESCE(common_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(alternative_names, ' '), '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(iupac_name, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(flavor_profile, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(fema_flavor_profile, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(olfactory_taste_notes, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(odor, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(taste, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(description, '')), 'D') ||
        setweight(to_tsvector('english', COALESCE(common_applications, '')), 'D') ||
        setweight(to_tsvector('english', COALESCE(functional_groups, '')), 'D');
