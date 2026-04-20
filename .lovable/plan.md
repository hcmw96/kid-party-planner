

# Real location lookup + add-to-calendar

Two related changes that lean on the same data: a real address (with coordinates) so we can both autocomplete it during creation and produce an accurate `.ics` for guests.

## 1. Real location lookup in StepOne

Replace the free-text "Location" input with an autocomplete that returns a structured place (name, formatted address, lat/lng).

**Provider: Mapbox Places API** — generous free tier, simple REST, no billing setup vs Google Places. Single token (`MAPBOX_PUBLIC_TOKEN`) — public, safe in client. (If you'd prefer Google Places, say so and I'll swap.)

**DB migration** — add to `events`:
- `location_address text` (full formatted address)
- `location_lat double precision`
- `location_lng double precision`
- keep `location text` as the friendly display name (e.g. "Hyde Park")

**UI** — new `<LocationAutocomplete />` component:
- Underline input matching StepOne's style
- Debounced query (300ms) → Mapbox `/geocoding/v5/mapbox.places/{q}.json`
- Dropdown of suggestions (name + secondary address line)
- On select: stores `{name, address, lat, lng}` in form state
- Allows free-text fallback if nothing matches (sets only `location`, leaves coords null)

`CreateEvent.tsx` — extend `EventFormData` with the structured fields, include them in the insert.

## 2. Add-to-calendar `.ics` on RSVP success

After a guest RSVPs "yes", show a small "Add to calendar" link on the success card in `RSVPForm.tsx`.

**Approach** — generate `.ics` client-side (no edge function needed) using a tiny inline helper:
- `BEGIN:VCALENDAR` / `VEVENT` block
- `SUMMARY`: "{childName}'s Party"
- `DTSTART;VALUE=DATE` / `DTEND;VALUE=DATE` (all-day, since `events.date` is a date with no time — see open question below)
- `LOCATION`: prefer `location_address`, fall back to `location`
- `GEO:lat;lng` when coordinates exist (Apple Calendar uses this for map pins)
- `DESCRIPTION`: event description + party page URL
- `UID`: `{event.id}@partypal`

Trigger via `Blob` + temporary `<a download="party.ics">` click — works on iOS Safari (opens Calendar), Android, desktop.

Add a matching "Add to calendar" link on `PartyPage.tsx` gift callout area too, so guests who already RSVP'd from a different device can still grab it.

## Open question: event time

`events.date` is a `date` (no time). For a useful `.ics` we should capture start/end times. Two options:
- **Quick**: keep all-day events for now; users put times in the description.
- **Proper**: add `start_time` + `end_time` columns and time pickers in StepOne.

Recommending **quick** for this pass to keep scope tight — calendar entry will be all-day, with times shown in the description. We can do proper times in a follow-up.

## Files

- `supabase/migrations/` — add `location_address`, `location_lat`, `location_lng`
- `src/components/LocationAutocomplete.tsx` (new)
- `src/lib/ics.ts` (new) — `generateIcs()` + `downloadIcs()` helpers
- `src/components/EventForm/StepOne.tsx` — swap location input for autocomplete
- `src/pages/CreateEvent.tsx` — extend form data + insert
- `src/components/RSVPForm.tsx` — "Add to calendar" link on success
- `src/pages/PartyPage.tsx` — optional secondary "Add to calendar" link

## Secret needed

`MAPBOX_PUBLIC_TOKEN` — public token from mapbox.com (free account, ~100k geocode requests/month free). I'll request it via `add_secret` once you approve.

