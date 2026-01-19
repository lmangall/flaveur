-- Migration: Add flavour sharing and invitation system
-- Date: 2025-01-19
-- Description: Enables sharing flavours with users (direct shares) and inviting non-users via email

-- ============================================
-- 1. CREATE FLAVOUR_SHARES TABLE (for existing users)
-- ============================================

CREATE TABLE IF NOT EXISTS flavour_shares (
    share_id SERIAL PRIMARY KEY,
    flavour_id INTEGER NOT NULL REFERENCES flavour(flavour_id) ON DELETE CASCADE,
    shared_with_user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    shared_by_user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Prevent duplicate shares
    UNIQUE(flavour_id, shared_with_user_id)
);

-- ============================================
-- 2. CREATE FLAVOUR_INVITES TABLE (for non-users)
-- ============================================

CREATE TABLE IF NOT EXISTS flavour_invites (
    invite_id SERIAL PRIMARY KEY,
    flavour_id INTEGER NOT NULL REFERENCES flavour(flavour_id) ON DELETE CASCADE,
    invited_email TEXT NOT NULL,
    invited_by_user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    invite_token UUID DEFAULT gen_random_uuid() UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP WITHOUT TIME ZONE,

    -- Prevent duplicate invites to same email for same flavour
    UNIQUE(flavour_id, invited_email)
);

-- ============================================
-- 3. ADD INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_flavour_shares_flavour_id ON flavour_shares(flavour_id);
CREATE INDEX IF NOT EXISTS idx_flavour_shares_shared_with_user_id ON flavour_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_flavour_shares_shared_by_user_id ON flavour_shares(shared_by_user_id);

CREATE INDEX IF NOT EXISTS idx_flavour_invites_flavour_id ON flavour_invites(flavour_id);
CREATE INDEX IF NOT EXISTS idx_flavour_invites_email ON flavour_invites(invited_email);
CREATE INDEX IF NOT EXISTS idx_flavour_invites_token ON flavour_invites(invite_token);
CREATE INDEX IF NOT EXISTS idx_flavour_invites_status ON flavour_invites(status);

-- ============================================
-- 4. ADD COMMENTS
-- ============================================

COMMENT ON TABLE flavour_shares IS 'Direct sharing relationships between flavours and existing users';
COMMENT ON TABLE flavour_invites IS 'Pending invitations for non-users to view flavours after signing up';
COMMENT ON COLUMN flavour_invites.status IS 'pending = awaiting signup, accepted = converted to share, expired = no longer valid';
