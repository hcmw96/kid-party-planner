import type { EventFormData } from "@/lib/eventForm";
import { Field } from "@/components/design/Field";
import { Switch } from "@/components/ui/switch";

interface Props {
  formData: EventFormData;
  updateField: (field: keyof EventFormData, value: unknown) => void;
  onNext: () => void;
  submitting: boolean;
}

const StepTwo = ({ formData, updateField, onNext, submitting }: Props) => {
  const ready = Boolean(formData.organiserName.trim());

  return (
    <div className="step-rise space-y-7">
      <div>
        <h2 className="text-[2rem] font-extrabold leading-[1.05] tracking-[-0.045em] text-[#282035]">
          Who's it from?
        </h2>
        <p className="mt-3 text-[16px] leading-relaxed text-[#71677F]">
          Guests see your name when they reply. A group gift is optional.
        </p>
      </div>

      <Field
        label="Your name"
        name="organiserName"
        autoComplete="name"
        placeholder="So guests know who it's from"
        value={formData.organiserName}
        onChange={(event) => updateField("organiserName", event.target.value)}
        required
      />

      <div className="rounded-[22px] bg-white p-5 shadow-[0_8px_24px_rgba(40,32,53,0.04)]">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[15px] font-bold tracking-[-0.02em] text-[#282035]">Suggest an amount</p>
          <Switch
            checked={formData.giftEnabled}
            onCheckedChange={(checked) => updateField("giftEnabled", checked)}
            aria-label="Suggest an amount"
          />
        </div>
        {formData.giftEnabled ? (
          <div className="mt-4">
            <Field
              label="Each person chips in"
              name="giftAmount"
              type="number"
              inputMode="decimal"
              min={1}
              step={1}
              value={formData.giftAmount}
              onChange={(event) => updateField("giftAmount", event.target.value)}
              hint="In pounds. Guests can skip this."
            />
          </div>
        ) : (
          <p className="mt-3 text-[14px] leading-relaxed text-[#71677F]">
            Leave this off and the invitation is just the party.
          </p>
        )}
      </div>

      <button type="button" onClick={onNext} disabled={submitting || !ready} className="ink-button">
        {submitting ? "Saving…" : "Create party"}
      </button>
      {!ready ? <p className="text-center text-[13px] text-[#71677F]">Add your name to create the party.</p> : null}
    </div>
  );
};

export default StepTwo;
