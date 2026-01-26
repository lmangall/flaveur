-- Migration: Add variation system for formula comparison
-- Groups related formula variations together for side-by-side comparison

-- Create variation_group table
CREATE TABLE IF NOT EXISTS variation_group (
  group_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_id VARCHAR(255) REFERENCES users(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for variation_group
CREATE INDEX IF NOT EXISTS idx_variation_group_user_id ON variation_group(user_id);

-- Add new columns to flavour table for variation tracking
ALTER TABLE flavour
ADD COLUMN IF NOT EXISTS variation_group_id INTEGER REFERENCES variation_group(group_id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS variation_label VARCHAR(50),
ADD COLUMN IF NOT EXISTS is_main_variation BOOLEAN DEFAULT false;

-- Add indexes for new flavour columns
CREATE INDEX IF NOT EXISTS idx_flavour_variation_group_id ON flavour(variation_group_id);
CREATE INDEX IF NOT EXISTS idx_flavour_is_main_variation ON flavour(is_main_variation) WHERE is_main_variation = true;

-- Add trigger to update updated_at on variation_group
CREATE OR REPLACE FUNCTION update_variation_group_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_variation_group_updated_at ON variation_group;
CREATE TRIGGER trigger_variation_group_updated_at
  BEFORE UPDATE ON variation_group
  FOR EACH ROW
  EXECUTE FUNCTION update_variation_group_updated_at();
