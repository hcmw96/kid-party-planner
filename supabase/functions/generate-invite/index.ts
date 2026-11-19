import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const MODEL = "gpt-4.1-mini";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type InviteInput = {
  childName?: string;
  age?: string | number;
  film?: string;
  food?: string;
  dreamJob?: string;
  partyType?: string;
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
    return "Invite generation is not configured correctly. Check OPENAI_API_KEY.";
  }
  if (status === 429) {
    return "Too many requests. Please wait a moment and try again.";
  }
  return "Couldn’t generate invitation wording. Please try again.";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY is not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = (await req.json()) as InviteInput;
    const childName = (body.childName ?? "").trim();
    const age = String(body.age ?? "").trim();
    const film = (body.film ?? "").trim();
    const food = (body.food ?? "").trim();
    const dreamJob = (body.dreamJob ?? "").trim();
    const partyType = (body.partyType ?? "birthday").trim() || "birthday";

    if (!childName || !film || !food || !dreamJob) {
      return new Response(
        JSON.stringify({
          error: "childName, film, food and dreamJob are required.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const system = `You write short children's party invitation copy for UK parents.
Tone: warm, polished, Paperless Post — never cutesy, never slang-heavy.
Return ONLY valid JSON with this shape:
{"options":["...","...","..."]}
Exactly three options. Each option is 2–4 short sentences, no titles, no emoji.
Gently weave the child's interests as atmosphere, not a shopping list.
Do not name copyrighted characters or franchises; use mood and theme instead.`;

    const user = `Write three invitation wording options.
Child: ${childName}${age ? ` (age ${age})` : ""}
Party type: ${partyType}
Favourite film: ${film}
Favourite food: ${food}
Dream job: ${dreamJob}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.8,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    const raw = await response.text();
    if (!response.ok) {
      console.error("OpenAI error", response.status, raw);
      return new Response(
        JSON.stringify({ error: readableApiError(response.status, raw) }),
        {
          status: response.status >= 500 ? 502 : response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const payload = JSON.parse(raw) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = payload.choices?.[0]?.message?.content ?? "";
    let parsed: { options?: unknown };
    try {
      parsed = JSON.parse(text) as { options?: unknown };
    } catch {
      return new Response(
        JSON.stringify({ error: "Invite model returned an unexpected response." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const options = Array.isArray(parsed.options)
      ? parsed.options
          .filter((o): o is string => typeof o === "string" && o.trim().length > 0)
          .map((o) => o.trim())
          .slice(0, 3)
      : [];

    if (options.length < 1) {
      return new Response(
        JSON.stringify({ error: "Invite model returned no wording options." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ options }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Invite generation failed.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
