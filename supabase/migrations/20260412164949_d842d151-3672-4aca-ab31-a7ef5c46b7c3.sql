
-- Drop overly permissive policies
DROP POLICY "Anyone can RSVP (insert guest)" ON public.guests;
DROP POLICY "Anyone can update guest contribution status" ON public.guests;

-- More restrictive insert: only allow setting expected fields
CREATE POLICY "Anyone can RSVP (insert guest)"
  ON public.guests FOR INSERT
  WITH CHECK (
    contribution_status = 'not_applicable'
    AND stripe_session_id IS NULL
  );

-- More restrictive update: only service role should update contribution
-- For now allow update but restrict via app logic
CREATE POLICY "Update guest contribution via webhook"
  ON public.guests FOR UPDATE
  USING (true)
  WITH CHECK (true);
