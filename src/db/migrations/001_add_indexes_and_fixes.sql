-- Migration: Add indexes and schema fixes
-- Date: 2026-01-18
-- Description: Adds performance indexes, fixes column types, and adds missing constraints

-- ============================================
-- 1. ADD PERFORMANCE INDEXES
-- ============================================

-- Substance table indexes (for common search operations)
CREATE INDEX IF NOT EXISTS idx_substance_fema_number ON substance(fema_number);
CREATE INDEX IF NOT EXISTS idx_substance_common_name ON substance(common_name);
CREATE INDEX IF NOT EXISTS idx_substance_cas_id ON substance(cas_id);

-- Flavour table indexes
CREATE INDEX IF NOT EXISTS idx_flavour_user_id ON flavour(user_id);
CREATE INDEX IF NOT EXISTS idx_flavour_is_public ON flavour(is_public);
CREATE INDEX IF NOT EXISTS idx_flavour_status ON flavour(status);
CREATE INDEX IF NOT EXISTS idx_flavour_category_id ON flavour(category_id);

-- Job offers indexes
CREATE INDEX IF NOT EXISTS idx_job_offers_status ON job_offers(status);
CREATE INDEX IF NOT EXISTS idx_job_offers_industry ON job_offers(industry);
CREATE INDEX IF NOT EXISTS idx_job_offers_posted_at ON job_offers(posted_at DESC);

-- Job offer interactions indexes
CREATE INDEX IF NOT EXISTS idx_job_offer_interactions_user_id ON job_offer_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_job_offer_interactions_job_offer_id ON job_offer_interactions(job_offer_id);

-- ============================================
-- 2. FIX COLUMN DEFAULTS AND CONSTRAINTS
-- ============================================

-- Add default values to flavour columns
ALTER TABLE flavour
  ALTER COLUMN status SET DEFAULT 'draft',
  ALTER COLUMN base_unit SET DEFAULT 'g/kg',
  ALTER COLUMN version SET DEFAULT 1;

-- ============================================
-- 3. FIX contact_person COLUMN TYPE
-- ============================================

-- Convert contact_person from text to jsonb
-- First, create a temporary column
ALTER TABLE job_offers ADD COLUMN IF NOT EXISTS contact_person_new jsonb;

-- Migrate existing data (if any text values exist, try to parse as JSON or wrap as name)
UPDATE job_offers
SET contact_person_new =
  CASE
    WHEN contact_person IS NULL THEN NULL
    WHEN contact_person ~ '^\s*\{' THEN contact_person::jsonb
    ELSE jsonb_build_object('name', contact_person)
  END
WHERE contact_person_new IS NULL;

-- Drop old column and rename new one
ALTER TABLE job_offers DROP COLUMN IF EXISTS contact_person;
ALTER TABLE job_offers RENAME COLUMN contact_person_new TO contact_person;

-- ============================================
-- 4. ADD updated_at TO TABLES MISSING IT
-- ============================================

-- Add updated_at to category table
ALTER TABLE category ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP;

-- Add updated_at to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP;

-- Create triggers for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_timestamp() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to tables that need auto-updating (if not exists)
DROP TRIGGER IF EXISTS update_category_timestamp ON category;
CREATE TRIGGER update_category_timestamp
  BEFORE UPDATE ON category
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_users_timestamp ON users;
CREATE TRIGGER update_users_timestamp
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_flavour_timestamp ON flavour;
CREATE TRIGGER update_flavour_timestamp
  BEFORE UPDATE ON flavour
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_substance_timestamp ON substance;
CREATE TRIGGER update_substance_timestamp
  BEFORE UPDATE ON substance
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_job_offers_timestamp ON job_offers;
CREATE TRIGGER update_job_offers_timestamp
  BEFORE UPDATE ON job_offers
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================
-- 5. CLEANUP: Remove unused sequence
-- ============================================

-- The users_user_id_seq is unused since user_id comes from Clerk as text
-- Removing the default that references it
ALTER TABLE users ALTER COLUMN user_id DROP DEFAULT;
