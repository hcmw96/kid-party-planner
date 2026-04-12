
-- Create enums
CREATE TYPE public.rsvp_status AS ENUM ('pending', 'attending', 'not_attending');
CREATE TYPE public.contribution_status AS ENUM ('not_applicable', 'unpaid', 'paid');

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organiser_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  child_name TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT NOT NULL,
  organiser_name TEXT NOT NULL,
  gift_enabled BOOLEAN NOT NULL DEFAULT false,
  gift_amount INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create guests table
CREATE TABLE public.guests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  rsvp_status public.rsvp_status NOT NULL DEFAULT 'pending',
  dietary_notes TEXT,
  contribution_status public.contribution_status NOT NULL DEFAULT 'not_applicable',
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Organisers can manage their own events"
  ON public.events FOR ALL
  USING (auth.uid() = organiser_id)
  WITH CHECK (auth.uid() = organiser_id);

CREATE POLICY "Anyone can view events by ID"
  ON public.events FOR SELECT
  USING (true);

-- Guests policies
CREATE POLICY "Organisers can view guests for their events"
  ON public.guests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = guests.event_id
      AND events.organiser_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can RSVP (insert guest)"
  ON public.guests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update guest contribution status"
  ON public.guests FOR UPDATE
  USING (true)
  WITH CHECK (true);
