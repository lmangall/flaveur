-- Migration: Fix substance updated_at trigger issue
-- Date: 2026-01-22
-- Description: Adds missing updated_at column to substance table
--              (the trigger was created in 001 but the column was never added)

-- ============================================
-- 1. ADD MISSING updated_at COLUMN TO SUBSTANCE
-- ============================================

ALTER TABLE substance ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- ============================================
-- 2. RECREATE TRIGGER (ensure it exists and is properly configured)
-- ============================================

-- The update_timestamp() function already exists from migration 001
-- Just ensure the trigger is in place
DROP TRIGGER IF EXISTS update_substance_timestamp ON substance;
CREATE TRIGGER update_substance_timestamp
  BEFORE UPDATE ON substance
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
