

# RSVP page: show gift link + add party description

Two changes:

## 1. Add `description` field to events

**Database migration**: add `description text` (nullable) to `events` table.

**`StepOne.tsx`**: add a textarea field after location — "Party details (optional)" — for times, what to bring, address details, dress code, etc. Underline-style consistent with other fields (textarea with bottom border only).

**`CreateEvent.tsx`**: add `description: ""` to `EventFormData`, include it in the insert.

**`InvitationCard.tsx`**: render the description below date/location as a soft, centred paragraph in the template's muted colour, preserving line breaks (`whitespace-pre-line`).

## 2. Surface the gift contribution on the invitation (before RSVP)

Currently the "Pay £X" button only appears on the RSVP success screen. Move/duplicate so parents see it inline on the party page.

**`PartyPage.tsx`**: between the InvitationCard and RSVPForm, add a `GiftCallout` block (only when `event.gift_enabled` and `gift_amount > 0`) — shows the gift icon, amount, short copy, and a "Chip in £X" button that scrolls to / opens a Stripe checkout session directly (re-uses the existing `create-checkout-session` edge function, but without requiring a guest_id — or prompts name/email first).

**Decision needed for the gift flow** — the existing checkout requires a `guest_id`. Two options:
- **A) Keep gift tied to RSVP** (current behaviour): leave checkout post-RSVP, but add a clear preview banner on the invitation saying "£X group gift — chip in after you RSVP" so parents see the ask immediately. No backend changes.
- **B) Allow standalone gifting**: parents can pay without RSVPing. Requires edge function update to create a guest record on the fly with name/email captured in a small modal.

Recommending **A** — simpler, keeps RSVP as the single entry point, and the friction is minimal since the RSVP form is right there. The banner makes the ask visible immediately.

## Files changed
- `supabase/migrations/` (new — add `description` column)
- `src/components/EventForm/StepOne.tsx` (textarea field)
- `src/pages/CreateEvent.tsx` (form data + insert)
- `src/components/InvitationCard.tsx` (render description)
- `src/pages/PartyPage.tsx` (add GiftCallout banner above RSVP form)

