-- Migration: 013_normalize_functional_groups.sql
-- Date: 2026-01-22
-- Description: Normalize functional groups into lookup table with junction table

-- Functional groups lookup table
CREATE TABLE IF NOT EXISTS functional_group (
  functional_group_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  smarts_pattern VARCHAR(500) -- For chemical structure matching (optional)
);

-- Junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS substance_functional_group (
  substance_id INTEGER REFERENCES substance(substance_id) ON DELETE CASCADE,
  functional_group_id INTEGER REFERENCES functional_group(functional_group_id) ON DELETE CASCADE,
  PRIMARY KEY (substance_id, functional_group_id)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_sfg_substance ON substance_functional_group(substance_id);
CREATE INDEX IF NOT EXISTS idx_sfg_group ON substance_functional_group(functional_group_id);

-- Seed common functional groups
INSERT INTO functional_group (name, description) VALUES
  ('Aldehyde', 'Contains -CHO group'),
  ('Ketone', 'Contains C=O between carbons'),
  ('Alcohol', 'Contains -OH group'),
  ('Ester', 'Contains -COO- group'),
  ('Carboxylic Acid', 'Contains -COOH group'),
  ('Lactone', 'Cyclic ester'),
  ('Terpene', 'Derived from isoprene units'),
  ('Phenol', 'Aromatic -OH'),
  ('Ether', 'Contains C-O-C linkage'),
  ('Amine', 'Contains nitrogen with lone pair'),
  ('Sulfide', 'Contains C-S-C linkage'),
  ('Pyrazine', 'Six-membered ring with two nitrogens'),
  ('Furan', 'Five-membered oxygen heterocycle'),
  ('Thiophene', 'Five-membered sulfur heterocycle')
ON CONFLICT (name) DO NOTHING;
