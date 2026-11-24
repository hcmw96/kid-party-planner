import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { haptic } from "@/lib/despia";
import { calendarHref } from "@/lib/calendar";
import { formatPartyDate, splitPartyNotes } from "@/lib/party";
import { Field, FieldArea, FieldError } from "@/components/design/Field";

interface Props {
  event: Tables<"events">;
  demo?: boolean;
}

const RSVPForm = ({ event, demo = false }: Props) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const choose = (coming: boolean) => {
    setAttending(coming);
    setError(null);
    setStep(2);
    void haptic("light");
  };

  const handleSubmit = async (formEvent: React.FormEvent) => {
    formEvent.preventDefault();
    if (attending === null) {
      setError("Let them know if you can make it.");
      return;
    }
    if (demo) {
      setSubmitted(true);
      void haptic(attending ? "success" : "warning");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from("guests")
        .insert({
          event_id: event.id,
          name,
          email,
          rsvp_status: attending ? "attending" : "not_attending",
          dietary_notes: attending ? dietaryNotes || null : null,
        })
        .select("id")
        .single();
      if (insertError) throw insertError;
      setGuestId(data.id);
      setSubmitted(true);
      await haptic(attending ? "success" : "warning");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async () => {
    if (demo || !guestId) return;
    try {
      const { data, error: payError } = await supabase.functions.invoke("create-checkout-session", {
        body: { guest_id: guestId, event_id: event.id },
      });
      if (payError) throw payError;
      if (data?.url) window.location.href = data.url;
    } catch {
      toast.error("Payment setup failed. Please try again.");
    }
  };

  const { timeLabel } = splitPartyNotes(event.description);
  const when = [formatPartyDate(event.date), timeLabel].filter(Boolean).join(" · ");
  const giftPounds =
    event.gift_enabled && event.gift_amount && event.gift_amount > 0
      ? (event.gift_amount / 100).toFixed(0)
      : null;

  if (submitted) {
    return (
      <div className="step-rise space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E7F6EE]">
          <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
            <path d="M6 13.5 11 18.5 20 8" fill="none" stroke="#32936A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h2 className="text-[1.7rem] font-extrabold tracking-[-0.04em] text-[#282035]">
            {attending ? "You're coming" : "Thanks for saying"}
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-[#71677F]">
            {attending
              ? `${event.child_name}'s party is ${when}, at ${event.location}.`
              : `${event.organiser_name} will be glad you let them know.`}
          </p>
        </div>
        {attending ? (
          <a
            className="ink-button"
            href={calendarHref({
              title: event.title,
              date: event.date,
              location: event.location,
              details: event.description,
            })}
            target="_blank"
            rel="noreferrer"
          >
            Add to calendar
          </a>
        ) : null}
        {attending && giftPounds ? (
          <div className="rounded-[22px] bg-white px-5 py-5 text-left shadow-[0_8px_30px_rgba(40,32,53,0.05)]">
            <p className="text-[15px] font-bold tracking-[-0.02em] text-[#282035]">A group gift, if you'd like</p>
            <p className="mt-1 text-[14px] leading-relaxed text-[#71677F]">
              A few families are chipping in £{giftPounds} each towards something special for {event.child_name}. Entirely optional.
            </p>
            {demo ? (
              <p className="mt-4 text-[13px] text-[#71677F]">This is an example, so nothing is charged.</p>
            ) : (
              <button type="button" onClick={() => void handlePayment()} className="ink-button mt-4">
                Chip in £{giftPounds}
              </button>
            )}
          </div>
        ) : null}
      </div>
    );
  }

  if (step === 1 || attending === null) {
    return (
      <div className="step-rise space-y-4">
        <h2 className="text-[1.45rem] font-extrabold tracking-[-0.04em] text-[#282035]">Can you make it?</h2>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => choose(true)} className="choice-button">
            I'm coming
          </button>
          <button type="button" onClick={() => choose(false)} className="choice-button choice-button-quiet">
            Can't this time
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="step-rise space-y-5">
      <div>
        <button type="button" onClick={() => setStep(1)} className="text-[14px] font-semibold text-[#71677F]">
          Back
        </button>
        <h2 className="mt-2 text-[1.45rem] font-extrabold tracking-[-0.04em] text-[#282035]">
          {attending ? "Lovely. A few details." : "Sorry you'll miss it."}
        </h2>
        <p className="mt-1 text-[14px] leading-relaxed text-[#71677F]">
          {event.organiser_name} uses this to keep the guest list tidy.
        </p>
      </div>
      <Field
        label="Your name"
        name="name"
        autoComplete="name"
        placeholder="Alex Smith"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        hint="So the host can send a reminder. Nothing else."
      />
      {attending ? (
        <FieldArea
          label="Anything they should know?"
          name="dietary"
          placeholder="Nut allergy, vegetarian…"
          value={dietaryNotes}
          onChange={(e) => setDietaryNotes(e.target.value)}
          rows={3}
          hint="Allergies and dietary needs. Leave blank if there's nothing."
        />
      ) : null}
      {error ? <FieldError>{error}</FieldError> : null}
      <button type="submit" className="ink-button" disabled={submitting}>
        {submitting ? "Sending…" : "Confirm"}
      </button>
    </form>
  );
};

export default RSVPForm;
