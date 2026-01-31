-- Migration: 014_add_fuzzy_search.sql
-- Date: 2026-01-22
-- Description: Add trigram-based fuzzy search for substances

-- Enable trigram extension for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add trigram index on common_name
CREATE INDEX IF NOT EXISTS idx_substance_name_trgm
ON substance USING gin (common_name gin_trgm_ops);

-- Function for fuzzy substance search
-- Searches both common_name and alternative_names JSONB array
CREATE OR REPLACE FUNCTION search_substances_fuzzy(
  search_term TEXT,
  similarity_threshold FLOAT DEFAULT 0.3,
  max_results INT DEFAULT 20
)
RETURNS TABLE(
  substance_id INT,
  common_name VARCHAR,
  cas_id VARCHAR,
  fema_number INT,
  odor TEXT,
  similarity FLOAT
) AS $$
  SELECT
    s.substance_id,
    s.common_name,
    s.cas_id,
    s.fema_number,
    s.odor,
    GREATEST(
      similarity(s.common_name, search_term),
      COALESCE((
        SELECT MAX(similarity(value::text, search_term))
        FROM jsonb_array_elements_text(COALESCE(s.alternative_names, '[]'::jsonb)) AS value
      ), 0)
    )::FLOAT as similarity
  FROM substance s
  WHERE
    similarity(s.common_name, search_term) > similarity_threshold
    OR EXISTS (
      SELECT 1 FROM jsonb_array_elements_text(COALESCE(s.alternative_names, '[]'::jsonb)) AS value
      WHERE similarity(value::text, search_term) > similarity_threshold
    )
  ORDER BY similarity DESC
  LIMIT max_results;
$$ LANGUAGE sql STABLE;
