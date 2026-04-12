

# Native iOS App — No-Scroll Pages + Viewport Fix

Since this is a native iOS app (Despia WebView), pages should fill the viewport exactly without scrolling. The content needs to fit within the safe area.

## Changes

### 1. Global styles (`src/index.css`)
- Set `html, body, #root` to `height: 100%` and `overflow: hidden` by default
- Add a utility class `.page-scrollable` that opts specific pages back into scrolling (for pages like Dashboard or PartyPage that genuinely need it)

### 2. Landing page (`src/pages/Landing.tsx`)
- Change `min-h-screen` to `h-screen` with `overflow-hidden`
- Tighten spacing so all content fits in a single viewport — reduce gaps, compress feature cards
- Use `flex-1` to let the content area fill available space without overflowing

### 3. Login page (`src/pages/Login.tsx`)
- Change `min-h-screen` to `h-screen` with `overflow-hidden`
- Already centred, should fit naturally

### 4. ThankYou page (`src/pages/ThankYou.tsx`)
- Same treatment — `h-screen overflow-hidden`, centred content

### 5. Pages that DO scroll
- `Dashboard.tsx`, `PartyPage.tsx`, `CreateEvent.tsx` — these have variable-length content and should keep `min-h-screen` with normal scroll behaviour
- Apply `.page-scrollable` class to their wrapper

### Technical detail
- On `#root`: `height: 100%; overflow: hidden` as the default
- Scrollable pages override with `overflow-y: auto` on their own wrapper
- This prevents iOS rubber-band bounce on fixed pages

