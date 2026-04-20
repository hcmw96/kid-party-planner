

# Fix the share link on the "Party created" screen

Two problems on StepThree:
1. **Ugly URL** — uses `window.location.origin`, which inside the Lovable editor becomes `https://id-preview--91aa954e-...lovable.app/party/<id>`. Long, not memorable, and routes through a Lovable interstitial page before loading.
2. **Visual treatment** — the link block is bulky and not as on-brand as the rest of the editorial flow.

## The URL fix

The interstitial appears because the preview URL (`id-preview--*.lovable.app`) is the editor-only sandbox. To get a clean, direct link, the project needs to be **published** — that gives a `partypal.lovable.app` (or similar) URL, or a custom domain, which loads the party page directly with no interstitial.

**Plan:**

1. **Use a stable share host.** Add an env-aware helper:
   - If `VITE_PUBLIC_SITE_URL` is set, use it (e.g. `https://partypal.lovable.app`).
   - Otherwise fall back to `window.location.origin`.
   
   Set `VITE_PUBLIC_SITE_URL` once the user publishes. This means the link is always the clean published URL, even when an organiser creates an event from the editor preview.

2. **Tell the user to publish + (optionally) connect a custom domain.** Without publishing, the share link will always be the preview URL. After publishing, the URL becomes `https://<projectname>.lovable.app/party/<id>` — short, direct, no interstitial.

3. **Shorten the displayed link.** Even with a clean URL, the event ID is a long UUID. Display a truncated version (`partypal.lovable.app/party/abc1…ef89`) in the input but copy the full URL. Or strip the `https://` prefix from the displayed value.

   *(Optional follow-up, not in this change):* generate a short slug per event (e.g. `josies-party-x4k2`) stored on the row, used in the URL instead of the UUID. Cleaner but requires a DB migration + slug-collision handling.

## The visual fix on StepThree

Match the editorial styling already used elsewhere:
- Replace the bulky `Input + icon button` row with a compact, centred display:
  - Show the URL as muted text in a subtle bordered card (no input chrome).
  - Copy button becomes a small inline text link: `Copy link` with the icon, in uppercase tracked sans (matching the existing "RSVP below to chip in" style on PartyPage).
- Add a small "OR" separator + "Open invitation" secondary link that opens `/party/:eventId` in a new tab so the organiser can preview it.
- Keep the dark "Go to dashboard" CTA.

## Files changed

- `src/lib/shareUrl.ts` (new) — `getShareUrl(eventId)` helper that prefers `VITE_PUBLIC_SITE_URL`.
- `src/components/EventForm/StepThree.tsx` — use the helper, restyle the link block, add "Open invitation" link, truncate displayed URL.
- `src/pages/Dashboard.tsx` — use the same helper for the "Copy share link" button so it's consistent.

## What the user needs to do

After this change, to actually get rid of the interstitial:
1. Click **Publish** (top-right in the editor) to get a clean `*.lovable.app` URL.
2. Optional: connect a custom domain (e.g. `partypal.app`) for the most polished share link.

I'll flag this in the response so it's clear the code change alone won't fully solve the interstitial — publishing is required.

