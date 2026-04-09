-- Disable RLS on projects table temporarily to test
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;

-- Then re-enable with simpler policies
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users full access
DROP POLICY IF EXISTS "Anyone can view projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can update projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can delete projects" ON public.projects;

-- Simple policies for testing
CREATE POLICY "Allow all for authenticated users - SELECT"
ON public.projects FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow all for authenticated users - INSERT"
ON public.projects FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users - UPDATE"
ON public.projects FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users - DELETE"
ON public.projects FOR DELETE
TO authenticated
USING (true);

-- Also allow anonymous to view
CREATE POLICY "Allow anonymous - SELECT"
ON public.projects FOR SELECT
TO anon
USING (true);
