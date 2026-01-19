-- Add flavor_profile JSONB column to flavour table
-- Stores customizable taste attributes with their intensity values

-- Add the column with a default empty array
ALTER TABLE flavour
ADD COLUMN IF NOT EXISTS flavor_profile JSONB DEFAULT '[]'::jsonb;

-- Add a comment to document the expected structure
COMMENT ON COLUMN flavour.flavor_profile IS 'Array of {attribute: string, value: number} objects representing taste profile';

-- Example structure:
-- [
--   {"attribute": "Sweetness", "value": 50},
--   {"attribute": "Sourness", "value": 30},
--   {"attribute": "Bitterness", "value": 20},
--   {"attribute": "Umami", "value": 40},
--   {"attribute": "Saltiness", "value": 25}
-- ]
