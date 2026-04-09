-- Create replies table for admin responses to client messages
CREATE TABLE public.replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reply_message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.replies ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view replies to their messages
CREATE POLICY "Users can view replies to their messages"
ON public.replies FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.messages 
    WHERE id = message_id AND user_id = auth.uid()
  )
);

-- Admins can view all replies
CREATE POLICY "Admins can view all replies"
ON public.replies FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert replies
CREATE POLICY "Admins can insert replies"
ON public.replies FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') AND admin_id = auth.uid()
);

-- Admins can update replies
CREATE POLICY "Admins can update replies"
ON public.replies FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete replies
CREATE POLICY "Admins can delete replies"
ON public.replies FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
