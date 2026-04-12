

# PartyPal — Build Plan

## Overview
A mobile-first React web app for organising children's parties. Organisers sign up, create events, and share a link. Guests RSVP and optionally pay via Stripe — no login required. Deployed as a Despia-wrapped iOS app.

## Tech Decisions
- **Frontend**: React (Lovable), mobile-first, Tailwind CSS
- **Backend**: Lovable Cloud (Supabase) — auth, database, edge functions
- **Payments**: Stripe hosted checkout via edge function
- **Email**: Lovable Cloud built-in email (simplest path; can swap to Resend later)
- **iOS**: Despia — install `despia-native` SDK, add safe area CSS vars, environment detection
- **Design**: Soft, warm pastel palette — friendly parent-facing aesthetic

## Design System
- **Primary**: Warm coral/peach (`hsl(12, 76%, 61%)`)
- **Secondary**: Soft lavender (`hsl(270, 50%, 80%)`)
- **Accent**: Mint green (`hsl(160, 45%, 65%)`)
- **Background**: Warm off-white (`hsl(30, 25%, 97%)`)
- **Text**: Warm dark (`hsl(20, 20%, 18%)`)
- **Font**: Inter with rounded feel, larger tap targets
- **Radius**: 1rem (rounded, friendly)

## Database Schema (Supabase)

**Table: `events`**
- `id` uuid PK, `organiser_id` references auth.users, `title`, `child_name`, `date`, `location`, `organiser_name`, `gift_enabled` boolean, `gift_amount` integer (pence), `created_at`

**Table: `guests`**
- `id` uuid PK, `event_id` references events, `name`, `email`, `rsvp_status` enum (pending/attending/not_attending), `dietary_notes` text nullable, `contribution_status` enum (not_applicable/unpaid/paid), `stripe_session_id` text nullable, `created_at`

**RLS**: Organisers can read/write their own events + guests. Public read on events by UUID. Public insert on guests (for RSVP). No auth required for guest rows.

## Implementation Steps

### Step 1: Design system + routing
- Update `index.css` with warm pastel palette
- Set up routes: `/`, `/login`, `/create`, `/dashboard/:eventId`, `/party/:eventId`, `/party/:eventId/thank-you`
- Install `despia-native`, add safe area CSS (`--safe-area-top`, `--safe-area-bottom`)

### Step 2: Auth (organiser only)
- Supabase Auth with email/password + magic link
- Login/signup page at `/login`
- Auth guard on `/create` and `/dashboard/:eventId`
- Redirect to `/create` after login

### Step 3: Landing page
- Marketing page at `/` — "Organise a party in 2 minutes" hero
- CTA → `/login` (sign up / log in)

### Step 4: Event creation flow (3 steps)
- Step 1: Child's name, party date, location, organiser name
- Step 2: Toggle group gift on/off, set £ amount
- Step 3: Summary + generate shareable link, copy-to-clipboard
- Insert into `events` table on completion

### Step 5: Guest RSVP flow (`/party/:eventId`)
- Fetch event details (public, no auth)
- Show party info (child name, date, location)
- RSVP form: name, email, Yes/No, optional dietary notes
- Insert into `guests` table
- If attending + gift enabled → show "Chip in" button

### Step 6: Stripe integration
- Edge function `create-checkout-session`: takes `guest_id`, `event_id`, creates Stripe checkout session for fixed amount, returns URL
- "Pay" button redirects to Stripe hosted checkout
- Success redirect → `/party/:eventId/thank-you`
- Webhook edge function to mark `contribution_status = paid`

### Step 7: Organiser dashboard (`/dashboard/:eventId`)
- Attendance list grouped by status
- Dietary/allergy summary (aggregated)
- Gift progress: "X of Y paid" + total £
- Actions: copy share link, send update (all attending), send reminder (pending)

### Step 8: Email edge functions
- `send-event-email`: sends organiser's custom message to attending guests
- Reminder variant: sends nudge to pending guests
- Clean, mobile-friendly templates matching app branding

### Step 9: Despia polish
- Environment detection (`navigator.userAgent.includes('despia')`)
- Safe area insets for notch/home bar
- Haptic feedback on key interactions (RSVP submit, payment success)
- Native share sheet for share link action

## File Structure (key new files)
```text
src/
  pages/
    Landing.tsx
    Login.tsx
    CreateEvent.tsx
    PartyPage.tsx
    ThankYou.tsx
    Dashboard.tsx
  components/
    EventForm/
      StepOne.tsx
      StepTwo.tsx
      StepThree.tsx
    RSVPForm.tsx
    GuestList.tsx
    GiftProgress.tsx
  hooks/
    useEvent.ts
    useGuests.ts
  lib/
    despia.ts        # environment detection + helpers
  integrations/
    supabase/        # auto-generated client + types
supabase/
  functions/
    create-checkout-session/
    stripe-webhook/
    send-event-email/
```

## Out of Scope (per spec)
No custom payment UI, wallets, chat, contact import, analytics dashboards, admin panels, push notifications, SMS, or custom branding per event.

