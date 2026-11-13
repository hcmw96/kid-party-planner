-- Restore table privileges stripped from anon/authenticated.
-- RLS still enforces row access; these grants are required at the role level.

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.events TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.guests TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.donations TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO anon, authenticated;

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
