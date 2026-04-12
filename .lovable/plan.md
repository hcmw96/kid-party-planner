

# Visual Rebrand + Invitation Templates

This is a significant aesthetic overhaul touching every page, plus a new template system for the guest-facing RSVP page. The work breaks into three areas.

---

## 1. Design System Overhaul

**Fonts**: Add Google Fonts — Cormorant Garamond (serif headings) + DM Sans (body/UI). Load via `index.html` `<link>` tags.

**Colour palette** (update CSS custom properties in `index.css`):
- `--background`: #FAF8F5 (warm off-white)
- `--foreground`: #1C1C1E (deep charcoal)
- Accent: dusty rose `#C9A99A` as `--primary`
- Card surfaces: pure white `#FFFFFF` with subtle shadow, no border
- Muted tones adjusted to match warm cream palette
- Remove coral, lavender, mint from current palette

**Buttons**: `rounded-lg` (8px) instead of current `rounded-md`. Full-width on mobile. Filled primary, ghost/outline secondary. Never pill-shaped.

**Icons**: Switch from filled Lucide defaults to `strokeWidth={1.5}` thin-line icons throughout. Remove emoji-style icons from UI chrome (keep in copy text).

**Spacing**: Increase padding throughout — `p-8` on cards, generous `gap-8` between sections.

**Loading states**: Replace any spinner text with skeleton screens using the existing `Skeleton` component styled to match cream cards.

**Transitions**: Add `transition-opacity duration-300` fade transitions. Remove any slide/bounce if present.

---

## 2. Database Change

Add a `template` column to the `events` table:

```sql
ALTER TABLE public.events 
ADD COLUMN template TEXT NOT NULL DEFAULT 'classic_cream';
```

Values: `garden_party`, `midnight_disco`, `paintbox`, `classic_cream`, `wildflower`.

---

## 3. Invitation Template System

### Template data structure
Create `src/lib/templates.ts` defining the 5 templates, each with:
- `id`, `name`, `description`
- `palette` (background, text, accent colours)
- `fontFamily` (heading font override)
- `mood` description for the preview

### Template selection in event creation
Add a new step between current Step 1 (party details) and Step 2 (gift). This becomes a 4-step flow:
- Step 1: Party details (unchanged)
- **Step 2 (new): Choose your invitation** — full-bleed preview cards of all 5 templates, swipeable/scrollable. Each shows a rendered preview with the child's name from Step 1. Feels like choosing stationery.
- Step 3: Group gift (existing Step 2)
- Step 4: Confirm & share (existing Step 3)

Update `EventFormData` to include `template: string`.

### Template rendering on PartyPage
Rework `PartyPage.tsx` so the entire page is themed by the event's template:
- Background, typography, and accent colours come from the template
- Party details (name, date, location) are typeset within the template design — like text on a card
- Each template gets its own visual treatment via CSS classes/inline styles
- The RSVP form sits below the invitation "card" area, styled to complement but not override the template

### The 5 templates (CSS/Tailwind, no images needed initially):

1. **Garden Party** — sage green bg, ivory card, Cormorant italic title, subtle border with leaf-like corner decorations via CSS
2. **Midnight Disco** — deep navy `#1A1F3C` bg, gold `#C9A96E` accents, thin gold rule lines, uppercase spaced serif title
3. **Paintbox** — cream bg, terracotta/ochre/teal colour blocks, slightly expressive positioning
4. **Classic Cream** — champagne/cream, single thin border rule, Playfair Display, monogram-style child's initial
5. **Wildflower** — warm blush bg, butter yellow accents, Cormorant with generous letter-spacing

---

## 4. Files to Create/Modify

| File | Action |
|------|--------|
| `index.html` | Add Google Fonts links (Cormorant Garamond, DM Sans, Playfair Display) |
| `src/index.css` | New colour palette, font-family defaults |
| `tailwind.config.ts` | Add `fontFamily` extend for serif/sans, update radius |
| `src/lib/templates.ts` | **New** — template definitions |
| `src/components/InvitationPreview.tsx` | **New** — renders a template preview card |
| `src/components/EventForm/StepTemplate.tsx` | **New** — template selection step |
| `src/components/InvitationCard.tsx` | **New** — full template rendering for PartyPage |
| `src/pages/CreateEvent.tsx` | Add template step, update form data + DB insert |
| `src/pages/PartyPage.tsx` | Use template to theme the page |
| `src/pages/Landing.tsx` | Restyle with new palette, serif headings, refined tone |
| `src/pages/Login.tsx` | Restyle with new palette |
| `src/pages/Dashboard.tsx` | Restyle — base UI palette only, no templates |
| `src/pages/ThankYou.tsx` | Restyle |
| `src/components/RSVPForm.tsx` | Restyle cards, buttons, spacing |
| `src/components/GuestList.tsx` | Restyle |
| `src/components/GiftProgress.tsx` | Restyle |
| `src/components/EventForm/StepOne.tsx` | Restyle |
| `src/components/EventForm/StepTwo.tsx` | Restyle |
| `src/components/EventForm/StepThree.tsx` | Restyle |
| `src/components/ui/button.tsx` | Update border-radius to 8px, adjust variants |
| `src/components/ui/card.tsx` | Remove border, add subtle shadow |
| Memory files | Update design tokens |

### Copy/tone adjustments
- Landing headline: refine to something warmer, e.g. "The easiest way to organise a children's party"
- Remove exclamation-heavy copy. Warm but restrained.
- Keep emoji in template/guest-facing copy, remove from UI chrome

---

## Technical Notes
- Templates are pure frontend — no images, SVGs defined in code or CSS pseudo-elements for decorative corners/rules
- Google Fonts loaded via `<link>` for Cormorant Garamond, DM Sans, and Playfair Display
- Template palette applied via inline CSS variables on the PartyPage wrapper, so Tailwind utility classes still work with `hsl(var(...))` pattern
- Database migration adds `template` column with default `classic_cream`

