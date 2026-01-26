-- Migration: Add more document types
-- Date: 2026-01-25
-- Description: Adds PDF and generic file document types to workspace_document

-- ============================================
-- 1. UPDATE DOCUMENT TYPE CONSTRAINT
-- ============================================

-- Drop and recreate constraint with additional types (using DO block for idempotency)
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'workspace_document_type_check'
    AND table_name = 'workspace_document'
  ) THEN
    ALTER TABLE workspace_document DROP CONSTRAINT workspace_document_type_check;
  END IF;

  -- Add new constraint
  ALTER TABLE workspace_document
  ADD CONSTRAINT workspace_document_type_check
  CHECK (type IN ('image', 'csv', 'markdown', 'pdf', 'file'));
END $$;

-- ============================================
-- 2. UPDATE COMMENTS
-- ============================================

COMMENT ON COLUMN workspace_document.type IS 'image = image file, csv = spreadsheet, markdown = rich text, pdf = PDF document, file = generic file';
COMMENT ON COLUMN workspace_document.url IS 'Vercel Blob URL for binary files (image, pdf, file types)';
