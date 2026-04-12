import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { EventFormData } from "@/pages/CreateEvent";
import { Gift } from "lucide-react";

interface Props {
  formData: EventFormData;
  updateField: (field: keyof EventFormData, value: any) => void;
  onBack: () => void;
  onNext: () => void;
  submitting: boolean;
}

const StepTwo = ({ formData, updateField, onBack, onNext, submitting }: Props) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Group gift 🎁</h2>
        <p className="text-muted-foreground mt-1">Let parents chip in together</p>
      </div>

      <div className="p-5 rounded-2xl bg-card border space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gift className="h-5 w-5 text-primary" />
            <Label htmlFor="giftToggle" className="text-base font-medium">Enable group gift</Label>
          </div>
          <Switch
            id="giftToggle"
            checked={formData.giftEnabled}
            onCheckedChange={(checked) => updateField("giftEnabled", checked)}
          />
        </div>

        {formData.giftEnabled && (
          <div className="space-y-2">
            <Label htmlFor="giftAmount">Suggested contribution (£)</Label>
            <Input
              id="giftAmount"
              type="number"
              min="1"
              step="1"
              value={formData.giftAmount}
              onChange={(e) => updateField("giftAmount", e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1" size="lg">
          Back
        </Button>
        <Button onClick={onNext} disabled={submitting} className="flex-1" size="lg">
          {submitting ? "Creating..." : "Create party 🎉"}
        </Button>
      </div>
    </div>
  );
};

export default StepTwo;
