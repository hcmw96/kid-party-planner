import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import StepOne from "@/components/EventForm/StepOne";
import StepTwo from "@/components/EventForm/StepTwo";
import StepThree from "@/components/EventForm/StepThree";

export interface EventFormData {
  childName: string;
  date: string;
  location: string;
  organiserName: string;
  giftEnabled: boolean;
  giftAmount: string; // in £
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
    giftEnabled: false,
    giftAmount: "10",
  });

  if (authLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
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
          gift_enabled: formData.giftEnabled,
          gift_amount: amountPence,
        })
        .select("id")
        .single();

      if (error) throw error;
      setEventId(data.id);
      setStep(3);
    } catch (err: any) {
      toast.error(err.message || "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <StepOne formData={formData} updateField={updateField} onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <StepTwo
            formData={formData}
            updateField={updateField}
            onBack={() => setStep(1)}
            onNext={handleCreate}
            submitting={submitting}
          />
        )}
        {step === 3 && eventId && (
          <StepThree eventId={eventId} formData={formData} />
        )}
      </div>
    </div>
  );
};

export default CreateEvent;
