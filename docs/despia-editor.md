# Despia Editor checklist (PartyPal)

Required for correct safe areas, UIKit chrome, and brand assets. Changes here need a **fresh Despia native rebuild**.

## App icon (required for brand)

Upload the balloon icon (`public/icon-512.png` in this repo) as the iOS/Android app icon in Despia Editor → App → Icons (and splash if applicable). PWA icons on Netlify update with a normal deploy; the store/TestFlight icon only changes after a Despia rebuild.

Suggested splash / status-bar background: ice blue `#EEF6FF` (RGB `238, 246, 255`).

## Status bar / safe areas (required)

1. Open **App → Settings → Status Bar**
2. Turn **Fullscreen Mode** **on** — lets CSS draw behind the status bar
3. Turn **Auto-Inject Safe Area** **off** — PartyPal applies insets in CSS via nav/tab chrome; leaving Auto-Inject on double-pads the layout

After toggling, ship a new Despia build. Netlify-only deploys do not pick up Editor settings.

## Quick Actions (optional, P3)

Long-press app icon shortcuts. Configure in Despia Editor, then wire JS globals:

| Shortcut label | Handler name (suggested) | Route |
| --- | --- | --- |
| My parties | `openParties` | `/parties` |
| Create party | `openCreateParty` | `/create` |

The runtime calls the global by name on launch. Handlers are registered in `src/hooks/useDespia.ts`.

## Local party reminder push (optional, P3)

Schedule with `sendlocalpushmsg://` from the dashboard (or after create) for the morning of the party. Requires notification permission already granted via OneSignal registration.

## Verify on device

Desktop browsers show zero safe-area insets. Confirm notch / home-indicator spacing on a physical iPhone Despia build.
