import type { EventFormData } from "@/lib/eventForm";
import { Field } from "@/components/design/Field";

interface Props {
  formData: EventFormData;
  updateField: (field: keyof EventFormData, value: string) => void;
  onNext: () => void;
}

const StepOne = ({ formData, updateField, onNext }: Props) => {
  const ready = formData.childName.trim().length > 0;

  return (
    <form
      className="step-rise space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        if (ready) onNext();
      }}
    >
      <div>
        <h2 className="text-[2rem] font-extrabold leading-[1.05] tracking-[-0.045em] text-[#282035]">
          Who's the birthday star?
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[#71677F]">Just a first name is perfect.</p>
      </div>

      <Field
        label="Their name"
        name="childName"
        autoComplete="off"
        placeholder="Sophie"
        value={formData.childName}
        onChange={(event) => updateField("childName", event.target.value)}
        required
      />
      <Field
        label="How old will they be?"
        name="age"
        inputMode="numeric"
        placeholder="6"
        min={1}
        max={18}
        value={formData.age}
        onChange={(event) => updateField("age", event.target.value.replace(/[^\d]/g, "").slice(0, 2))}
        hint="Optional. It appears on the invitation."
      />

      <div className="space-y-3">
        <button type="submit" className="ink-button" disabled={!ready}>
          Continue
        </button>
        {!ready ? <p className="text-center text-[13px] text-[#71677F]">Add their name to continue.</p> : null}
      </div>
    </form>
  );
};

export default StepOne;
