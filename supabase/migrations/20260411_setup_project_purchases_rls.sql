-- Enable RLS on project_purchases table if not already enabled
ALTER TABLE IF EXISTS public.project_purchases ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.project_purchases;
DROP POLICY IF EXISTS "Admins can view all purchases" ON public.project_purchases;
DROP POLICY IF EXISTS "Admins can update purchase status" ON public.project_purchases;
DROP POLICY IF EXISTS "Users can insert their own purchases" ON public.project_purchases;

-- Policy: Users can view their own purchases
CREATE POLICY "Users can view their own purchases"
ON public.project_purchases FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Admins can view all purchases
CREATE POLICY "Admins can view all purchases"
ON public.project_purchases FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Policy: Admins can update purchase status
CREATE POLICY "Admins can update purchase status"
ON public.project_purchases FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Policy: Users can insert their own purchases
CREATE POLICY "Users can insert their own purchases"
ON public.project_purchases FOR INSERT
WITH CHECK (auth.uid() = user_id);
