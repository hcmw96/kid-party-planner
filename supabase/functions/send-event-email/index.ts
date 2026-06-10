import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  const { event_id, type, message } = await req.json();
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", event_id)
    .single();

  const { data: guests } = await supabase
    .from("guests")
    .select("*")
    .eq("event_id", event_id);

  const targets = type === "reminder"
    ? guests?.filter((g) => g.rsvp_status === "pending")
    : guests?.filter((g) => g.rsvp_status === "attending");

  if (!targets?.length) {
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
  }

  const siteUrl = Deno.env.get("SITE_URL") ?? "https://partypal.netlify.app";

  const emails = targets.map((guest) => ({
    from: "PartyPal <hello@partypal.app>",
    to: [guest.email],
    subject: type === "reminder"
      ? `Don't forget — ${event.child_name}'s party!`
      : `Update about ${event.child_name}'s party`,
    html: type === "reminder"
      ? reminderHtml(event, guest, siteUrl)
      : updateHtml(event, guest, message, siteUrl),
  }));

  const results = await Promise.all(
    emails.map((email) =>
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(email),
      })
    )
  );

  return new Response(JSON.stringify({ sent: results.length }), { status: 200 });
});

function reminderHtml(event: any, guest: any, siteUrl: string) {
  const partyUrl = `${siteUrl}/party/${event.id}`;
  const partyDate = new Date(event.date).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  return `
    <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #FAF6F1; color: #1C1C1E;">
      <p style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #9B9898; margin-bottom: 32px;">PartyPal</p>
      <h1 style="font-size: 28px; font-style: italic; font-weight: 600; margin: 0 0 8px;">You're invited</h1>
      <p style="color: #9B9898; font-size: 14px; margin: 0 0 32px;">A reminder — ${event.child_name}'s party is coming up.</p>
      <div style="border: 1px solid #E8E0D4; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
        <p style="margin: 0 0 8px; font-size: 14px;"><strong>${event.child_name}'s Party</strong></p>
        <p style="margin: 0 0 4px; font-size: 13px; color: #9B9898;">${partyDate}</p>
        <p style="margin: 0; font-size: 13px; color: #9B9898;">${event.location}</p>
      </div>
      <a href="${partyUrl}" style="display: inline-block; background: #1C1C1E; color: #FAF6F1; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase;">
        RSVP now
      </a>
    </div>
  `;
}

function updateHtml(event: any, guest: any, message: string, siteUrl: string) {
  return `
    <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #FAF6F1; color: #1C1C1E;">
      <p style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #9B9898; margin-bottom: 32px;">PartyPal</p>
      <h1 style="font-size: 28px; font-style: italic; font-weight: 600; margin: 0 0 8px;">Update from ${event.organiser_name}</h1>
      <p style="color: #9B9898; font-size: 14px; margin: 0 0 32px;">Regarding ${event.child_name}'s party.</p>
      <div style="border-left: 2px solid #B8A089; padding-left: 16px; margin-bottom: 32px;">
        <p style="font-size: 15px; line-height: 1.6; margin: 0;">${message}</p>
      </div>
    </div>
  `;
}
