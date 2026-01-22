-- Migration: Add unique constraints for substance identifiers
-- Date: 2026-01-22
-- Description: Ensures FEMA numbers and CAS IDs are unique when present

-- ============================================
-- 1. CHECK FOR EXISTING DUPLICATES
-- ============================================

-- These queries help identify duplicates before applying constraints
-- Run these first to check data quality:
-- SELECT fema_number, COUNT(*) FROM substance WHERE fema_number > 0 GROUP BY fema_number HAVING COUNT(*) > 1;
-- SELECT cas_id, COUNT(*) FROM substance WHERE cas_id IS NOT NULL AND cas_id != '' GROUP BY cas_id HAVING COUNT(*) > 1;

-- ============================================
-- 2. UNIQUE CONSTRAINT ON FEMA NUMBER
-- ============================================

-- Partial unique index: only enforces uniqueness for positive FEMA numbers
-- (0 or NULL values are not constrained - allows substances without FEMA)
CREATE UNIQUE INDEX IF NOT EXISTS idx_substance_fema_unique
ON substance(fema_number) WHERE fema_number > 0;

-- ============================================
-- 3. UNIQUE CONSTRAINT ON CAS ID
-- ============================================

-- Partial unique index: only enforces uniqueness for non-empty CAS IDs
CREATE UNIQUE INDEX IF NOT EXISTS idx_substance_cas_unique
ON substance(cas_id) WHERE cas_id IS NOT NULL AND cas_id != '';

-- ============================================
-- 4. UNIQUE CONSTRAINT ON PUBCHEM CID
-- ============================================

-- Partial unique index: only enforces uniqueness for non-null PubChem CIDs
CREATE UNIQUE INDEX IF NOT EXISTS idx_substance_pubchem_unique
ON substance(pubchem_id) WHERE pubchem_id IS NOT NULL;

-- ============================================
-- 5. UNIQUE CONSTRAINT ON INCHI KEY
-- ============================================

-- InChI keys should be unique per compound
CREATE UNIQUE INDEX IF NOT EXISTS idx_substance_inchi_unique
ON substance(inchi) WHERE inchi IS NOT NULL AND inchi != '';
