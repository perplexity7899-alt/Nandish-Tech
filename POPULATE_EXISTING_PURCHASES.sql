-- Update existing project_purchases records with client_name and client_email from auth users and profiles
UPDATE public.project_purchases pp
SET 
  client_email = COALESCE(pp.client_email, au.email),
  client_name = COALESCE(pp.client_name, pr.full_name, au.email)
FROM auth.users au
LEFT JOIN public.profiles pr ON pr.id = au.id
WHERE pp.user_id = au.id
  AND (pp.client_email IS NULL OR pp.client_name IS NULL);
