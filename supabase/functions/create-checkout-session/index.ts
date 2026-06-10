import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-12-18.acacia",
});
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://partypal.netlify.app";

serve(async (req) => {
  const { guest_id, event_id } = await req.json();
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", event_id)
    .single();

  const { data: guest } = await supabase
    .from("guests")
    .select("*")
    .eq("id", guest_id)
    .single();

  if (!event || !guest) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: guest.email,
    line_items: [
      {
        price_data: {
          currency: "gbp",
          product_data: {
            name: `Group gift for ${event.child_name}'s party`,
            description: `Organised by ${event.organiser_name}`,
          },
          unit_amount: event.gift_amount ?? 1000,
        },
        quantity: 1,
      },
    ],
    metadata: {
      event_id: event.id,
      guest_id: guest.id,
    },
    success_url: `${SITE_URL}/party/${event.id}/thank-you`,
    cancel_url: `${SITE_URL}/party/${event.id}`,
  });

  return new Response(JSON.stringify({ url: session.url }), { status: 200 });
});
