-- Add service price column to client_replies table
ALTER TABLE public.client_replies
ADD COLUMN IF NOT EXISTS service_price TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS service_price_unit TEXT DEFAULT 'onwards';

COMMENT ON COLUMN public.client_replies.service_price IS 'Price of the service being inquired about';
COMMENT ON COLUMN public.client_replies.service_price_unit IS 'Price unit (e.g., onwards)';
