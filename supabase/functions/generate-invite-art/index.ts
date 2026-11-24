import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

/** Fast everyday GPT Image model — confirm against OpenAI docs if this drifts. */
const IMAGE_MODEL = "gpt-image-2.5-flare";
const TEXT_MODEL = "gpt-4.1-mini";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type ArtInput = {
  childName?: string;
  age?: string | number;
  inspiration?: string;
  film?: string;
  partyType?: string;
};

type ArtDirection = {
  palette: string;
  motifs: string;
  mood: string;
  imagePrompt: string;
  caption: string;
};

function readableApiError(status: number, body: string): string {
  const lower = body.toLowerCase();
  if (
    status === 402 ||
    lower.includes("credit") ||
    lower.includes("billing") ||
    lower.includes("insufficient") ||
    lower.includes("quota") ||
    lower.includes("exceeded your current quota")
  ) {
    return "AI credits are exhausted. Top up the OpenAI account and try again.";
  }
  if (status === 401 || status === 403) {
    return "Artwork generation is not configured correctly. Check OPENAI_API_KEY.";
  }
  if (status === 429) {
    return "Too many requests. Please wait a moment and try again.";
  }
  return "Couldn’t generate invitation artwork. Please try again.";
}

/** Soften franchise / character names before they reach either model. */
function neutraliseProperNouns(value: string): string {
  return value
    .replace(/[“”"']/g, "")
    .replace(/\b(the\s+)?(movie|film|show|series)\b/gi, "")
    .replace(/\b(featuring|starring|about)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      return jsonResponse({ error: "OPENAI_API_KEY is not configured." }, 500);
    }

    const body = (await req.json()) as ArtInput;
    const childName = (body.childName ?? "").trim();
    const age = String(body.age ?? "").trim();
    const inspiration = neutraliseProperNouns(body.inspiration || body.film || "");
    const partyType = (body.partyType ?? "birthday").trim() || "birthday";

    if (!childName || !inspiration) {
      return jsonResponse(
        { error: "A name and one thing they love are required." },
        400,
      );
    }

    // --- Pass 1: art direction (strip characters / franchises) ---
    const directionSystem = `You design invitation artwork for a young child's birthday party.
A parent should glance at it and immediately see what the child loves.
It should feel joyful and celebratory, like a birthday card, not a spa, a wedding, or abstract art.

Return ONLY valid JSON:
{
  "palette": "3-5 bright, clear colours",
  "motifs": "the specific objects to draw",
  "mood": "one short mood sentence",
  "imagePrompt": "a single image-generation prompt",
  "caption": "6-10 word UI caption a parent would understand"
}

Hard rules for imagePrompt:
- Draw the subject clearly. Astronaut means a rocket, stars, a moon and planets. Football means a sunny pitch and a ball. Dinosaurs means friendly dinosaurs and ferns.
- Use that one idea only. Do not add unrelated hobbies, foods or jobs.
- Make it obviously for a child: playful shapes, cheerful colour, a sense of a party.
- Never depict named characters, logos, mascots, costumes, or franchise-specific designs.
- Never include proper nouns from films, TV, games or brands. A bear film becomes a simple friendly bear, not a branded one.
- No readable text, letters, numbers or watermarks.
- Not a pale empty wash. Not clip-art sticker sheets. Not photorealistic.
- Leave the lower middle fairly calm so a name can sit on top, but the theme must fill the rest of the picture.`;

    const directionUser = `Paint a children's birthday invitation background.
Child first name only (do not letter the image): ${childName}${age ? `, turning ${age}` : ""}
The one thing they love, drawn so a child would recognise it:
${inspiration}`;

    const directionRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: TEXT_MODEL,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: directionSystem },
          { role: "user", content: directionUser },
        ],
      }),
    });

    const directionRaw = await directionRes.text();
    if (!directionRes.ok) {
      console.error("OpenAI text error", directionRes.status, directionRaw);
      return jsonResponse(
        { error: readableApiError(directionRes.status, directionRaw) },
        directionRes.status >= 500 ? 502 : directionRes.status,
      );
    }

    const directionPayload = JSON.parse(directionRaw) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const directionText = directionPayload.choices?.[0]?.message?.content ?? "";
    let direction: ArtDirection;
    try {
      direction = JSON.parse(directionText) as ArtDirection;
    } catch {
      return jsonResponse({ error: "Art direction model returned invalid JSON." }, 502);
    }

    if (!direction.imagePrompt?.trim()) {
      return jsonResponse({ error: "Art direction model returned no image prompt." }, 502);
    }

    const safeImagePrompt = [
      "Children's birthday party invitation illustration.",
      direction.imagePrompt.trim(),
      "The subject must be obvious at a glance. Joyful, colourful, playful.",
      "No named characters, celebrity likenesses, logos, trademarks or branded costumes.",
      "No text, letters or numbers anywhere in the image.",
      "Keep the lower middle quieter so a name can be placed on top.",
    ].join(" ");

    // --- Pass 2: image generation ---
    const imageRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        prompt: safeImagePrompt,
        n: 1,
        size: "1024x1536",
        quality: "medium",
        output_format: "png",
      }),
    });

    const imageRaw = await imageRes.text();
    if (!imageRes.ok) {
      console.error("OpenAI image error", imageRes.status, imageRaw);
      return jsonResponse(
        { error: readableApiError(imageRes.status, imageRaw) },
        imageRes.status >= 500 ? 502 : imageRes.status,
      );
    }

    const imagePayload = JSON.parse(imageRaw) as {
      data?: Array<{ b64_json?: string; url?: string }>;
    };
    const b64 = imagePayload.data?.[0]?.b64_json;
    if (!b64) {
      return jsonResponse({ error: "Image model returned no image data." }, 502);
    }

    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const path = `${crypto.randomUUID()}.png`;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { error: uploadError } = await supabase.storage
      .from("invite-art")
      .upload(path, bytes, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error", uploadError);
      return jsonResponse(
        { error: `Couldn’t save artwork: ${uploadError.message}` },
        500,
      );
    }

    const { data: publicData } = supabase.storage.from("invite-art").getPublicUrl(path);
    const artUrl = publicData.publicUrl;

    return jsonResponse({
      art_url: artUrl,
      art_path: path,
      art_direction: {
        palette: direction.palette ?? "",
        motifs: direction.motifs ?? "",
        mood: direction.mood ?? "",
        caption: direction.caption ?? "Custom artwork",
        image_prompt: direction.imagePrompt,
      },
    });
  } catch (err) {
    console.error(err);
    return jsonResponse(
      {
        error: err instanceof Error ? err.message : "Artwork generation failed.",
      },
      500,
    );
  }
});
