-- Migration: Rename flavour to formula across all tables
-- Purpose: The app now handles flavours, perfumes, and cosmetics - "formula" is the generic term
-- IMPORTANT: This migration preserves all existing data

BEGIN;

-- ============================================
-- 1. DROP FOREIGN KEYS
-- ============================================

-- substance_flavour foreign keys
ALTER TABLE substance_flavour DROP CONSTRAINT IF EXISTS substance_flavour_flavour_id_fkey;
ALTER TABLE substance_flavour DROP CONSTRAINT IF EXISTS substance_flavour_substance_id_fkey;

-- ingredient_flavour foreign keys
ALTER TABLE ingredient_flavour DROP CONSTRAINT IF EXISTS ingredient_flavour_ingredient_flavour_id_fkey;
ALTER TABLE ingredient_flavour DROP CONSTRAINT IF EXISTS ingredient_flavour_parent_flavour_id_fkey;

-- flavour_shares foreign keys
ALTER TABLE flavour_shares DROP CONSTRAINT IF EXISTS flavour_shares_flavour_id_fkey;
ALTER TABLE flavour_shares DROP CONSTRAINT IF EXISTS flavour_shares_shared_with_user_id_fkey;
ALTER TABLE flavour_shares DROP CONSTRAINT IF EXISTS flavour_shares_shared_by_user_id_fkey;

-- flavour_invites foreign keys
ALTER TABLE flavour_invites DROP CONSTRAINT IF EXISTS flavour_invites_flavour_id_fkey;
ALTER TABLE flavour_invites DROP CONSTRAINT IF EXISTS flavour_invites_invited_by_user_id_fkey;

-- workspace_flavour foreign keys
ALTER TABLE workspace_flavour DROP CONSTRAINT IF EXISTS workspace_flavour_workspace_id_fkey;
ALTER TABLE workspace_flavour DROP CONSTRAINT IF EXISTS workspace_flavour_flavour_id_fkey;
ALTER TABLE workspace_flavour DROP CONSTRAINT IF EXISTS workspace_flavour_added_by_fkey;

-- flavour table foreign keys
ALTER TABLE flavour DROP CONSTRAINT IF EXISTS flavour_category_id_fkey;
ALTER TABLE flavour DROP CONSTRAINT IF EXISTS flavour_user_id_fkey;
ALTER TABLE flavour DROP CONSTRAINT IF EXISTS flavour_variation_group_id_fkey;

-- ============================================
-- 2. DROP INDEXES
-- ============================================

DROP INDEX IF EXISTS idx_flavour_category_id;
DROP INDEX IF EXISTS idx_flavour_is_public;
DROP INDEX IF EXISTS idx_flavour_status;
DROP INDEX IF EXISTS idx_flavour_user_id;
DROP INDEX IF EXISTS idx_flavour_variation_group_id;
DROP INDEX IF EXISTS idx_flavour_shares_flavour_id;
DROP INDEX IF EXISTS idx_flavour_shares_shared_by_user_id;
DROP INDEX IF EXISTS idx_flavour_shares_shared_with_user_id;
DROP INDEX IF EXISTS idx_flavour_invites_email;
DROP INDEX IF EXISTS idx_flavour_invites_flavour_id;
DROP INDEX IF EXISTS idx_flavour_invites_status;
DROP INDEX IF EXISTS idx_flavour_invites_token;
DROP INDEX IF EXISTS idx_workspace_flavour_flavour_id;
DROP INDEX IF EXISTS idx_workspace_flavour_workspace_id;

-- ============================================
-- 3. DROP CHECK CONSTRAINTS
-- ============================================

ALTER TABLE flavour DROP CONSTRAINT IF EXISTS flavour_base_unit_check;
ALTER TABLE flavour DROP CONSTRAINT IF EXISTS flavour_status_check;
ALTER TABLE substance_flavour DROP CONSTRAINT IF EXISTS substance_flavour_unit_check;
ALTER TABLE substance_flavour DROP CONSTRAINT IF EXISTS substance_flavour_pyramid_position_check;
ALTER TABLE ingredient_flavour DROP CONSTRAINT IF EXISTS ingredient_flavour_unit_check;
ALTER TABLE flavour_invites DROP CONSTRAINT IF EXISTS flavour_invites_status_check;

-- ============================================
-- 4. DROP UNIQUE CONSTRAINTS
-- ============================================

ALTER TABLE flavour_shares DROP CONSTRAINT IF EXISTS flavour_shares_flavour_id_shared_with_user_id_key;
ALTER TABLE flavour_invites DROP CONSTRAINT IF EXISTS flavour_invites_flavour_id_invited_email_key;
ALTER TABLE flavour_invites DROP CONSTRAINT IF EXISTS flavour_invites_invite_token_key;

-- ============================================
-- 5. DROP PRIMARY KEYS (for junction tables)
-- ============================================

ALTER TABLE substance_flavour DROP CONSTRAINT IF EXISTS substance_flavour_pkey;
ALTER TABLE ingredient_flavour DROP CONSTRAINT IF EXISTS ingredient_flavour_pkey;
ALTER TABLE workspace_flavour DROP CONSTRAINT IF EXISTS workspace_flavour_pkey;

-- ============================================
-- 6. RENAME COLUMNS (before renaming tables)
-- ============================================

-- In flavour table
ALTER TABLE flavour RENAME COLUMN flavour_id TO formula_id;

-- In substance_flavour table
ALTER TABLE substance_flavour RENAME COLUMN flavour_id TO formula_id;

-- In ingredient_flavour table
ALTER TABLE ingredient_flavour RENAME COLUMN parent_flavour_id TO parent_formula_id;
ALTER TABLE ingredient_flavour RENAME COLUMN ingredient_flavour_id TO ingredient_formula_id;

-- In flavour_shares table
ALTER TABLE flavour_shares RENAME COLUMN flavour_id TO formula_id;

-- In flavour_invites table
ALTER TABLE flavour_invites RENAME COLUMN flavour_id TO formula_id;

-- In workspace_flavour table
ALTER TABLE workspace_flavour RENAME COLUMN flavour_id TO formula_id;

-- ============================================
-- 7. RENAME TABLES
-- ============================================

ALTER TABLE flavour RENAME TO formula;
ALTER TABLE substance_flavour RENAME TO substance_formula;
ALTER TABLE ingredient_flavour RENAME TO ingredient_formula;
ALTER TABLE flavour_shares RENAME TO formula_shares;
ALTER TABLE flavour_invites RENAME TO formula_invites;
ALTER TABLE workspace_flavour RENAME TO workspace_formula;

-- ============================================
-- 8. RECREATE PRIMARY KEYS
-- ============================================

ALTER TABLE substance_formula ADD CONSTRAINT substance_formula_pkey
  PRIMARY KEY (substance_id, formula_id);

ALTER TABLE ingredient_formula ADD CONSTRAINT ingredient_formula_pkey
  PRIMARY KEY (parent_formula_id, ingredient_formula_id);

ALTER TABLE workspace_formula ADD CONSTRAINT workspace_formula_pkey
  PRIMARY KEY (workspace_id, formula_id);

-- ============================================
-- 9. RECREATE INDEXES
-- ============================================

CREATE INDEX idx_formula_category_id ON formula(category_id);
CREATE INDEX idx_formula_is_public ON formula(is_public);
CREATE INDEX idx_formula_status ON formula(status);
CREATE INDEX idx_formula_user_id ON formula(user_id);
CREATE INDEX idx_formula_variation_group_id ON formula(variation_group_id);

CREATE INDEX idx_formula_shares_formula_id ON formula_shares(formula_id);
CREATE INDEX idx_formula_shares_shared_by_user_id ON formula_shares(shared_by_user_id);
CREATE INDEX idx_formula_shares_shared_with_user_id ON formula_shares(shared_with_user_id);

CREATE INDEX idx_formula_invites_email ON formula_invites(invited_email);
CREATE INDEX idx_formula_invites_formula_id ON formula_invites(formula_id);
CREATE INDEX idx_formula_invites_status ON formula_invites(status);
CREATE INDEX idx_formula_invites_token ON formula_invites(invite_token);

CREATE INDEX idx_workspace_formula_formula_id ON workspace_formula(formula_id);
CREATE INDEX idx_workspace_formula_workspace_id ON workspace_formula(workspace_id);

-- ============================================
-- 10. RECREATE FOREIGN KEYS
-- ============================================

-- formula table foreign keys
ALTER TABLE formula
  ADD CONSTRAINT formula_category_id_fkey
  FOREIGN KEY (category_id) REFERENCES category(category_id) ON DELETE SET NULL;

ALTER TABLE formula
  ADD CONSTRAINT formula_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE formula
  ADD CONSTRAINT formula_variation_group_id_fkey
  FOREIGN KEY (variation_group_id) REFERENCES variation_group(group_id) ON DELETE SET NULL;

-- substance_formula foreign keys
ALTER TABLE substance_formula
  ADD CONSTRAINT substance_formula_formula_id_fkey
  FOREIGN KEY (formula_id) REFERENCES formula(formula_id) ON DELETE CASCADE;

ALTER TABLE substance_formula
  ADD CONSTRAINT substance_formula_substance_id_fkey
  FOREIGN KEY (substance_id) REFERENCES substance(substance_id) ON DELETE CASCADE;

-- ingredient_formula foreign keys
ALTER TABLE ingredient_formula
  ADD CONSTRAINT ingredient_formula_ingredient_formula_id_fkey
  FOREIGN KEY (ingredient_formula_id) REFERENCES formula(formula_id) ON DELETE CASCADE;

ALTER TABLE ingredient_formula
  ADD CONSTRAINT ingredient_formula_parent_formula_id_fkey
  FOREIGN KEY (parent_formula_id) REFERENCES formula(formula_id) ON DELETE CASCADE;

-- formula_shares foreign keys
ALTER TABLE formula_shares
  ADD CONSTRAINT formula_shares_formula_id_fkey
  FOREIGN KEY (formula_id) REFERENCES formula(formula_id) ON DELETE CASCADE;

ALTER TABLE formula_shares
  ADD CONSTRAINT formula_shares_shared_with_user_id_fkey
  FOREIGN KEY (shared_with_user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE formula_shares
  ADD CONSTRAINT formula_shares_shared_by_user_id_fkey
  FOREIGN KEY (shared_by_user_id) REFERENCES users(id) ON DELETE CASCADE;

-- formula_invites foreign keys
ALTER TABLE formula_invites
  ADD CONSTRAINT formula_invites_formula_id_fkey
  FOREIGN KEY (formula_id) REFERENCES formula(formula_id) ON DELETE CASCADE;

ALTER TABLE formula_invites
  ADD CONSTRAINT formula_invites_invited_by_user_id_fkey
  FOREIGN KEY (invited_by_user_id) REFERENCES users(id) ON DELETE CASCADE;

-- workspace_formula foreign keys
ALTER TABLE workspace_formula
  ADD CONSTRAINT workspace_formula_workspace_id_fkey
  FOREIGN KEY (workspace_id) REFERENCES workspace(workspace_id) ON DELETE CASCADE;

ALTER TABLE workspace_formula
  ADD CONSTRAINT workspace_formula_formula_id_fkey
  FOREIGN KEY (formula_id) REFERENCES formula(formula_id) ON DELETE CASCADE;

ALTER TABLE workspace_formula
  ADD CONSTRAINT workspace_formula_added_by_fkey
  FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================
-- 11. RECREATE UNIQUE CONSTRAINTS
-- ============================================

ALTER TABLE formula_shares ADD CONSTRAINT formula_shares_formula_id_shared_with_user_id_key
  UNIQUE (formula_id, shared_with_user_id);

ALTER TABLE formula_invites ADD CONSTRAINT formula_invites_formula_id_invited_email_key
  UNIQUE (formula_id, invited_email);

ALTER TABLE formula_invites ADD CONSTRAINT formula_invites_invite_token_key
  UNIQUE (invite_token);

-- ============================================
-- 12. RECREATE CHECK CONSTRAINTS
-- ============================================

ALTER TABLE formula ADD CONSTRAINT formula_base_unit_check
  CHECK (base_unit::text = ANY (ARRAY['g/kg', '%(v/v)', 'g/L', 'mL/L', 'ppm']));

ALTER TABLE formula ADD CONSTRAINT formula_status_check
  CHECK (status::text = ANY (ARRAY['draft', 'published', 'archived']));

ALTER TABLE substance_formula ADD CONSTRAINT substance_formula_unit_check
  CHECK (unit::text = ANY (ARRAY['g/kg', '%(v/v)', 'g/L', 'mL/L', 'ppm']));

ALTER TABLE substance_formula ADD CONSTRAINT substance_formula_pyramid_position_check
  CHECK (pyramid_position::text = ANY (ARRAY['top', 'heart', 'base']) OR pyramid_position IS NULL);

ALTER TABLE ingredient_formula ADD CONSTRAINT ingredient_formula_unit_check
  CHECK (unit::text = ANY (ARRAY['g/kg', '%(v/v)', 'g/L', 'mL/L', 'ppm']));

ALTER TABLE formula_invites ADD CONSTRAINT formula_invites_status_check
  CHECK (status = ANY (ARRAY['pending', 'accepted', 'expired']));

COMMIT;
