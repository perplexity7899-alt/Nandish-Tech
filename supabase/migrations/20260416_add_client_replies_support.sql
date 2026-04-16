-- Add support for client replies to admin messages
ALTER TABLE public.replies
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_admin_reply BOOLEAN DEFAULT true;

-- Make admin_id nullable to allow client replies
ALTER TABLE public.replies
ALTER COLUMN admin_id DROP NOT NULL;

-- Update RLS policy to allow clients to insert replies
DROP POLICY IF EXISTS "Admins can insert replies" ON public.replies;

CREATE POLICY "Users can insert replies to messages"
ON public.replies FOR INSERT TO authenticated
WITH CHECK (
  (
    -- Admin can insert reply (original policy)
    public.has_role(auth.uid(), 'admin') AND admin_id = auth.uid()
  ) OR (
    -- Client can insert reply to their own message
    client_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.messages 
      WHERE id = message_id AND user_id = auth.uid()
    )
  )
);

-- Update RLS policy to allow clients to view their own replies
DROP POLICY IF EXISTS "Users can view replies to their messages" ON public.replies;

CREATE POLICY "Users can view replies to their messages"
ON public.replies FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.messages 
    WHERE id = message_id AND user_id = auth.uid()
  ) OR
  client_id = auth.uid()
);

-- Create notifications table for admin alerts
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'client_reply', 'new_message', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID, -- message_id or reply_id
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_admin_id ON public.notifications(admin_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for admins to view their own notifications
CREATE POLICY "Admins can view their own notifications"
ON public.notifications FOR SELECT TO authenticated
USING (admin_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));

-- Create RLS policy for admins to update their own notifications
CREATE POLICY "Admins can update their own notifications"
ON public.notifications FOR UPDATE TO authenticated
USING (admin_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));
