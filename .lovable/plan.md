

# Refine StepOne to Match Reference Design

Matching the reference screenshot: serif italic title, underline-only inputs, split date picker, step indicator text, and "Continue" CTA.

## Changes

### 1. `src/components/EventForm/StepOne.tsx` — Full restyle

- **Title**: Use `font-serif italic` for "Party details" heading
- **Step hint**: Add "STEP 1 OF 3" label above the title in uppercase, small, muted, tracked-wide
- **Labels**: Uppercase, small, letter-spaced, muted — matching the reference (`text-xs uppercase tracking-widest text-muted-foreground`)
- **Inputs**: Remove bordered Input component. Use custom underline-only inputs: `border-0 border-b border-muted-foreground/30 rounded-none bg-transparent focus:border-foreground px-0`. Dark underline when field has a value.
- **Date field**: Replace single `<input type="date">` with 3 separate fields — Day, Month, Year. Day and Year as number inputs, Month as a `<select>` with month names. Each gets the underline style, laid out in a 3-column grid.
- **Placeholders**: Softer — "First name" not "e.g. Sarah", "Venue name or address" not "e.g. The Village Hall"
- **Button**: Change "Next" to "Continue" in uppercase with tracking
- **Footer hint**: Add "Gift options on the next step" below the button in small muted text
- **Validation**: Parse the 3 date segments back into a `YYYY-MM-DD` string for the form data

### 2. `src/pages/CreateEvent.tsx` — Minor

- Update `totalSteps` display context — the step hint is now inside each step component, not global. No structural change needed; the progress bar stays.

### 3. `src/components/EventForm/StepTwo.tsx` and `StepTemplate.tsx`

- Apply same input/label styling pattern for consistency (underline inputs, uppercase labels)
- Update button text to "Continue" where appropriate

