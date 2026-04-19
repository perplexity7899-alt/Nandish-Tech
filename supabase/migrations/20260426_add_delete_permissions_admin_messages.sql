-- Grant DELETE permission to authenticated users for admin_messages table
-- This allows admins (via RLS policy) to delete messages

GRANT DELETE ON public.admin_messages TO authenticated;

-- Ensure admin delete policy exists and is comprehensive
DROP POLICY IF EXISTS "admin_delete_messages" ON public.admin_messages;

CREATE POLICY "admin_delete_messages"
ON public.admin_messages FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
);

-- Clients can also delete their own received messages
CREATE POLICY "users_delete_own_messages"
ON public.admin_messages FOR DELETE TO authenticated
USING (
  recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);
