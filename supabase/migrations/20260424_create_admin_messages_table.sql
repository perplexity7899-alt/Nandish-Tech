-- Create admin_messages table for admin to send messages directly to clients
-- These messages will be displayed in the client dashboard

CREATE TABLE public.admin_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Message recipient and sender
  user_id UUID,
  recipient_email TEXT NOT NULL,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Message content
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Message status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_admin_messages_user_id ON public.admin_messages(user_id);
CREATE INDEX idx_admin_messages_recipient_email ON public.admin_messages(recipient_email);
CREATE INDEX idx_admin_messages_admin_id ON public.admin_messages(admin_id);
CREATE INDEX idx_admin_messages_is_read ON public.admin_messages(is_read);
CREATE INDEX idx_admin_messages_created_at ON public.admin_messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Clients can view messages sent to them
CREATE POLICY "users_view_own_admin_messages"
ON public.admin_messages FOR SELECT TO authenticated
USING (
  user_id = auth.uid() OR
  recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Admins can view all messages
CREATE POLICY "admin_view_all_messages"
ON public.admin_messages FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
);

-- Admins can insert messages
CREATE POLICY "admin_insert_messages"
ON public.admin_messages FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
);

-- Admins and users can update read status
CREATE POLICY "users_update_message_read"
ON public.admin_messages FOR UPDATE TO authenticated
USING (
  user_id = auth.uid() OR
  public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  user_id = auth.uid() OR
  public.has_role(auth.uid(), 'admin')
);

-- Admins can delete messages
CREATE POLICY "admin_delete_messages"
ON public.admin_messages FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_messages TO authenticated;
GRANT ALL ON public.admin_messages TO postgres;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_admin_messages_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS admin_messages_updated_at ON public.admin_messages;
CREATE TRIGGER admin_messages_updated_at
BEFORE UPDATE ON public.admin_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_admin_messages_timestamp();
