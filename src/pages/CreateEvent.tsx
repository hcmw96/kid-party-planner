import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import StepOne from "@/components/EventForm/StepOne";
import StepTemplate from "@/components/EventForm/StepTemplate";
import StepTwo from "@/components/EventForm/StepTwo";
import StepThree from "@/components/EventForm/StepThree";

export interface EventFormData {
  childName: string;
  date: string;
  location: string;
  organiserName: string;
  template: string;
  giftEnabled: boolean;
  giftAmount: string;
}

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
    organiserName: "",
    template: "classic_cream",
    giftEnabled: false,
    giftAmount: "10",
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md px-6 space-y-4">
          <div className="h-6 bg-muted rounded animate-pulse w-1/2" />
          <div className="h-10 bg-muted rounded animate-pulse" />
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

  const updateField = (field: keyof EventFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      const amountPence = formData.giftEnabled ? Math.round(parseFloat(formData.giftAmount) * 100) : 0;
      const { data, error } = await supabase
        .from("events")
        .insert({
          organiser_id: user.id,
          title: `${formData.childName}'s Party`,
          child_name: formData.childName,
          date: formData.date,
          location: formData.location,
          organiser_name: formData.organiserName,
          template: formData.template,
          gift_enabled: formData.giftEnabled,
          gift_amount: amountPence,
        })
        .select("id")
        .single();

      if (error) throw error;
      setEventId(data.id);
      setStep(4);
    } catch (err: any) {
      toast.error(err.message || "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  const totalSteps = 4;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex gap-2 mb-10">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                s <= step ? "bg-foreground" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <StepOne formData={formData} updateField={updateField} onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <StepTemplate
            formData={formData}
            updateField={updateField}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <StepTwo
            formData={formData}
            updateField={updateField}
            onBack={() => setStep(2)}
            onNext={handleCreate}
            submitting={submitting}
          />
        )}
        {step === 4 && eventId && (
          <StepThree eventId={eventId} formData={formData} />
        )}
      </div>
    </div>
  );
};

export default CreateEvent;
