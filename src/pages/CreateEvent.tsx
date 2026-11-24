import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import StepOne from "@/components/EventForm/StepOne";
import StepInvite from "@/components/EventForm/StepInvite";
import StepTemplate from "@/components/EventForm/StepTemplate";
import StepTwo from "@/components/EventForm/StepTwo";
import StepThree from "@/components/EventForm/StepThree";
import NativeNavBar from "@/components/native/NativeNavBar";
import {
  haptic,
  showSpinner,
  hideSpinner,
  maybeRequestRatingAfterFirstParty,
} from "@/lib/despia";

export interface EventFormData {
  childName: string;
  date: string;
  location: string;
  description: string;
  organiserName: string;
  template: string;
  artUrl: string | null;
  age: string;
  film: string;
  food: string;
  dreamJob: string;
  partyType: string;
  giftEnabled: boolean;
  giftAmount: string;
}

const STEP_TITLES = ["Details", "Wording", "Design", "Gift", "Done"] as const;

const CreateEvent = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EventFormData>({
    childName: "",
    date: "",
    location: "",
    description: "",
    organiserName: "",
    template: "classic_cream",
    artUrl: null,
    age: "",
    film: "",
    food: "",
    dreamJob: "",
    partyType: "birthday",
    giftEnabled: false,
    giftAmount: "10",
  });

  if (authLoading) {
    return (
      <div className="animate-fade-in">
        <NativeNavBar title="New party" onBack={() => navigate("/parties")} />
        <div className="w-full max-w-md mx-auto px-6 py-8 space-y-4">
          <div className="h-6 bg-muted rounded animate-pulse w-1/2" />
          <div className="h-10 bg-muted rounded animate-pulse" />
          <div className="h-10 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  const updateField = (field: keyof EventFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const goNext = async (next: number) => {
    await haptic("light");
    setStep(next);
  };

  const handleCreate = async () => {
    setSubmitting(true);
    await showSpinner();
    await haptic("heavy");
    try {
      const amountPence = formData.giftEnabled
        ? Math.round(parseFloat(formData.giftAmount) * 100)
        : 0;
      const { data, error } = await supabase
        .from("events")
        .insert({
          organiser_id: user.id,
          title: `${formData.childName}'s Party`,
          child_name: formData.childName,
          date: formData.date,
          location: formData.location,
          description: formData.description || null,
          organiser_name: formData.organiserName,
          template: formData.template,
          art_url: formData.artUrl,
          gift_enabled: formData.giftEnabled,
          gift_amount: amountPence,
        })
        .select("id")
        .single();

      if (error) throw error;
      setEventId(data.id);
      setStep(5);
      await haptic("success");
      maybeRequestRatingAfterFirstParty();
    } catch (err: unknown) {
      await haptic("error");
      toast.error(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      await hideSpinner();
      setSubmitting(false);
    }
  };

  const totalSteps = 5;
  const title = STEP_TITLES[step - 1] ?? "New party";

  return (
    <div className="animate-fade-in pb-8">
      <NativeNavBar
        title={title}
        onBack={
          step === 5
            ? () => navigate(`/dashboard/${eventId}`)
            : step === 1
              ? () => navigate("/parties")
              : () => setStep((s) => s - 1)
        }
        backLabel={step === 1 ? "Parties" : "Back"}
      />

      <div className="w-full max-w-md mx-auto px-6 pt-6">
        {step < 5 && (
          <div className="flex gap-2 mb-8">
            {Array.from({ length: totalSteps - 1 }, (_, i) => i + 1).map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  s <= step ? "bg-foreground" : "bg-muted"
                }`}
              />
            ))}
          </div>
        )}

        {step === 1 && (
          <StepOne
            formData={formData}
            updateField={updateField}
            onNext={() => void goNext(2)}
          />
        )}
        {step === 2 && (
          <StepInvite
            formData={formData}
            updateField={updateField}
            onBack={() => void goNext(1)}
            onNext={() => void goNext(3)}
          />
        )}
        {step === 3 && (
          <StepTemplate
            formData={formData}
            updateField={updateField}
            onBack={() => void goNext(2)}
            onNext={() => void goNext(4)}
          />
        )}
        {step === 4 && (
          <StepTwo
            formData={formData}
            updateField={updateField}
            onBack={() => void goNext(3)}
            onNext={handleCreate}
            submitting={submitting}
          />
        )}
        {step === 5 && eventId && (
          <StepThree eventId={eventId} formData={formData} />
        )}
      </div>
    </div>
  );
};

export default CreateEvent;
