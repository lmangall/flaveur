-- Migration: Update job offer constraints
-- Date: 2026-02-02
-- Description: Add 'Alternance' to employment types and update experience levels to year ranges

-- Drop existing constraints
ALTER TABLE job_offers DROP CONSTRAINT IF EXISTS job_offers_employment_type_check;
ALTER TABLE job_offers DROP CONSTRAINT IF EXISTS job_offers_experience_level_check;

-- Migrate existing experience levels to year ranges
UPDATE job_offers SET experience_level = '0-2' WHERE experience_level = 'Entry';
UPDATE job_offers SET experience_level = '3-5' WHERE experience_level = 'Mid';
UPDATE job_offers SET experience_level = '6-10' WHERE experience_level = 'Senior';
UPDATE job_offers SET experience_level = '10+' WHERE experience_level = 'Executive';

-- Add updated employment_type constraint (added 'Alternance')
ALTER TABLE job_offers ADD CONSTRAINT job_offers_employment_type_check
  CHECK (employment_type = ANY (ARRAY[
    'Full-time'::text,
    'Part-time'::text,
    'Contract'::text,
    'Internship'::text,
    'Alternance'::text,
    'Freelance'::text,
    'CDI'::text,
    'CDD'::text,
    'Interim'::text
  ]));

-- Add updated experience_level constraint (year ranges instead of labels)
ALTER TABLE job_offers ADD CONSTRAINT job_offers_experience_level_check
  CHECK (experience_level = ANY (ARRAY[
    '0-2'::text,
    '3-5'::text,
    '6-10'::text,
    '10+'::text
  ]));
