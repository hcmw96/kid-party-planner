-- AI invitation artwork: persist public Storage URLs on events.
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS art_url text;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.events TO anon, authenticated;

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

-- Authenticated organisers may upload/replace their own drafts if the client
-- ever writes directly; Edge Functions use the service role and bypass RLS.
DROP POLICY IF EXISTS "Authenticated upload invite-art" ON storage.objects;
CREATE POLICY "Authenticated upload invite-art"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'invite-art');

DROP POLICY IF EXISTS "Authenticated update invite-art" ON storage.objects;
CREATE POLICY "Authenticated update invite-art"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'invite-art')
  WITH CHECK (bucket_id = 'invite-art');
