import { useEffect, useState } from "react";
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
      await haptic("success");
    } catch (err: unknown) {
      await haptic("error");
      setError(err instanceof Error ? err.message : "Could not paint a background.");
    } finally {
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

      <Field
        label="Something they love"
        name="inspiration"
        value={formData.inspiration}
        onChange={(event) => updateField("inspiration", event.target.value)}
        placeholder="A favourite film, a dream job, or a sport"
      />

      {error ? <FieldError>{error}</FieldError> : null}

      <button type="button" className="ink-button" onClick={() => void generateArt()} disabled={!promptsReady || painting}>
        {painting ? "Painting…" : formData.artUrl ? "Paint another" : "Paint the background"}
      </button>

      <LivePreview formData={formData} painting={painting} />

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

const paintLines = (name: string, love: string) => {
  const who = name.trim() || "them";
  const thing = love.trim();
  const loved = thing ? thing.charAt(0).toLowerCase() + thing.slice(1) : "";
  return [
    "Stirring the colours",
    loved ? `Calling ${loved} onto the page` : "Listening to what they love",
    `Keeping a quiet place for ${who}`,
    "The invitation is nearly here",
  ];
};

const motes = [
  { left: "14%", delay: "0s", size: "7px", color: "#fff" },
  { left: "30%", delay: "1.1s", size: "5px", color: "#F6C15B" },
  { left: "48%", delay: "0.4s", size: "9px", color: "#fff" },
  { left: "64%", delay: "1.7s", size: "6px", color: "#F7B5D8" },
  { left: "78%", delay: "0.8s", size: "8px", color: "#F6C15B" },
  { left: "88%", delay: "2.1s", size: "5px", color: "#fff" },
];

const PaintVeil = ({ name, love }: { name: string; love: string }) => {
  const lines = paintLines(name, love);
  const [line, setLine] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLine((current) => (current + 1) % lines.length);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [lines.length]);

  return (
    <div className="paint-veil absolute inset-0 flex items-center justify-center" role="status" aria-live="polite">
      {motes.map((mote) => (
        <span
          key={mote.left}
          className="paint-mote"
          style={{
            left: mote.left,
            animationDelay: mote.delay,
            width: mote.size,
            height: mote.size,
            background: mote.color,
          }}
        />
      ))}
      <p key={line} className="paint-line relative rounded-full bg-white/90 px-4 py-2 text-[13px] font-bold text-[#282035] shadow-[0_8px_24px_rgba(40,32,53,0.12)]">
        {lines[line]}
      </p>
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
      {painting ? <PaintVeil name={formData.childName} love={formData.inspiration} /> : null}
    </div>
  );
};

export default StepTemplate;
