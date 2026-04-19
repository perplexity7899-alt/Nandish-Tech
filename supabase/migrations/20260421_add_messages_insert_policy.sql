-- Fix: Add missing INSERT policy for messages table
-- This allows authenticated users to insert their own messages

-- First, enable RLS on messages table if not already enabled
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing problematic policies if they exist
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.messages;
DROP POLICY IF EXISTS "authenticated_users_insert_messages" ON public.messages;

-- Create policy to allow authenticated users to insert their own messages
CREATE POLICY "allow_authenticated_insert_messages"
ON public.messages FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to view their own messages
DROP POLICY IF EXISTS "users_view_own_messages" ON public.messages;
CREATE POLICY "allow_users_select_own_messages"
ON public.messages FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Create policy to allow admins to view all messages
DROP POLICY IF EXISTS "admins_view_all_messages" ON public.messages;
CREATE POLICY "allow_admins_select_all_messages"
ON public.messages FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create policy to allow admins to update messages
DROP POLICY IF EXISTS "admins_update_messages" ON public.messages;
CREATE POLICY "allow_admins_update_messages"
ON public.messages FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create policy to allow admins to delete messages
DROP POLICY IF EXISTS "admins_delete_messages" ON public.messages;
CREATE POLICY "allow_admins_delete_messages"
ON public.messages FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Grant necessary permissions to authenticated users
GRANT INSERT, SELECT, UPDATE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO postgres;
