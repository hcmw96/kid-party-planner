import { ageFromTitle, formatPartyDate, splitPartyNotes } from "./party";

const EVENT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const SUPABASE_URL = "https://gbkfxfqjavvojewjwkvq.supabase.co";

export type InviteFields = {
  childName: string;
  title?: string | null;
  date: string;
  location?: string | null;
  description?: string | null;
};

export type PublicEvent = InviteFields & {
  id: string;
  template: string;
  artUrl: string | null;
};

export type PreviewMeta = {
  title: string;
  description: string;
  url: string;
  image: string;
  imageAlt: string;
};

export function isEventId(value: string): boolean {
  return EVENT_ID.test(value);
}

export function inviteTitle(input: InviteFields): string {
  const title = input.title?.trim();
  if (title) return title;
  const name = input.childName.trim() || "Someone";
  return `${name}'s party`;
}

export function inviteDescription(input: InviteFields): string {
  const { timeLabel } = splitPartyNotes(input.description);
  const when = [formatPartyDate(input.date), timeLabel?.replace("–", "to")]
    .filter(Boolean)
    .join(" · ");
  const where = input.location?.trim() ?? "";
  return [when, where].filter(Boolean).join(" · ");
}

export function shareMessage(input: InviteFields): string {
  const title = inviteTitle(input);
  const description = inviteDescription(input);
  return description ? `You're invited to ${title}\n${description}` : `You're invited to ${title}`;
}

export function cardCopy(input: InviteFields): { name: string; line: string; detail: string } {
  const name = input.childName.trim() || "The birthday star";
  const age = ageFromTitle(input.title);
  return {
    name,
    line: age ? `is turning ${age}` : "is having a birthday",
    detail: inviteDescription(input),
  };
}

export function previewVersion(parts: Array<string | null | undefined>): string {
  let hash = 0;
  const text = parts.map((part) => part ?? "").join("|");
  for (let i = 0; i < text.length; i += 1) {
    hash = (Math.imul(hash, 31) + text.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function replaceTag(html: string, pattern: RegExp, tag: string): string {
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace("</head>", `${tag}\n</head>`);
}

export function injectPreview(html: string, meta: PreviewMeta): string {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const image = escapeHtml(meta.image);
  const url = escapeHtml(meta.url);
  const alt = escapeHtml(meta.imageAlt);
  let next = html;
  next = replaceTag(next, /<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  next = replaceTag(
    next,
    /<meta\s+name="description"\s+content="[^"]*">/,
    `<meta name="description" content="${description}">`,
  );
  next = replaceTag(
    next,
    /<meta\s+property="og:title"\s+content="[^"]*">/,
    `<meta property="og:title" content="${title}">`,
  );
  next = replaceTag(
    next,
    /<meta\s+name="twitter:title"\s+content="[^"]*">/,
    `<meta name="twitter:title" content="${title}">`,
  );
  next = replaceTag(
    next,
    /<meta\s+property="og:description"\s+content="[^"]*">/,
    `<meta property="og:description" content="${description}">`,
  );
  next = replaceTag(
    next,
    /<meta\s+name="twitter:description"\s+content="[^"]*">/,
    `<meta name="twitter:description" content="${description}">`,
  );
  next = replaceTag(
    next,
    /<meta\s+property="og:image"\s+content="[^"]*">/,
    `<meta property="og:image" content="${image}">`,
  );
  next = replaceTag(
    next,
    /<meta\s+name="twitter:image"\s+content="[^"]*">/,
    `<meta name="twitter:image" content="${image}">`,
  );
  next = replaceTag(
    next,
    /<meta\s+property="og:url"\s+content="[^"]*">/,
    `<meta property="og:url" content="${url}">`,
  );
  const extras = [
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:type" content="image/jpeg">`,
    `<meta property="og:image:alt" content="${alt}">`,
  ]
    .filter((tag) => !next.includes(tag))
    .join("\n");
  if (!extras) return next;
  return next.replace("</head>", `${extras}\n</head>`);
}

export async function fetchPublicEvent(
  id: string,
  supabaseUrl: string,
  anonKey: string,
): Promise<PublicEvent | null> {
  if (!isEventId(id)) return null;
  const endpoint = new URL("/rest/v1/events", supabaseUrl);
  endpoint.searchParams.set("id", `eq.${id}`);
  endpoint.searchParams.set(
    "select",
    "id,child_name,title,date,location,description,template,art_url",
  );
  const response = await fetch(endpoint, {
    headers: {
      apikey: anonKey,
      authorization: `Bearer ${anonKey}`,
      accept: "application/json",
    },
  });
  if (!response.ok) return null;
  const rows = (await response.json()) as Array<{
    id: string;
    child_name: string;
    title: string;
    date: string;
    location: string;
    description: string | null;
    template: string;
    art_url: string | null;
  }>;
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    childName: row.child_name,
    title: row.title,
    date: row.date,
    location: row.location,
    description: row.description,
    template: row.template,
    artUrl: row.art_url,
  };
}
