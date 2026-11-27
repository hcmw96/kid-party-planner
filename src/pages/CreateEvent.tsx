import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import StepOne from "@/components/EventForm/StepOne";
import StepWhen from "@/components/EventForm/StepWhen";
import StepTemplate from "@/components/EventForm/StepTemplate";
import StepTwo from "@/components/EventForm/StepTwo";
import StepThree from "@/components/EventForm/StepThree";
import NativeNavBar from "@/components/native/NativeNavBar";
import ProgressDots from "@/components/design/ProgressDots";
import { emptyEventForm, personalArtUrl, shelfChoice, type EventFormData } from "@/lib/eventForm";
import { birthdayTitle, composeDescription, defaultPartyDate, formatUkDate } from "@/lib/party";
import { clearDraft, loadDraft, saveDraft } from "@/lib/draft";
import {
  haptic,
  showSpinner,
  hideSpinner,
  maybeRequestRatingAfterFirstParty,
} from "@/lib/despia";

const STEP_LABELS = ["The star", "The day", "The invitation", "From you"];

const CreateEvent = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scroller = useRef<HTMLDivElement>(null);
  const gardenRequested = useRef(searchParams.get("style") === "garden");
  const saved = loadDraft();
  const [step, setStep] = useState(saved && saved.step >= 1 && saved.step <= 4 ? saved.step : 1);
  const [submitting, setSubmitting] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EventFormData>(
    saved?.form ? { ...emptyEventForm(defaultPartyDate()), ...saved.form } : emptyEventForm(defaultPartyDate()),
  );

  useEffect(() => {
    if (!gardenRequested.current) return;
    gardenRequested.current = false;
    setFormData((prev) => ({ ...prev, template: "garden", invitationStyle: "garden" }));
    if (loadDraft()?.form.childName.trim()) setStep(3);
  }, []);

  useEffect(() => {
    if (step === 5) {
      clearDraft();
      return;
    }
    saveDraft({ form: formData, step });
  }, [formData, step]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const updateField = (field: keyof EventFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const goNext = async (next: number) => {
    await haptic("light");
    setStep(next);
  };

  const handleCreate = async () => {
    if (!user) {
      saveDraft({ form: formData, step: 4 });
      navigate("/login?next=/create");
      return;
    }

    setSubmitting(true);
    await showSpinner();
    await haptic("heavy");
    try {
      const choice = shelfChoice(formData);
      const painting = choice === "paint";
      const amountPence = formData.giftEnabled ? Math.round(parseFloat(formData.giftAmount) * 100) : 0;
      const description = composeDescription({
        wording: formData.description,
        notes: formData.notes,
        start: formData.startTime,
        end: formData.endTime,
      });
      const { data, error } = await supabase
        .from("events")
        .insert({
          organiser_id: user.id,
          title: birthdayTitle(formData.childName, formData.age),
          child_name: formData.childName.trim(),
          date: formData.date,
          location: formData.location.trim(),
          location_address: formData.locationAddress.trim() || null,
          location_lat: formData.locationLat,
          location_lng: formData.locationLng,
          description: description || null,
          organiser_name: formData.organiserName.trim(),
          template: painting ? "classic" : choice,
          art_url: painting ? formData.artUrl : personalArtUrl(formData, choice),
          gift_enabled: formData.giftEnabled,
          gift_amount: amountPence,
        })
        .select("id")
        .single();

      if (error) throw error;
      clearDraft();
      setEventId(data.id);
      setStep(5);
      await haptic("success");
      maybeRequestRatingAfterFirstParty();
    } catch (err: unknown) {
      await haptic("error");
      toast.error(err instanceof Error ? err.message : "Couldn't save the party. Please try again.");
    } finally {
      await hideSpinner();
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-full flex-col bg-[#F9F7FC]">
        <NativeNavBar title="New party" onBack={() => navigate("/parties")} backLabel="Parties" />
        <div className="mx-auto w-full max-w-md space-y-4 px-5 py-8">
          <div className="h-8 w-2/3 animate-pulse rounded-2xl bg-[#EAE2F8]" />
          <div className="h-14 animate-pulse rounded-2xl bg-white" />
          <div className="h-14 animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[#F9F7FC]">
      <NativeNavBar
        title={formData.childName.trim() ? `${formData.childName.trim()}'s party` : "New party"}
        subtitle={formData.childName.trim() && formData.date ? formatUkDate(formData.date) : undefined}
        onBack={
          step === 5
            ? () => navigate(`/dashboard/${eventId}`)
            : step === 1
              ? () => navigate(user ? "/parties" : "/")
              : () => setStep((current) => current - 1)
        }
        backLabel={step === 1 ? (user ? "Parties" : "Home") : "Back"}
      />

      <div
        ref={scroller}
        className="flex-1 max-w-full overflow-x-hidden overflow-y-auto overscroll-x-none [touch-action:pan-y]"
        style={{ paddingBottom: "calc(2rem + var(--safe-area-bottom, env(safe-area-inset-bottom, 0px)))" }}
      >
        <div className="mx-auto w-full max-w-md px-5 pb-10 pt-8">
          {step < 5 ? (
            <div className="mb-10">
              <ProgressDots step={step} total={4} label={STEP_LABELS[step - 1]} />
            </div>
          ) : null}

          {step === 1 ? (
            <StepOne formData={formData} updateField={updateField} onNext={() => void goNext(2)} />
          ) : null}
          {step === 2 ? (
            <StepWhen formData={formData} updateField={updateField} onNext={() => void goNext(3)} />
          ) : null}
          {step === 3 ? (
            <StepTemplate formData={formData} updateField={updateField} onNext={() => void goNext(4)} />
          ) : null}
          {step === 4 ? (
            <StepTwo
              formData={formData}
              updateField={updateField}
              onNext={handleCreate}
              submitting={submitting}
            />
          ) : null}
          {step === 5 && eventId ? <StepThree eventId={eventId} formData={formData} /> : null}
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
