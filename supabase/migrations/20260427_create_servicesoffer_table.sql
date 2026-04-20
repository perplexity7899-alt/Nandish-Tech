-- Create servicesoffer table
CREATE TABLE servicesoffer (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price TEXT NOT NULL,
  price_unit TEXT DEFAULT 'onwards',
  features TEXT[] DEFAULT '{}',
  icon TEXT DEFAULT 'Code2',
  popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE servicesoffer ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read access" ON servicesoffer
  FOR SELECT
  USING (true);

-- Admin full access
CREATE POLICY "Allow admin full access" ON servicesoffer
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Grant permissions
GRANT SELECT ON servicesoffer TO anon, authenticated;
GRANT ALL ON servicesoffer TO authenticated;
GRANT ALL ON servicesoffer TO postgres;
