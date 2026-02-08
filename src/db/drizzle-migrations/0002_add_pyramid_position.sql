-- Add pyramid_position column to substance_flavour table
-- This column allows manual assignment of substances to pyramid tiers (top/heart/base)

ALTER TABLE public.substance_flavour
ADD COLUMN IF NOT EXISTS pyramid_position VARCHAR(20);

-- Add check constraint for valid pyramid positions
ALTER TABLE public.substance_flavour
ADD CONSTRAINT substance_flavour_pyramid_position_check
CHECK (pyramid_position IS NULL OR pyramid_position IN ('top', 'heart', 'base'));

-- Create index for faster pyramid queries
CREATE INDEX IF NOT EXISTS idx_substance_flavour_pyramid_position
ON public.substance_flavour(pyramid_position)
WHERE pyramid_position IS NOT NULL;
