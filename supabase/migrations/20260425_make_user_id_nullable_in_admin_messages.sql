-- Fix: Make user_id nullable in admin_messages table
-- This allows sending messages to clients without having their user_id (from client_replies submissions)

-- Drop the NOT NULL constraint if it exists
ALTER TABLE public.admin_messages 
ALTER COLUMN user_id DROP NOT NULL;

-- Ensure the foreign key constraint exists and allows NULL
ALTER TABLE public.admin_messages
DROP CONSTRAINT IF EXISTS admin_messages_user_id_fkey;

ALTER TABLE public.admin_messages
ADD CONSTRAINT admin_messages_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

