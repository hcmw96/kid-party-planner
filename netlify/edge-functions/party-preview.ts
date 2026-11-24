import {
  fetchPublicEvent,
  injectPreview,
  inviteDescription,
  inviteTitle,
  isEventId,
  previewVersion,
  SUPABASE_URL,
} from "../../src/lib/sharePreview.ts";

declare const Netlify: { env: { get: (name: string) => string | undefined } };

const PARTY_PATH = /^\/party\/([0-9a-f-]{36})\/?$/i;

export default async function partyPreview(request: Request, context: { next: () => Promise<Response> }) {
  const url = new URL(request.url);
  const match = url.pathname.match(PARTY_PATH);
  if (!match || !isEventId(match[1])) return context.next();

  const response = await context.next();
  const type = response.headers.get("content-type") ?? "";
  if (!type.includes("text/html")) return response;

  const anonKey = Netlify.env.get("VITE_SUPABASE_ANON_KEY");
  if (!anonKey) return response;

  const body = response.clone();
  try {
    const event = await fetchPublicEvent(match[1], Netlify.env.get("VITE_SUPABASE_URL") || SUPABASE_URL, anonKey);
    if (!event) return response;
    const title = inviteTitle(event);
    const description = inviteDescription(event);
    const version = previewVersion([event.artUrl, title, description, event.template]);
    const html = injectPreview(await body.text(), {
      title,
      description,
      url: `${url.origin}/party/${event.id}`,
      image: `${url.origin}/og/${event.id}.jpg?v=${version}`,
      imageAlt: `${title} invitation`,
    });
    const headers = new Headers(response.headers);
    headers.set("content-type", "text/html; charset=utf-8");
    headers.delete("content-length");
    return new Response(html, { status: response.status, headers });
  } catch {
    return response;
  }
}
