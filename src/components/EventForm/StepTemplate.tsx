import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getTemplate } from "@/lib/templates";
import yoursArt from "@/assets/card-yours.jpg";
import { artKey, isLetteredStyle, personalArtUrl, shelfChoice, type EventFormData } from "@/lib/eventForm";
import PresetShelf from "@/components/EventForm/PresetShelf";
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
  const style = shelfChoice(formData);
  const paintingChoice = style === "paint";
  const promptsReady = !paintingChoice || Boolean(formData.inspiration.trim());
  const artStore = useRef(formData.personalArt ?? {});
  artStore.current = formData.personalArt ?? {};
  const request = useRef(0);

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
      updateField("invitationStyle", "paint");
      await haptic("success");
    } catch (err: unknown) {
      await haptic("error");
      setError(err instanceof Error ? err.message : "Could not paint a background.");
    } finally {
      setPainting(false);
    }
  };

  const generateStyle = async (id: string, key: string) => {
    const seq = ++request.current;
    setPainting(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-invite-art", {
        body: {
          layout: id,
          childName: formData.childName.trim() || "The birthday star",
          age: formData.age,
          lines: invitationLines(formData),
        },
      });
      if (seq !== request.current) return;
      if (fnError) throw new Error(await readFunctionError(fnError));
      if (data?.error) throw new Error(data.error);
      if (!data?.art_url) throw new Error("No artwork came back.");
      const next = { ...artStore.current, [id]: { key, url: data.art_url } };
      artStore.current = next;
      updateField("personalArt", next);
      await haptic("success");
    } catch (err: unknown) {
      if (seq !== request.current) return;
      await haptic("error");
      setError(err instanceof Error ? err.message : "Could not paint the card.");
    } finally {
      if (seq === request.current) setPainting(false);
    }
  };

  return (
    <div className="step-rise space-y-7">
      <div>
        <h2 className="text-[2rem] font-extrabold leading-[1.05] tracking-[-0.045em] text-[#282035]">
          Make it theirs
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[#71677F]">
          Choose a card and we’ll paint their day onto it. Or generate one from what they love.
        </p>
      </div>

      <PresetShelf
        formData={formData}
        selected={style}
        painting={painting}
        onSelect={(id) => {
          void haptic("light");
          updateField("invitationStyle", id);
          updateField("template", id === "paint" ? "classic" : id);
          if (!isLetteredStyle(id)) return;
          const key = artKey(formData, id);
          const cached = formData.personalArt?.[id];
          if (id !== style && cached?.key === key) return;
          void generateStyle(id, key);
        }}
      />

      {paintingChoice ? (
      <Field
        label="Something they love"
        name="inspiration"
        value={formData.inspiration}
        onChange={(event) => updateField("inspiration", event.target.value)}
        placeholder="A favourite film, a dream job, or a sport"
      />
      ) : null}

      {error ? <FieldError>{error}</FieldError> : null}

      {paintingChoice ? (
      <button type="button" className="ink-button" onClick={() => void generateArt()} disabled={!promptsReady || painting}>
        {painting ? "Generating…" : formData.artUrl ? "Generate another" : "Generate the invitation"}
      </button>
      ) : null}

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
        <FieldArea
          label="Words on the invitation"
          name="description"
          rows={4}
          value={formData.description}
          onChange={(event) => updateField("description", event.target.value)}
          placeholder="Cake, games, and a line just for them."
        />
      </div>

      <button type="button" className="soft-button" onClick={onNext} disabled={painting}>
        {painting ? "Painting the card…" : !paintingChoice || formData.artUrl ? "Continue" : "Continue without generating"}
      </button>
    </div>
  );
};

const invitationLines = (form: EventFormData) => {
  const description = composeDescription({
    wording: form.description,
    notes: form.notes,
    start: form.startTime,
    end: form.endTime,
  });
  const { timeLabel, body } = splitPartyNotes(description);
  const sentence = body.trim();
  return [
    form.childName.trim() || "The birthday star",
    form.age.trim() ? `Turns ${form.age.trim()}` : "",
    form.date ? formatPartyDate(form.date) : "",
    timeLabel ?? "",
    form.location.trim(),
    sentence.length > 0 && sentence.length <= 90 ? sentence : "",
  ].filter(Boolean);
};

const paintLines = (name: string, love: string, subject?: string) => {
  const who = name.trim() || "them";
  if (subject) {
    return [
      `Lettering ${who}'s ${subject}`,
      "Putting the day on the card",
      "Keeping the place just so",
      "The invitation is nearly here",
    ];
  }
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

const PaintVeil = ({ name, love, subject }: { name: string; love: string; subject?: string }) => {
  const lines = paintLines(name, love, subject);
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

const styleSubject = (id: string) => (id === "ticket" ? "ticket" : id === "poster" ? "poster" : "card");

const LivePreview = ({ formData, painting }: { formData: EventFormData; painting: boolean }) => {
  const description = composeDescription({
    wording: formData.description,
    notes: formData.notes,
    start: formData.startTime,
    end: formData.endTime,
  });
  const { timeLabel, body } = splitPartyNotes(description);
  const title = birthdayTitle(formData.childName, formData.age);
  const choice = shelfChoice(formData);
  const paintingChoice = choice === "paint";
  const waitingToPaint = paintingChoice && !formData.artUrl;
  const personal = paintingChoice ? null : personalArtUrl(formData, choice);
  const lettering = painting && isLetteredStyle(choice) && !personal;

  return (
    <div className="relative overflow-hidden rounded-[24px] shadow-[0_16px_40px_rgba(40,32,53,0.08)]">
      {lettering ? (
        <div className={`min-h-[34rem] ${choice === "midnight" ? "bg-[#10131A]" : choice === "poster" ? "bg-[#0E4DA7]" : "bg-[#E7DCC8]"}`} />
      ) : waitingToPaint ? (
        <div className="relative min-h-[320px] overflow-hidden text-[#1A1408]">
          <img src={yoursArt} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="relative flex min-h-[320px] flex-col items-center justify-center px-7 text-center">
            <p className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-[#1A1408]/70">Generate</p>
            <p className="mt-2 text-[2.6rem] font-extrabold leading-[0.9] tracking-[-0.045em]">Make theirs</p>
            <p className="mt-3 max-w-[16rem] text-[15px] leading-relaxed text-[#1A1408]/75">
              {formData.inspiration.trim()
                ? `Ready to paint it from ${formData.inspiration.trim()}.`
                : "Tell us one thing they love, and we’ll paint the invitation."}
            </p>
          </div>
        </div>
      ) : (
        <InvitationCard
          template={getTemplate(paintingChoice ? "classic" : choice)}
          childName={formData.childName}
          age={ageFromTitle(title)}
          dateLabel={formData.date ? formatPartyDate(formData.date) : "Pick a date"}
          timeLabel={timeLabel}
          location={formData.location}
          note={body}
          artUrl={paintingChoice ? formData.artUrl : personal}
          variant="poster"
        />
      )}
      {painting ? (
        <PaintVeil
          name={formData.childName}
          love={formData.inspiration}
          subject={isLetteredStyle(choice) ? styleSubject(choice) : undefined}
        />
      ) : null}
    </div>
  );
};

export default StepTemplate;
