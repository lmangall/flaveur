-- Migration: Remove unique constraint on eu_policy_code
-- Date: 2026-01-22
-- Description: Multiple substances can map to the same EU policy code
--              (e.g., Nutmeg and Black Pepper both map to POL-FFL-IMPORT-3420)

-- Drop the unique constraint
DROP INDEX IF EXISTS idx_substance_eu_policy_code_unique;
