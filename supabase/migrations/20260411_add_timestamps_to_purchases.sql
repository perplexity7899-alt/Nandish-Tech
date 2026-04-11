-- Add verified_at and approved_at columns to project_purchases table
ALTER TABLE IF EXISTS public.project_purchases
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.project_purchases.verified_at IS 'Timestamp when admin verified the payment';
COMMENT ON COLUMN public.project_purchases.approved_at IS 'Timestamp when admin approved and granted access to the project';
