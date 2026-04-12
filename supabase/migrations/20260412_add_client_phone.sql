-- Add client_phone column to project_purchases table
ALTER TABLE public.project_purchases
ADD COLUMN IF NOT EXISTS client_phone TEXT DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN public.project_purchases.client_phone IS 'Phone number of the client who purchased the project';
