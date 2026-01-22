-- Migration: Add usage guidelines table
-- Date: 2026-01-22
-- Description: Stores recommended concentration data by application type

-- ============================================
-- 1. CREATE USAGE GUIDELINES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS substance_usage_guideline (
    guideline_id SERIAL PRIMARY KEY,
    substance_id INTEGER NOT NULL REFERENCES substance(substance_id) ON DELETE CASCADE,

    -- Application categorization
    application_type VARCHAR(100) NOT NULL,  -- 'beverages', 'baked_goods', 'confectionery', etc.
    application_subtype VARCHAR(100),        -- 'alcoholic', 'carbonated', 'dairy-based', etc.

    -- Concentration data (in PPM)
    typical_min_ppm DECIMAL(12, 6),          -- Typical low usage level
    typical_max_ppm DECIMAL(12, 6),          -- Typical high usage level
    legal_max_ppm DECIMAL(12, 6),            -- Legal maximum (if applicable)
    detection_threshold_ppm DECIMAL(12, 6),  -- Flavor detection threshold

    -- Sensory impact at different levels
    low_level_character TEXT,                -- Sensory description at low concentrations
    high_level_character TEXT,               -- Sensory description at high concentrations

    -- Source and reliability
    data_source VARCHAR(255),                -- 'FEMA', 'Industry', 'Academic', 'Internal'
    source_reference TEXT,                   -- Citation or reference

    -- Notes
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Each substance can only have one guideline per application type/subtype
    UNIQUE(substance_id, application_type, application_subtype)
);

-- ============================================
-- 2. ADD INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_usage_guideline_substance
ON substance_usage_guideline(substance_id);

CREATE INDEX IF NOT EXISTS idx_usage_guideline_application
ON substance_usage_guideline(application_type);

CREATE INDEX IF NOT EXISTS idx_usage_guideline_application_sub
ON substance_usage_guideline(application_type, application_subtype);

-- ============================================
-- 3. ADD UPDATE TRIGGER
-- ============================================

DROP TRIGGER IF EXISTS update_usage_guideline_timestamp ON substance_usage_guideline;
CREATE TRIGGER update_usage_guideline_timestamp
    BEFORE UPDATE ON substance_usage_guideline
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================
-- 4. ADD CHECK CONSTRAINTS
-- ============================================

-- Ensure PPM values are positive
ALTER TABLE substance_usage_guideline ADD CONSTRAINT chk_ppm_positive
CHECK (
    (typical_min_ppm IS NULL OR typical_min_ppm >= 0) AND
    (typical_max_ppm IS NULL OR typical_max_ppm >= 0) AND
    (legal_max_ppm IS NULL OR legal_max_ppm >= 0) AND
    (detection_threshold_ppm IS NULL OR detection_threshold_ppm >= 0)
);

-- Ensure min <= max when both are present
ALTER TABLE substance_usage_guideline ADD CONSTRAINT chk_ppm_range
CHECK (
    typical_min_ppm IS NULL OR
    typical_max_ppm IS NULL OR
    typical_min_ppm <= typical_max_ppm
);

-- Validate common application types
ALTER TABLE substance_usage_guideline ADD CONSTRAINT chk_application_type
CHECK (application_type IN (
    'beverages',
    'baked_goods',
    'confectionery',
    'dairy',
    'savory',
    'snacks',
    'frozen_desserts',
    'sauces_condiments',
    'meat_products',
    'tobacco',
    'oral_care',
    'fragrances',
    'other'
));
