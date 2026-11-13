# Brief: AI-generated invitation artwork

Build spec for the Cursor agent. The three-word prompt (favourite film,
favourite food, dream job) should drive **how the invitation looks**, not only
what it says. Text generation already exists and stays.

## What exists today

- `supabase/functions/generate-invite/` calls Anthropic and returns three
  wording options. Deployed and working, blocked only on account credit.
- `src/components/EventForm/StepInvite.tsx` is step 2 of the create flow. It
  collects the three answers and writes the chosen wording into
  `formData.description`.
- `src/lib/templates.ts` holds five hand-designed templates, each with a
  palette, font and mood. `InvitationCard` renders the chosen one.
- Events table has a `template` text column holding the template id.

## What to build

A second Edge Function, `generate-invite-art`, that turns the same three
answers into artwork for the invitation card, plus the UI to pick between
generated options.

### Hard constraints

**Never call OpenAI from the browser.** The key goes in Supabase secrets as
`OPENAI_API_KEY` and is read only inside the Edge Function. Anything with a
`VITE_` prefix ships to the client bundle.

**Do not reproduce copyrighted characters.** This is the single biggest risk
in this feature and it is not hypothetical: the worked example everyone keeps
using is "Paddington". If a parent types a film title and the model draws a
recognisable Paddington, Peppa Pig or Elsa onto an invitation that a
commercial product then sells, that is an infringement problem for the client,
not a quirk. The prompt sent to the image model must translate the answer into
**generic themes, never named characters or franchise-specific designs**. A
marmalade-and-duffel-coat palette with a red hat motif is fine. A bear in a
blue coat is not. Add an explicit instruction to the image prompt forbidding
named characters, logos, and recognisable franchise designs, and strip or
neutralise proper nouns before they reach the model.

**Stay inside the brand.** The audience is mothers at UK prep schools and the
reference point is Paperless Post. Generated art must sit behind the existing
typography and restrained palette, not fight it. Favour abstract or decorative
treatments (borders, motifs, textures, a background wash) over a literal
illustrated scene. An invitation that looks like clip art is worse than the
plain Classic Cream template.

### Suggested shape

1. **Edge Function `generate-invite-art`**
   - Input: `{ childName, age, film, food, dreamJob, partyType }`.
   - First pass: ask a text model to turn the three answers into a short art
     direction (palette, motifs, mood), explicitly stripping named characters.
   - Second pass: send that art direction to OpenAI's image endpoint.
   - Check OpenAI's current docs for the image model name and parameters
     rather than trusting any value written here, as these change.
   - Return image URLs plus the art direction used, so the UI can caption the
     options.
   - Mirror the error handling in `generate-invite`: return a readable message
     in the body, including the out-of-credit case.

2. **Storage**
   - OpenAI image URLs expire. Persist each chosen image to a Supabase Storage
     bucket (`invite-art`), public read, and store its path on the event.
   - New column on `events`, for example `art_url text null`. Add a migration
     under `supabase/migrations/`.
   - Remember table-level grants alongside RLS policies. Policies alone leave
     writes failing with a bare permission error, which is exactly what bit
     the `messages` table.

3. **UI**
   - Extend `StepInvite`, or add a step after it, offering generated artwork
     alongside the five existing templates. The hand-designed templates must
     remain selectable and remain the default.
   - `InvitationCard` renders `art_url` when present, falling back to the
     template treatment when not.

### Latency is the real UX problem

Image generation takes roughly 10 to 30 seconds per image, so three options is
potentially a minute of waiting. In a live demo that is an uncomfortable
silence. Options, in order of preference:

1. Generate one image, show it immediately, offer "try another".
2. Generate three in parallel and stream them in as they land.
3. Generate three sequentially behind a progress indicator. Worst option.

Whichever is chosen, show the wording options (which return in a second or
two) first, so something is on screen while the art renders.

### Cost

Image generation is roughly 10 to 40 times the cost of the text call, so
pennies rather than fractions of a penny per party. Confirm current pricing
before quoting a number. This strengthens the case for putting AI invites
behind the paid tier.

## Testing

- Verify the function from the browser with the anon key, as the generated
  images and any new table writes must work for an unauthenticated guest where
  relevant.
- Deliberately test copyright-adjacent inputs ("Frozen", "Paddington",
  "Spider-Man") and confirm the output contains no recognisable character.
- Confirm `OPENAI_API_KEY` appears nowhere in `dist/` after a build.
