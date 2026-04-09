-- Add phone field to messages table to store contact phone number
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS phone TEXT;

-- Update existing messages to have empty phone field (they won't have this data)
UPDATE public.messages SET phone = '' WHERE phone IS NULL;

-- Make phone column NOT NULL with empty string as default
ALTER TABLE public.messages ALTER COLUMN phone SET NOT NULL DEFAULT '';
