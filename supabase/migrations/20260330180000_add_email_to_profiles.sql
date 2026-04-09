-- Add email column to profiles table to store user email for quick access
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

COMMENT ON COLUMN public.profiles.email IS 'User email address for quick lookup without joining auth.users';
