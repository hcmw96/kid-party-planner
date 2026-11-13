-- AI invitation artwork: persist public Storage URLs on events.
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS art_url text;

-- Public-read bucket for generated invite backgrounds.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invite-art',
  'invite-art',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read invite-art" ON storage.objects;
CREATE POLICY "Public read invite-art"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'invite-art');

-- No client-side writes to this bucket. The Edge Function uploads with the
-- service role, which bypasses RLS entirely. Unscoped INSERT/UPDATE policies
-- for `authenticated` would let any signed-up host overwrite another host's
-- artwork, so they are deliberately absent. Add path-scoped policies here if
-- direct client upload is ever needed.
DROP POLICY IF EXISTS "Authenticated upload invite-art" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update invite-art" ON storage.objects;
