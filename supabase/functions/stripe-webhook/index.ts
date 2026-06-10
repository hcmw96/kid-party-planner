import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-12-18.acacia",
});
const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, WEBHOOK_SECRET);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return new Response("OK", { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const { event_id, guest_id } = session.metadata ?? {};
  if (!event_id) return new Response("No event_id", { status: 400 });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const amountPence = session.amount_total ?? 0;

  await supabase.from("donations").insert({
    event_id,
    guest_id: guest_id ?? null,
    stripe_session_id: session.id,
    amount_pence: amountPence,
    currency: session.currency ?? "gbp",
    donor_email: session.customer_email,
  });

  if (guest_id) {
    await supabase
      .from("guests")
      .update({ contribution_status: "paid", stripe_session_id: session.id })
      .eq("id", guest_id);
  }

  await supabase.rpc("increment_gift_pot", {
    p_event_id: event_id,
    p_amount: amountPence,
  });

  return new Response("OK", { status: 200 });
});
