-- Migration: Add performance indexes for substances
-- Date: 2026-01-22
-- Description: Adds partial and specialized indexes for common query patterns

-- ============================================
-- 1. PARTIAL INDEXES FOR FILTERED QUERIES
-- ============================================

-- Index for substances with SMILES (for molecule visualization queries)
CREATE INDEX IF NOT EXISTS idx_substance_has_smile
ON substance(substance_id) WHERE smile IS NOT NULL AND smile != '';

-- Index for natural substances filter
CREATE INDEX IF NOT EXISTS idx_substance_is_natural
ON substance(is_natural) WHERE is_natural = true;

-- Index for synthetic substances filter
CREATE INDEX IF NOT EXISTS idx_substance_is_synthetic
ON substance(synthetic) WHERE synthetic = true;

-- ============================================
-- 2. INDEX FOR EXTERNAL ID LOOKUPS
-- ============================================

-- PubChem CID lookups (frequently used for external data enrichment)
CREATE INDEX IF NOT EXISTS idx_substance_pubchem_cid
ON substance(pubchem_id) WHERE pubchem_id IS NOT NULL;

-- ============================================
-- 3. GIN INDEX FOR JSONB ARRAY SEARCH
-- ============================================

-- Index for alternative_names array search
CREATE INDEX IF NOT EXISTS idx_substance_alt_names
ON substance USING GIN (alternative_names jsonb_path_ops);

-- Index for food_additive_classes array search
CREATE INDEX IF NOT EXISTS idx_substance_food_additive_classes
ON substance USING GIN (food_additive_classes);

-- ============================================
-- 4. COMPOUND INDEX FOR COMMON PATTERNS
-- ============================================

-- Index for common search pattern: name + has SMILES
CREATE INDEX IF NOT EXISTS idx_substance_name_with_smile
ON substance(common_name) WHERE smile IS NOT NULL AND smile != '';

-- ============================================
-- 5. BTREE INDEX FOR SORTING
-- ============================================

-- Index for sorting by molecular weight
CREATE INDEX IF NOT EXISTS idx_substance_molecular_weight
ON substance(molecular_weight) WHERE molecular_weight IS NOT NULL;
