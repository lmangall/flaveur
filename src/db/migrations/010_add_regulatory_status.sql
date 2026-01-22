-- Migration: Add regulatory status table
-- Date: 2026-01-22
-- Description: Tracks FDA/EU/FEMA/JECFA approval status for substances

-- ============================================
-- 1. CREATE REGULATORY STATUS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS regulatory_status (
    status_id SERIAL PRIMARY KEY,
    substance_id INTEGER NOT NULL REFERENCES substance(substance_id) ON DELETE CASCADE,

    -- Regulatory body identifier
    regulatory_body VARCHAR(50) NOT NULL,  -- 'FDA', 'EU', 'FEMA', 'JECFA', 'COE', 'EFSA'

    -- Status information
    status VARCHAR(50) NOT NULL,           -- 'GRAS', 'Approved', 'Restricted', 'Banned', 'Under_Review'

    -- Usage limits
    max_usage_level VARCHAR(100),          -- e.g., '100 ppm', 'No limit', 'Restricted use'

    -- Reference information
    reference_number VARCHAR(100),         -- e.g., FDA regulation number, EU additive code
    reference_url TEXT,                    -- Link to official documentation

    -- Effective dates
    effective_date DATE,
    expiry_date DATE,

    -- Notes
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Each substance can only have one status per regulatory body
    UNIQUE(substance_id, regulatory_body)
);

-- ============================================
-- 2. ADD INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_regulatory_status_substance
ON regulatory_status(substance_id);

CREATE INDEX IF NOT EXISTS idx_regulatory_status_body
ON regulatory_status(regulatory_body);

CREATE INDEX IF NOT EXISTS idx_regulatory_status_status
ON regulatory_status(status);

-- ============================================
-- 3. ADD UPDATE TRIGGER
-- ============================================

DROP TRIGGER IF EXISTS update_regulatory_status_timestamp ON regulatory_status;
CREATE TRIGGER update_regulatory_status_timestamp
    BEFORE UPDATE ON regulatory_status
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================
-- 4. ADD CHECK CONSTRAINTS
-- ============================================

ALTER TABLE regulatory_status ADD CONSTRAINT chk_regulatory_body
CHECK (regulatory_body IN ('FDA', 'EU', 'FEMA', 'JECFA', 'COE', 'EFSA', 'Health_Canada', 'FSANZ', 'Other'));

ALTER TABLE regulatory_status ADD CONSTRAINT chk_status
CHECK (status IN ('GRAS', 'Approved', 'Restricted', 'Banned', 'Under_Review', 'Pending', 'Not_Evaluated'));

-- ============================================
-- 5. POPULATE FEMA STATUS FROM EXISTING DATA
-- ============================================

-- Auto-populate FEMA GRAS status for substances with FEMA numbers
INSERT INTO regulatory_status (substance_id, regulatory_body, status, notes)
SELECT substance_id, 'FEMA', 'GRAS', 'Auto-populated from FEMA number'
FROM substance
WHERE fema_number > 0
ON CONFLICT (substance_id, regulatory_body) DO NOTHING;
