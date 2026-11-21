-- AI invitation theme: colours and font chosen alongside the generated artwork,
-- so the invite card matches the art instead of falling back to a stock template.
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS art_theme jsonb;
