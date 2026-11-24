export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export type OgCard = {
  name: string;
  line: string;
  detail: string;
  background: string;
  text: string;
  muted: string;
  accent: string;
  imageHref?: string | null;
};

function xml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function clip(value: string, max: number): string {
  const clean = value.replace(/\s+/g, " ").replace(/–/g, "-").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 3).trimEnd()}...`;
}

function nameSize(name: string): number {
  const widthAt = (size: number) => name.length * size * 0.56;
  let size = 96;
  while (size > 52 && widthAt(size) > 1040) size -= 4;
  return size;
}

export function buildOgSvg(card: OgCard): string {
  const name = xml(clip(card.name, 42));
  const line = xml(clip(card.line, 48));
  const detail = xml(clip(card.detail, 72));
  const size = nameSize(card.name);
  const overArt = Boolean(card.imageHref);
  const ink = overArt ? "#FFFFFF" : card.text;
  const quiet = overArt ? "rgba(255,255,255,0.82)" : card.muted;
  const kicker = overArt ? "#FFD4EA" : card.accent;
  const image = card.imageHref
    ? `<image href="${card.imageHref}" x="0" y="0" width="${OG_WIDTH}" height="${OG_HEIGHT}" preserveAspectRatio="xMidYMin slice"/>`
    : "";
  const scrim = overArt
    ? `<defs><linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#140E1C" stop-opacity="0.05"/><stop offset="46%" stop-color="#140E1C" stop-opacity="0.18"/><stop offset="100%" stop-color="#140E1C" stop-opacity="0.9"/></linearGradient></defs><rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="url(#scrim)"/>`
    : `<circle cx="1080" cy="-20" r="240" fill="${card.accent}" opacity="0.16"/><circle cx="80" cy="690" r="160" fill="${card.accent}" opacity="0.1"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="${card.background}"/>
  ${image}
  ${scrim}
  <text x="72" y="392" fill="${kicker}" font-family="Manrope Medium" font-size="28">You're invited</text>
  <text x="72" y="492" fill="${ink}" font-family="Manrope ExtraBold" font-size="${size}">${name}</text>
  <text x="72" y="546" fill="${quiet}" font-family="Manrope Medium" font-size="32">${line}</text>
  <text x="72" y="590" fill="${quiet}" font-family="Manrope Medium" font-size="26">${detail}</text>
</svg>`;
}
