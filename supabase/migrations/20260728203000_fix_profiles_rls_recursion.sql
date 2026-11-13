-- Fix infinite recursion in profiles RLS.
-- Admin policies that SELECT FROM profiles inside a profiles policy (or from
-- other tables' policies that then re-enter profiles RLS) recurse forever.
-- Use a SECURITY DEFINER helper so the admin check bypasses RLS.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read all events" ON public.events;
CREATE POLICY "Admins can read all events"
  ON public.events FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read all guests" ON public.guests;
CREATE POLICY "Admins can read all guests"
  ON public.guests FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read all donations" ON public.donations;
CREATE POLICY "Admins can read all donations"
  ON public.donations FOR SELECT
  USING (public.is_admin());
