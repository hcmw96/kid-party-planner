import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const MODEL = Deno.env.get("OPENAI_INVITE_MODEL") ?? "gpt-4.1-mini";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

interface Payload {
  childName?: string;
  age?: string | number;
  film?: string;
  food?: string;
  dreamJob?: string;
  partyType?: "kids" | "adult" | string;
}

const SYSTEM_PROMPT =
  `You write short party invitation blurbs for PartyPal, a British party invitation app used mainly by parents at UK preparatory schools.

House style:
- British English spelling throughout.
- Warm, elegant, lightly witty. Never garish, never twee, no exclamation-mark spam.
- One exclamation mark maximum across the whole blurb, and usually none.
- 25 to 45 words. This sits on an invitation card, so it must breathe.
- Reference the three details naturally. Do not list them, do not label them, and never write them as "favourite film: X".
- No emoji. No hashtags. No "Join us as we celebrate" boilerplate.
- Do not state the date, time or venue. Those are printed separately on the card.
- Do not name copyrighted characters or franchises; use mood and theme instead.

Return ONLY a JSON object of this exact shape, with no prose before or after and no markdown fences:
{"options":[{"tone":"whimsical","text":"..."},{"tone":"heartfelt","text":"..."},{"tone":"witty","text":"..."}]}`;

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
    return "The AI key was rejected. Check OPENAI_API_KEY.";
  }
  if (status === 429) {
    return "Too many requests just now. Try again in a moment.";
  }
  return "Could not generate invitations. Please try again.";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  if (!OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set");
    return json({ error: "Invite generation is not configured yet." }, 500);
  }

  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { childName, age, film, food, dreamJob, partyType = "kids" } = payload;

  if (!film?.trim() || !food?.trim() || !dreamJob?.trim()) {
    return json(
      { error: "Please fill in all three answers before generating." },
      400,
    );
  }

  const isAdult = partyType === "adult";
  const who =
    childName?.trim() || (isAdult ? "the host" : "the birthday child");
  const ageLine = age ? `\nThey are turning ${age}.` : "";

  const userPrompt =
    `Write three invitation blurbs for ${who}'s ${
      isAdult ? "birthday party (adult guests)" : "children's birthday party"
    }.${ageLine}

Three things about them:
- Favourite film: ${film.trim()}
- Favourite food: ${food.trim()}
- Dream job: ${dreamJob.trim()}

Give one whimsical, one heartfelt and one witty option.`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.9,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    const detail = await res.text();
    if (!res.ok) {
      console.error("OpenAI API error", res.status, detail);
      return json({ error: readableApiError(res.status, detail) }, 502);
    }

    const data = JSON.parse(detail) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = data?.choices?.[0]?.message?.content ?? "";

    let parsed: { options?: { tone: string; text: string }[] };
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) {
        console.error("Unparseable model output", raw.slice(0, 500));
        return json(
          { error: "Could not generate invitations. Please try again." },
          502,
        );
      }
      parsed = JSON.parse(match[0]);
    }

    const options = (parsed.options ?? [])
      .filter((o) => o && typeof o.text === "string" && o.text.trim())
      .slice(0, 3)
      .map((o) => ({
        tone: String(o.tone ?? "option"),
        text: o.text.trim(),
      }));

    if (!options.length) {
      return json(
        { error: "Could not generate invitations. Please try again." },
        502,
      );
    }

    return json({ options });
  } catch (err) {
    console.error("generate-invite failed", err);
    return json(
      { error: "Could not generate invitations. Please try again." },
      500,
    );
  }
});
