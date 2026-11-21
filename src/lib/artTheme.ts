import type { InvitationTemplate } from "@/lib/templates";

/**
 * Colour and type direction produced by generate-invite-art and stored on
 * events.art_theme. It overrides the base template so an AI invite is
 * themed end to end, not just a faint background.
 */
export interface ArtTheme {
  background: string;
  text: string;
  accent: string;
  muted: string;
  font?: "playfair" | "cormorant" | "cormorant_italic";
  mood?: string;
  caption?: string;
}

const HEX = /^#[0-9a-f]{6}$/i;

const FONTS: Record<NonNullable<ArtTheme["font"]>, { family: string; style?: string }> = {
  playfair: { family: "'Playfair Display', serif" },
  cormorant: { family: "'Cormorant Garamond', serif" },
  cormorant_italic: { family: "'Cormorant Garamond', serif", style: "italic" },
};

/** Accepts whatever came back from the DB and returns a usable theme or null. */
export const parseArtTheme = (value: unknown): ArtTheme | null => {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const ok = ["background", "text", "accent", "muted"].every(
    (k) => typeof v[k] === "string" && HEX.test(v[k] as string),
  );
  if (!ok) return null;
  return {
    background: v.background as string,
    text: v.text as string,
    accent: v.accent as string,
    muted: v.muted as string,
    font: typeof v.font === "string" && v.font in FONTS ? (v.font as ArtTheme["font"]) : undefined,
    mood: typeof v.mood === "string" ? v.mood : undefined,
    caption: typeof v.caption === "string" ? v.caption : undefined,
  };
};

/** Merge an AI theme over a base template. */
export const applyArtTheme = (
  base: InvitationTemplate,
  theme: ArtTheme | null,
): InvitationTemplate => {
  if (!theme) return base;
  const font = theme.font ? FONTS[theme.font] : undefined;
  return {
    ...base,
    id: "ai_art",
    palette: {
      ...base.palette,
      background: theme.background,
      card: theme.background,
      text: theme.text,
      accent: theme.accent,
      muted: theme.muted,
    },
    fontFamily: font?.family ?? base.fontFamily,
    fontStyle: font?.style ?? base.fontStyle,
  };
};
