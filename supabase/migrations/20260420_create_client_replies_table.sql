-- Create client_replies table to track admin responses to client inquiries
-- This table stores replies for both contact form and service-specific inquiries

CREATE TABLE IF NOT EXISTS public.client_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Form submission details from client
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT DEFAULT NULL,
  service_type VARCHAR(100) NOT NULL, -- 'website-development', 'landing-pages', 'ai-chatbot', etc.
  delivery_timeline VARCHAR(100) DEFAULT NULL, -- '1-week', '2-weeks', '15-days', '1-month', 'custom'
  project_details TEXT DEFAULT NULL, -- Full project requirements/details from client
  
  -- Admin reply details
  reply_message TEXT DEFAULT NULL,
  inquiry_type VARCHAR(50) DEFAULT 'service-inquiry', -- 'service-inquiry', 'general', 'follow-up'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in-progress', 'replied', 'completed', 'rejected'
  
  -- Read status tracking
  read_by_user BOOLEAN DEFAULT false,
  read_by_admin BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_client_replies_message_id ON public.client_replies(message_id);
CREATE INDEX IF NOT EXISTS idx_client_replies_user_id ON public.client_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_client_replies_admin_id ON public.client_replies(admin_id);
CREATE INDEX IF NOT EXISTS idx_client_replies_service_type ON public.client_replies(service_type);
CREATE INDEX IF NOT EXISTS idx_client_replies_read_by_user ON public.client_replies(read_by_user);
CREATE INDEX IF NOT EXISTS idx_client_replies_created_at ON public.client_replies(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.client_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_replies

-- 1. Authenticated users can view replies to their own inquiries
DROP POLICY IF EXISTS "users_view_own_replies" ON public.client_replies;
CREATE POLICY "users_view_own_replies"
ON public.client_replies FOR SELECT TO authenticated
USING (
  client_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- 2. Anonymous users can insert service inquiries (no login required)
DROP POLICY IF EXISTS "allow_anon_insert_service_inquiries" ON public.client_replies;
CREATE POLICY "allow_anon_insert_service_inquiries"
ON public.client_replies FOR INSERT TO anon
WITH CHECK (
  inquiry_type = 'service-inquiry' AND
  client_name IS NOT NULL AND
  client_email IS NOT NULL AND
  service_type IS NOT NULL
);

-- 3. Authenticated users can insert their own inquiries
DROP POLICY IF EXISTS "allow_authenticated_insert_inquiries" ON public.client_replies;
CREATE POLICY "allow_authenticated_insert_inquiries"
ON public.client_replies FOR INSERT TO authenticated
WITH CHECK (
  client_email IS NOT NULL AND
  client_name IS NOT NULL
);

-- 4. Authenticated users can update their own messages' read status
DROP POLICY IF EXISTS "users_update_reply_read_status" ON public.client_replies;
CREATE POLICY "users_update_reply_read_status"
ON public.client_replies FOR UPDATE TO authenticated
USING (
  client_email = (SELECT email FROM auth.users WHERE id = auth.uid())
)
WITH CHECK (
  client_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- 5. Admins can view all inquiries and replies
DROP POLICY IF EXISTS "admins_view_all_replies" ON public.client_replies;
CREATE POLICY "admins_view_all_replies"
ON public.client_replies FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
);

-- 6. Admins can insert replies to inquiries
DROP POLICY IF EXISTS "admins_insert_replies" ON public.client_replies;
CREATE POLICY "admins_insert_replies"
ON public.client_replies FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
);

-- 7. Admins can update inquiries and replies
DROP POLICY IF EXISTS "admins_update_replies" ON public.client_replies;
CREATE POLICY "admins_update_replies"
ON public.client_replies FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
);

-- 8. Admins can delete inquiries and replies
DROP POLICY IF EXISTS "admins_delete_replies" ON public.client_replies;
CREATE POLICY "admins_delete_replies"
ON public.client_replies FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.client_replies TO authenticated;
GRANT INSERT ON public.client_replies TO anon;
GRANT ALL ON public.client_replies TO postgres;

-- Create trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS client_replies_updated_at_trigger ON public.client_replies;

CREATE TRIGGER client_replies_updated_at_trigger
BEFORE UPDATE ON public.client_replies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add columns to messages table to track which service the inquiry is about
ALTER TABLE IF EXISTS public.messages
ADD COLUMN IF NOT EXISTS service_type VARCHAR(100) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS inquiry_type VARCHAR(50) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS last_name TEXT DEFAULT '';

-- Create indexes on messages table for better querying
CREATE INDEX IF NOT EXISTS idx_messages_service_type ON public.messages(service_type);
CREATE INDEX IF NOT EXISTS idx_messages_inquiry_type ON public.messages(inquiry_type);
