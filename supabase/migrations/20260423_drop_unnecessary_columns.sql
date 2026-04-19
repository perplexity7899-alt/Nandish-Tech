-- Drop unnecessary columns from client_replies table

-- Drop columns that are not needed
ALTER TABLE IF EXISTS public.client_replies
DROP COLUMN IF EXISTS message_id CASCADE,
DROP COLUMN IF EXISTS user_id CASCADE,
DROP COLUMN IF EXISTS admin_id CASCADE,
DROP COLUMN IF EXISTS reply_message CASCADE,
DROP COLUMN IF EXISTS status CASCADE,
DROP COLUMN IF EXISTS read_by_user CASCADE,
DROP COLUMN IF EXISTS read_by_admin CASCADE,
DROP COLUMN IF EXISTS read_at CASCADE;

-- Clean up RLS policies that reference dropped columns
DROP POLICY IF EXISTS "anon_insert_service_inquiry" ON public.client_replies;
DROP POLICY IF EXISTS "auth_insert_inquiry" ON public.client_replies;
DROP POLICY IF EXISTS "user_select_own" ON public.client_replies;
DROP POLICY IF EXISTS "admin_select_all" ON public.client_replies;
DROP POLICY IF EXISTS "admin_update_all" ON public.client_replies;
DROP POLICY IF EXISTS "admin_delete_all" ON public.client_replies;

-- Create new simplified RLS policies

-- Allow anyone to insert service inquiries
CREATE POLICY "insert_service_inquiry"
ON public.client_replies FOR INSERT TO public
WITH CHECK (
  client_name IS NOT NULL AND
  client_email IS NOT NULL AND
  service_type IS NOT NULL
);

-- Allow anyone to view all inquiries (public)
CREATE POLICY "select_all_inquiries"
ON public.client_replies FOR SELECT TO public
USING (true);

-- Grant permissions
GRANT SELECT, INSERT ON public.client_replies TO anon;
GRANT SELECT, INSERT ON public.client_replies TO authenticated;
GRANT ALL ON public.client_replies TO postgres;
