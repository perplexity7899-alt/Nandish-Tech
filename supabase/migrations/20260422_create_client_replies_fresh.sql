-- Create client_replies table - Complete fresh migration
-- This stores all client service inquiries and admin replies

-- Drop existing table if it exists (fresh start)
DROP TABLE IF EXISTS public.client_replies CASCADE;

-- Create the client_replies table
CREATE TABLE public.client_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relations (nullable)
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Client Information
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  
  -- Service Details
  service_type VARCHAR(100) NOT NULL,
  delivery_timeline VARCHAR(100),
  project_details TEXT,
  
  -- Admin Reply
  reply_message TEXT,
  inquiry_type VARCHAR(50) DEFAULT 'service-inquiry',
  status VARCHAR(50) DEFAULT 'pending',
  
  -- Read Tracking
  read_by_user BOOLEAN DEFAULT false,
  read_by_admin BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_client_replies_message_id ON public.client_replies(message_id);
CREATE INDEX idx_client_replies_user_id ON public.client_replies(user_id);
CREATE INDEX idx_client_replies_admin_id ON public.client_replies(admin_id);
CREATE INDEX idx_client_replies_service_type ON public.client_replies(service_type);
CREATE INDEX idx_client_replies_email ON public.client_replies(client_email);
CREATE INDEX idx_client_replies_status ON public.client_replies(status);
CREATE INDEX idx_client_replies_created_at ON public.client_replies(created_at DESC);

-- Enable RLS
ALTER TABLE public.client_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Allow anonymous to insert service inquiries
CREATE POLICY "anon_insert_service_inquiry"
ON public.client_replies FOR INSERT TO anon
WITH CHECK (
  inquiry_type = 'service-inquiry' AND
  client_name IS NOT NULL AND
  client_email IS NOT NULL AND
  service_type IS NOT NULL
);

-- Allow authenticated to insert inquiries
CREATE POLICY "auth_insert_inquiry"
ON public.client_replies FOR INSERT TO authenticated
WITH CHECK (
  client_name IS NOT NULL AND
  client_email IS NOT NULL
);

-- Allow users to view their own inquiries
CREATE POLICY "user_select_own"
ON public.client_replies FOR SELECT TO authenticated
USING (
  client_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Allow admins to view all
CREATE POLICY "admin_select_all"
ON public.client_replies FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
);

-- Allow admins to update
CREATE POLICY "admin_update_all"
ON public.client_replies FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
);

-- Allow admins to delete
CREATE POLICY "admin_delete_all"
ON public.client_replies FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.client_replies TO authenticated;
GRANT INSERT ON public.client_replies TO anon;
GRANT ALL ON public.client_replies TO postgres;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_client_replies_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS client_replies_updated_at ON public.client_replies;
CREATE TRIGGER client_replies_updated_at
BEFORE UPDATE ON public.client_replies
FOR EACH ROW
EXECUTE FUNCTION public.update_client_replies_timestamp();
