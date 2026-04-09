-- Add phone and last_name fields to messages table
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS last_name TEXT DEFAULT '';
