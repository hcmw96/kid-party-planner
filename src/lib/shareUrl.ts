// Returns the canonical share URL for an event.
// Prefers VITE_PUBLIC_SITE_URL (set after publishing) so links don't
// route through the Lovable editor preview interstitial.
export const getShareBase = (): string => {
  const env = (import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined)?.trim();
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "";
};

export const getShareUrl = (eventId: string): string => `${getShareBase()}/party/${eventId}`;

// Display-friendly version: strip protocol, truncate the UUID.
export const getDisplayShareUrl = (eventId: string): string => {
  const full = getShareUrl(eventId).replace(/^https?:\/\//, "");
  const shortId = eventId.length > 12 ? `${eventId.slice(0, 4)}…${eventId.slice(-4)}` : eventId;
  return full.replace(eventId, shortId);
};
