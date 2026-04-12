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
        <h2 className="text-2xl font-bold text-foreground font-serif">Choose your invitation</h2>
        <p className="text-muted-foreground mt-2 font-sans text-sm">
          Select a design for your guests
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
        <Button onClick={onNext} className="flex-1" size="lg">
          Next
        </Button>
      </div>
    </div>
  );
};

export default StepTemplate;
