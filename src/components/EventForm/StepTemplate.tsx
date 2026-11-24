import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getTemplate } from "@/lib/templates";
import type { EventFormData } from "@/lib/eventForm";
import { haptic, showSpinner, hideSpinner } from "@/lib/despia";
import InvitationCard from "@/components/InvitationCard";
import { Field, FieldArea, FieldError } from "@/components/design/Field";
import { ageFromTitle, birthdayTitle, composeDescription, formatPartyDate, splitPartyNotes } from "@/lib/party";

interface Props {
  formData: EventFormData;
  updateField: (field: keyof EventFormData, value: unknown) => void;
  onNext: () => void;
}

interface InviteOption {
  tone: string;
  text: string;
}

const readFunctionError = async (fnError: unknown): Promise<string> => {
  const fallback = (fnError as { message?: string })?.message || "Something went wrong. Please try again.";
  const res = (fnError as { context?: Response })?.context;
  if (!res || typeof res.json !== "function") return fallback;
  try {
    const body = await res.json();
    return typeof body?.error === "string" && body.error ? body.error : fallback;
  } catch {
    return fallback;
  }
};

const StepTemplate = ({ formData, updateField, onNext }: Props) => {
  const [options, setOptions] = useState<InviteOption[]>([]);
  const [writing, setWriting] = useState(false);
  const [painting, setPainting] = useState(false);
  const [caption, setCaption] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const promptsReady = Boolean(formData.inspiration.trim());

  const generateWording = async () => {
    setWriting(true);
    setError(null);
    await showSpinner();
    await haptic("light");
    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-invite", {
        body: {
          childName: formData.childName,
          age: formData.age,
          inspiration: formData.inspiration,
          partyType: "kids",
        },
      });
      if (fnError) throw new Error(await readFunctionError(fnError));
      if (data?.error) throw new Error(data.error);
      if (!data?.options?.length) throw new Error("No wording came back. Try again.");
      setOptions(data.options);
      await haptic("success");
    } catch (err: unknown) {
      await haptic("error");
      const message = err instanceof Error ? err.message : "Could not write the invitation.";
      setError(message);
    } finally {
      await hideSpinner();
      setWriting(false);
    }
  };

  const generateArt = async () => {
    if (!promptsReady) {
      setError("Add one thing they love first.");
      return;
    }
    setPainting(true);
    setError(null);
    await showSpinner();
    await haptic("light");
    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-invite-art", {
        body: {
          childName: formData.childName,
          age: formData.age,
          inspiration: formData.inspiration,
          partyType: formData.partyType || "birthday",
        },
      });
      if (fnError) throw new Error(await readFunctionError(fnError));
      if (data?.error) throw new Error(data.error);
      if (!data?.art_url) throw new Error("No artwork came back.");
      updateField("artUrl", data.art_url);
      updateField("template", "classic");
      setCaption(data.art_direction?.caption ?? "Painted for this party");
      await haptic("success");
    } catch (err: unknown) {
      await haptic("error");
      setError(err instanceof Error ? err.message : "Could not paint a background.");
    } finally {
      await hideSpinner();
      setPainting(false);
    }
  };

  return (
    <div className="step-rise space-y-7">
      <div>
        <h2 className="text-[2rem] font-extrabold leading-[1.05] tracking-[-0.045em] text-[#282035]">
          Make it theirs
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[#71677F]">
          One thing they love, and we'll paint a background just for {formData.childName || "them"}.
        </p>
      </div>

      <LivePreview formData={formData} painting={painting} />

      <Field
        label="Something they love"
        name="inspiration"
        value={formData.inspiration}
        onChange={(event) => updateField("inspiration", event.target.value)}
        placeholder="A favourite film, a dream job, or a sport"
      />

      {error ? <FieldError>{error}</FieldError> : null}
      {caption && formData.artUrl ? (
        <p className="text-center text-[13px] font-medium text-[#71677F]">{caption}</p>
      ) : null}

      <button type="button" className="ink-button" onClick={() => void generateArt()} disabled={!promptsReady || painting}>
        {painting ? "Painting…" : formData.artUrl ? "Paint another" : "Paint the background"}
      </button>

      <div className="space-y-3">
        <button
          type="button"
          className="ghost-button w-full"
          onClick={() => void generateWording()}
          disabled={!promptsReady || writing}
        >
          {writing ? "Writing…" : options.length ? "Write the wording again" : "Write the invitation wording too"}
        </button>
        {options.map((option) => (
          <button
            key={option.tone}
            type="button"
            onClick={() => {
              void haptic("light");
              updateField("description", option.text);
            }}
            className={`w-full rounded-[18px] px-4 py-4 text-left ${
              formData.description === option.text ? "bg-[#EAE2F8]" : "bg-white"
            }`}
          >
            <p className="text-[12px] font-semibold text-[#71677F]">{option.tone}</p>
            <p className="mt-1 text-[15px] leading-relaxed text-[#282035]">{option.text}</p>
          </button>
        ))}
        {formData.description ? (
          <FieldArea
            label="Edit the wording"
            name="description"
            rows={4}
            value={formData.description}
            onChange={(event) => updateField("description", event.target.value)}
          />
        ) : null}
      </div>

      <button type="button" className="soft-button" onClick={onNext}>
        {formData.artUrl ? "Continue" : "Continue without a painting"}
      </button>
    </div>
  );
};

const LivePreview = ({ formData, painting }: { formData: EventFormData; painting: boolean }) => {
  const description = composeDescription({
    wording: formData.description,
    notes: formData.notes,
    start: formData.startTime,
    end: formData.endTime,
  });
  const { timeLabel, body } = splitPartyNotes(description);
  const title = birthdayTitle(formData.childName, formData.age);

  return (
    <div className="relative overflow-hidden rounded-[24px] shadow-[0_16px_40px_rgba(40,32,53,0.08)]">
      <InvitationCard
        template={getTemplate("classic")}
        childName={formData.childName}
        age={ageFromTitle(title)}
        dateLabel={formData.date ? formatPartyDate(formData.date) : "Pick a date"}
        timeLabel={timeLabel}
        location={formData.location}
        note={body}
        artUrl={formData.artUrl}
        variant="poster"
      />
      {painting ? (
        <div className="absolute inset-0 flex items-end justify-center bg-[#F9F7FC]/70 pb-6">
          <p className="rounded-full bg-white px-4 py-2 text-[13px] font-bold text-[#282035] shadow-sm">
            Painting from those answers…
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default StepTemplate;
