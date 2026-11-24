import { getTemplate } from "../../src/lib/templates";
import { artworkHref, renderOgJpeg } from "../lib/renderOg";
import {
  cardCopy,
  fetchPublicEvent,
  isEventId,
  SUPABASE_URL,
} from "../../src/lib/sharePreview";

const supabaseUrl = () => process.env.VITE_SUPABASE_URL || SUPABASE_URL;

export default async (request: Request) => {
  const url = new URL(request.url);
  const id = (url.searchParams.get("id") ?? "").replace(/\.(png|jpe?g)$/i, "");
  if (!isEventId(id)) return new Response("Not found", { status: 404 });

  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!anonKey) return new Response("Missing configuration", { status: 500 });

  const event = await fetchPublicEvent(id, supabaseUrl(), anonKey);
  if (!event) return new Response("Not found", { status: 404 });

  const template = getTemplate(event.template || "classic");
  const copy = cardCopy(event);
  const imageHref = await artworkHref(event.artUrl);
  const jpeg = await renderOgJpeg({
    ...copy,
    background: template.palette.background,
    text: template.palette.text,
    muted: template.palette.muted,
    accent: template.palette.accent,
    imageHref,
  });

  return new Response(jpeg, {
    headers: {
      "content-type": "image/jpeg",
      "cache-control": "public, max-age=86400",
      "netlify-cdn-cache-control": "public, durable, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
};
