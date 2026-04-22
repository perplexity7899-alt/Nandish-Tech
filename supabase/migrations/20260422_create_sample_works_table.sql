-- Create sample_works table for storing free sample projects
CREATE TABLE sample_works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  tech_stack TEXT[] DEFAULT ARRAY[]::TEXT[],
  live_url VARCHAR(500),
  github_url VARCHAR(500),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for ordering
CREATE INDEX idx_sample_works_order ON sample_works(order_index);
CREATE INDEX idx_sample_works_active ON sample_works(is_active);

-- Add RLS (Row Level Security) policies
ALTER TABLE sample_works ENABLE ROW LEVEL SECURITY;

-- Anyone can view sample works (public read)
CREATE POLICY "Sample works are viewable by anyone" 
  ON sample_works 
  FOR SELECT 
  USING (is_active = true);

-- Only authenticated users (admin) can insert/update/delete
CREATE POLICY "Only authenticated users can modify sample works" 
  ON sample_works 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update sample works" 
  ON sample_works 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can delete sample works" 
  ON sample_works 
  FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sample_works_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER sample_works_updated_at_trigger
BEFORE UPDATE ON sample_works
FOR EACH ROW
EXECUTE FUNCTION update_sample_works_timestamp();
