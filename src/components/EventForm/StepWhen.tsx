import type { EventFormData } from "@/lib/eventForm";
import { endsBeforeStart } from "@/lib/party";
import { Field, FieldArea, FieldError } from "@/components/design/Field";
import AddressField from "@/components/AddressField";

interface Props {
  formData: EventFormData;
  updateField: (field: keyof EventFormData, value: unknown) => void;
  onNext: () => void;
}

const StepWhen = ({ formData, updateField, onNext }: Props) => {
  const timesReversed = endsBeforeStart(formData.startTime, formData.endTime);
  const ready = Boolean(formData.date && formData.location.trim() && formData.startTime && formData.endTime && !timesReversed);

  return (
    <form
      className="step-rise space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (ready) onNext();
      }}
    >
      <div>
        <h2 className="text-[2rem] font-extrabold leading-[1.05] tracking-[-0.045em] text-[#282035]">
          When's the big day?
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[#71677F]">
          We've suggested a Saturday afternoon. Change whatever you like.
        </p>
      </div>

      <Field
        label="Date"
        name="date"
        type="date"
        value={formData.date}
        onChange={(event) => updateField("date", event.target.value)}
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Starts"
          name="startTime"
          type="time"
          value={formData.startTime}
          onChange={(event) => updateField("startTime", event.target.value)}
          required
        />
        <Field
          label="Ends"
          name="endTime"
          type="time"
          value={formData.endTime}
          onChange={(event) => updateField("endTime", event.target.value)}
          required
        />
      </div>
      <AddressField
        value={formData.location}
        onChange={(place) => {
          updateField("location", place.label);
          updateField("locationAddress", place.address ?? "");
          updateField("locationLat", place.lat);
          updateField("locationLng", place.lng);
        }}
      />
      <FieldArea
        label="Anything else?"
        name="notes"
        placeholder="Parking, what to bring, a secret handshake…"
        value={formData.notes}
        onChange={(event) => updateField("notes", event.target.value)}
        rows={3}
        hint="Optional."
      />

      {timesReversed ? <FieldError>The party can't finish before it starts.</FieldError> : null}

      <button type="submit" className="ink-button" disabled={!ready}>
        Continue
      </button>
    </form>
  );
};

export default StepWhen;
