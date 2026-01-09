-- Create a secure function to get public stats (counts only, no sensitive data)
CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS JSON
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT json_build_object(
    'total_subdomains', (SELECT COUNT(*) FROM public.subdomains WHERE status = 'active'),
    'total_users', (SELECT COUNT(*) FROM public.profiles)
  );
$$;