import { Button } from "@/components/ui/button";
import { templates } from "@/lib/templates";
import InvitationPreview from "@/components/InvitationPreview";
import type { EventFormData } from "@/pages/CreateEvent";

interface Props {
  formData: EventFormData;
  updateField: (field: keyof EventFormData, value: any) => void;
  onBack: () => void;
  onNext: () => void;
}

const StepTemplate = ({ formData, updateField, onBack, onNext }: Props) => {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 font-sans">
          Step 2 of 3
        </p>
        <h2 className="text-3xl font-serif italic text-foreground">Choose your invitation</h2>
      </div>

      <div className="space-y-3">
        {templates.map((template) => (
          <InvitationPreview
            key={template.id}
            template={template}
            childName={formData.childName}
            selected={formData.template === template.id}
            onSelect={() => updateField("template", template.id)}
          />
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1" size="lg">
          Back
        </Button>
        <Button onClick={onNext} className="flex-1 uppercase tracking-[0.15em]" size="lg">
          Continue
        </Button>
      </div>
    </div>
  );
};

export default StepTemplate;
