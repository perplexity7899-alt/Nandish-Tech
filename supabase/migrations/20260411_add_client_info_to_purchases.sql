-- Add client_name, client_email, project_title, and rejection_reason columns to project_purchases table
ALTER TABLE IF EXISTS public.project_purchases
ADD COLUMN IF NOT EXISTS client_name TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS client_email TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS project_title TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT DEFAULT NULL;

-- Add comments for clarity
COMMENT ON COLUMN public.project_purchases.client_name IS 'Name of the client who purchased the project';
COMMENT ON COLUMN public.project_purchases.client_email IS 'Email of the client who purchased the project';
COMMENT ON COLUMN public.project_purchases.project_title IS 'Title of the project that was purchased';
COMMENT ON COLUMN public.project_purchases.rejection_reason IS 'Reason for rejection if the payment was rejected';
