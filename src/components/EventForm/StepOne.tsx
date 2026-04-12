import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EventFormData } from "@/pages/CreateEvent";

interface Props {
  formData: EventFormData;
  updateField: (field: keyof EventFormData, value: any) => void;
  onNext: () => void;
}

const StepOne = ({ formData, updateField, onNext }: Props) => {
  const isValid = formData.childName && formData.date && formData.location && formData.organiserName;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Party details 🎈</h2>
        <p className="text-muted-foreground mt-1">Tell us about the birthday star</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="childName">Child's name</Label>
          <Input
            id="childName"
            placeholder="e.g. Olivia"
            value={formData.childName}
            onChange={(e) => updateField("childName", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Party date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => updateField("date", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="e.g. Soft Play Palace, 10 High Street"
            value={formData.location}
            onChange={(e) => updateField("location", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="organiserName">Your name</Label>
          <Input
            id="organiserName"
            placeholder="e.g. Sarah"
            value={formData.organiserName}
            onChange={(e) => updateField("organiserName", e.target.value)}
          />
        </div>
      </div>

      <Button onClick={onNext} disabled={!isValid} className="w-full" size="lg">
        Next
      </Button>
    </div>
  );
};

export default StepOne;
