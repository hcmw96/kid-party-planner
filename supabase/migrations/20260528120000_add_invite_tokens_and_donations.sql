-- Add invite_token to guests (unique per guest, used in the public RSVP URL)
ALTER TABLE public.guests
  ADD COLUMN IF NOT EXISTS invite_token TEXT UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', '');

-- Backfill any existing guests
UPDATE public.guests SET invite_token = replace(gen_random_uuid()::text, '-', '') WHERE invite_token IS NULL;

-- Make it non-nullable going forward
ALTER TABLE public.guests ALTER COLUMN invite_token SET NOT NULL;

-- Donations table (populated by Stripe webhook)
CREATE TABLE IF NOT EXISTS public.donations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id          UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  guest_id          UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  stripe_session_id TEXT UNIQUE,
  amount_pence      INTEGER NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'gbp',
  donor_name        TEXT,
  donor_email       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organisers can view donations for their events"
  ON public.donations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = donations.event_id
      AND events.organiser_id = auth.uid()
    )
  );

-- Update gift_amount tracking on events
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS gift_pot_total INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_gift_pot(p_event_id UUID, p_amount INTEGER)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.events
  SET gift_pot_total = gift_pot_total + p_amount
  WHERE id = p_event_id;
$$;
