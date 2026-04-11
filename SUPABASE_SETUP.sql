-- Run this in Supabase SQL Editor to set up project_purchases table schema

-- 1. Add client info columns and rejection reason
ALTER TABLE IF EXISTS public.project_purchases
ADD COLUMN IF NOT EXISTS client_name TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS client_email TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS project_title TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT DEFAULT NULL;

-- 2. Add timestamp columns
ALTER TABLE IF EXISTS public.project_purchases
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 3. Add comments
COMMENT ON COLUMN public.project_purchases.client_name IS 'Name of the client who purchased the project';
COMMENT ON COLUMN public.project_purchases.client_email IS 'Email of the client who purchased the project';
COMMENT ON COLUMN public.project_purchases.project_title IS 'Title of the project that was purchased';
COMMENT ON COLUMN public.project_purchases.rejection_reason IS 'Reason for rejection if the payment was rejected';
COMMENT ON COLUMN public.project_purchases.verified_at IS 'Timestamp when admin verified the payment';
COMMENT ON COLUMN public.project_purchases.approved_at IS 'Timestamp when admin approved and granted access to the project';
