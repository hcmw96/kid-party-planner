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
    <div className="space-y-8">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 font-sans">
          Step 3 of 3
        </p>
        <h2 className="text-3xl font-serif italic text-foreground">Group gift</h2>
        <p className="text-muted-foreground mt-2 text-sm font-sans">Let parents chip in together</p>
      </div>

      <div className="p-6 rounded-lg bg-card shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gift className="h-5 w-5 text-primary" strokeWidth={1.5} />
            <Label htmlFor="giftToggle" className="text-sm font-medium">Enable group gift</Label>
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
        <Button onClick={onNext} disabled={submitting} className="flex-1 uppercase tracking-[0.15em]" size="lg">
          {submitting ? "Creating…" : "Create party"}
        </Button>
      </div>
    </div>
  );
};

export default StepTwo;
