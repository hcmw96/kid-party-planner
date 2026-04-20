import { useState, useEffect } from "react";
import type { EventFormData } from "@/pages/CreateEvent";

interface Props {
  formData: EventFormData;
  updateField: (field: keyof EventFormData, value: any) => void;
  onNext: () => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const underlineBase =
  "w-full border-0 border-b bg-transparent px-0 py-2 text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-colors duration-200 font-sans";
const underlineIdle = "border-muted-foreground/30";
const underlineFilled = "border-foreground";

const StepOne = ({ formData, updateField, onNext }: Props) => {
  // Parse existing date into segments
  const parseDateParts = (dateStr: string) => {
    const currentYear = String(new Date().getFullYear());
    if (!dateStr) return { day: "", month: "", year: currentYear };
    const [y, m, d] = dateStr.split("-");
    return { day: d || "", month: m ? String(parseInt(m)) : "", year: y || currentYear };
  };

  const [dateParts, setDateParts] = useState(parseDateParts(formData.date));

  useEffect(() => {
    const { day, month, year } = dateParts;
    if (day && month && year && year.length === 4) {
      const m = month.padStart(2, "0");
      const d = day.padStart(2, "0");
      updateField("date", `${year}-${m}-${d}`);
    } else if (formData.date && (!day || !month || !year)) {
      updateField("date", "");
    }
  }, [dateParts]);

  const updateDatePart = (part: "day" | "month" | "year", value: string) => {
    setDateParts((prev) => ({ ...prev, [part]: value }));
  };

  const isValid = formData.childName && formData.date && formData.location && formData.organiserName;

  const inputClass = (value: string) =>
    `${underlineBase} ${value ? underlineFilled : underlineIdle}`;

  return (
    <div className="space-y-8">
      {/* Step indicator */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 font-sans">
          Step 1 of 3
        </p>
        <h2 className="text-3xl font-serif italic text-foreground">Party details</h2>
      </div>

      <div className="space-y-6">
        {/* Child's name */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans">
            Child's name
          </label>
          <input
            placeholder="First name"
            value={formData.childName}
            onChange={(e) => updateField("childName", e.target.value)}
            className={inputClass(formData.childName)}
          />
        </div>

        {/* Date — 3 segments */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans">
            Date
          </label>
          <div className="grid grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="Day"
              min={1}
              max={31}
              value={dateParts.day}
              onChange={(e) => updateDatePart("day", e.target.value)}
              className={inputClass(dateParts.day)}
            />
            <select
              value={dateParts.month}
              onChange={(e) => updateDatePart("month", e.target.value)}
              className={`${underlineBase} ${dateParts.month ? underlineFilled : underlineIdle} appearance-none rounded-none`}
            >
              <option value="" disabled>Month</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={String(i + 1)}>{m}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Year"
              min={2024}
              max={2030}
              value={dateParts.year}
              onChange={(e) => updateDatePart("year", e.target.value)}
              className={inputClass(dateParts.year)}
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans">
            Location
          </label>
          <input
            placeholder="Venue name or address"
            value={formData.location}
            onChange={(e) => updateField("location", e.target.value)}
            className={inputClass(formData.location)}
          />
        </div>

        {/* Party details (optional) */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans">
            Party details <span className="normal-case tracking-normal text-muted-foreground/60">(optional)</span>
          </label>
          <textarea
            placeholder="Times, dress code, what to bring…"
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={3}
            className={`${inputClass(formData.description)} resize-none rounded-none`}
          />
        </div>

        {/* Organiser name */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans">
            Your name
          </label>
          <input
            placeholder="First name"
            value={formData.organiserName}
            onChange={(e) => updateField("organiserName", e.target.value)}
            className={inputClass(formData.organiserName)}
          />
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <button
          onClick={onNext}
          disabled={!isValid}
          className="w-full h-12 rounded-lg bg-primary text-primary-foreground text-sm uppercase tracking-[0.15em] font-sans font-medium transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none hover:bg-primary/90"
        >
          Continue
        </button>
        <p className="text-center text-[11px] text-muted-foreground font-sans">
          Gift options on the next step
        </p>
      </div>
    </div>
  );
};

export default StepOne;
