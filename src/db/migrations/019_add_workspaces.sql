-- Migration: Add workspaces and document storage
-- Date: 2026-01-25
-- Description: Enables collaborative workspaces with document storage (images, CSV, markdown) and flavour linking

-- ============================================
-- 1. CREATE WORKSPACE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS workspace (
    workspace_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_by TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. CREATE WORKSPACE_MEMBER TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS workspace_member (
    member_id SERIAL PRIMARY KEY,
    workspace_id INTEGER NOT NULL REFERENCES workspace(workspace_id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Prevent duplicate memberships
    UNIQUE(workspace_id, user_id)
);

-- ============================================
-- 3. CREATE WORKSPACE_INVITE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS workspace_invite (
    invite_id SERIAL PRIMARY KEY,
    workspace_id INTEGER NOT NULL REFERENCES workspace(workspace_id) ON DELETE CASCADE,
    invited_email TEXT NOT NULL,
    invited_by_user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    invite_token UUID DEFAULT gen_random_uuid() UNIQUE,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('editor', 'viewer')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Prevent duplicate invites to same email for same workspace
    UNIQUE(workspace_id, invited_email)
);

-- ============================================
-- 4. CREATE WORKSPACE_DOCUMENT TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS workspace_document (
    document_id SERIAL PRIMARY KEY,
    workspace_id INTEGER NOT NULL REFERENCES workspace(workspace_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('image', 'csv', 'markdown')),
    content TEXT,              -- For markdown/csv (stored as text)
    url TEXT,                  -- For images (Vercel Blob URL)
    file_size INTEGER,
    mime_type TEXT,
    created_by TEXT REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. CREATE WORKSPACE_FLAVOUR TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS workspace_flavour (
    workspace_id INTEGER NOT NULL REFERENCES workspace(workspace_id) ON DELETE CASCADE,
    flavour_id INTEGER NOT NULL REFERENCES flavour(flavour_id) ON DELETE CASCADE,
    added_by TEXT REFERENCES users(user_id) ON DELETE SET NULL,
    added_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (workspace_id, flavour_id)
);

-- ============================================
-- 6. ADD INDEXES FOR PERFORMANCE
-- ============================================

-- Workspace member indexes
CREATE INDEX IF NOT EXISTS idx_workspace_member_workspace_id ON workspace_member(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_member_user_id ON workspace_member(user_id);

-- Workspace invite indexes
CREATE INDEX IF NOT EXISTS idx_workspace_invite_workspace_id ON workspace_invite(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_invite_email ON workspace_invite(invited_email);
CREATE INDEX IF NOT EXISTS idx_workspace_invite_token ON workspace_invite(invite_token);
CREATE INDEX IF NOT EXISTS idx_workspace_invite_status ON workspace_invite(status);

-- Workspace document indexes
CREATE INDEX IF NOT EXISTS idx_workspace_document_workspace_id ON workspace_document(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_document_type ON workspace_document(type);

-- Workspace flavour indexes
CREATE INDEX IF NOT EXISTS idx_workspace_flavour_workspace_id ON workspace_flavour(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_flavour_flavour_id ON workspace_flavour(flavour_id);

-- ============================================
-- 7. ADD COMMENTS
-- ============================================

COMMENT ON TABLE workspace IS 'Collaborative workspaces for sharing flavours and documents';
COMMENT ON TABLE workspace_member IS 'Membership relationships between workspaces and users with roles';
COMMENT ON COLUMN workspace_member.role IS 'owner = full control, editor = can edit, viewer = read-only';
COMMENT ON TABLE workspace_invite IS 'Pending invitations for non-members to join workspaces';
COMMENT ON COLUMN workspace_invite.status IS 'pending = awaiting acceptance, accepted = converted to membership, expired = no longer valid';
COMMENT ON TABLE workspace_document IS 'Documents stored in workspaces (images, CSV spreadsheets, markdown notes)';
COMMENT ON COLUMN workspace_document.type IS 'image = binary file in blob storage, csv = spreadsheet as text, markdown = rich text as markdown';
COMMENT ON COLUMN workspace_document.content IS 'Text content for csv and markdown document types';
COMMENT ON COLUMN workspace_document.url IS 'Vercel Blob URL for image document types';
COMMENT ON TABLE workspace_flavour IS 'Links flavours to workspaces for collaborative editing';
