import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { EventFormData } from "@/pages/CreateEvent";

interface Props {
  formData: EventFormData;
  updateField: (field: keyof EventFormData, value: any) => void;
  onBack: () => void;
  onNext: () => void;
}

interface InviteOption {
  tone: string;
  text: string;
}

const underlineBase =
  "w-full border-0 border-b bg-transparent px-0 py-2 text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-colors duration-200 font-sans";
const underlineIdle = "border-muted-foreground/30";
const underlineFilled = "border-foreground";

/**
 * Pull the Edge Function's own error message out of a failed invoke.
 * supabase-js attaches the raw Response as `context`; without reading it the
 * user only ever sees "Edge Function returned a non-2xx status code".
 */
const readFunctionError = async (fnError: unknown): Promise<string> => {
  const fallback =
    (fnError as { message?: string })?.message ||
    "Could not generate invitations. Please try again.";
  const res = (fnError as { context?: Response })?.context;
  if (!res || typeof res.json !== "function") return fallback;
  try {
    const body = await res.json();
    return typeof body?.error === "string" && body.error ? body.error : fallback;
  } catch {
    return fallback;
  }
};

const StepInvite = ({ formData, updateField, onBack, onNext }: Props) => {
  const [film, setFilm] = useState("");
  const [food, setFood] = useState("");
  const [dreamJob, setDreamJob] = useState("");
  const [options, setOptions] = useState<InviteOption[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstName = formData.childName?.trim() || "them";
  const canGenerate = Boolean(film.trim() && food.trim() && dreamJob.trim());

  const inputClass = (value: string) =>
    `${underlineBase} ${value ? underlineFilled : underlineIdle}`;

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "generate-invite",
        {
          body: {
            childName: formData.childName,
            film,
            food,
            dreamJob,
            partyType: "kids",
          },
        },
      );

      // supabase-js collapses any non-2xx response into a generic
      // "Edge Function returned a non-2xx status code" and leaves data null,
      // so the function's own message has to be read off the response body.
      if (fnError) throw new Error(await readFunctionError(fnError));
      if (data?.error) throw new Error(data.error);
      if (!data?.options?.length) throw new Error("No wording came back. Try again.");

      setOptions(data.options);
      setSelected(null);
    } catch (err: any) {
      setError(err.message || "Could not generate invitations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const choose = (index: number) => {
    setSelected(index);
    updateField("description", options[index].text);
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 font-sans">
          Step 2 of 4
        </p>
        <h2 className="text-3xl font-serif italic text-foreground">
          Write the invitation
        </h2>
        <p className="mt-3 text-sm text-muted-foreground font-sans leading-relaxed">
          Tell us three things about {firstName} and we will write the wording
          for you. You can edit it afterwards.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans">
            Favourite film
          </label>
          <input
            placeholder="Paddington"
            value={film}
            onChange={(e) => setFilm(e.target.value)}
            className={inputClass(film)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans">
            Favourite food
          </label>
          <input
            placeholder="Spaghetti"
            value={food}
            onChange={(e) => setFood(e.target.value)}
            className={inputClass(food)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans">
            Dream job
          </label>
          <input
            placeholder="Astronaut"
            value={dreamJob}
            onChange={(e) => setDreamJob(e.target.value)}
            className={inputClass(dreamJob)}
          />
        </div>
      </div>

      <div>
        <Button
          variant="outline"
          onClick={generate}
          disabled={!canGenerate || loading}
          className="w-full uppercase tracking-[0.15em]"
          size="lg"
        >
          {loading
            ? "Writing…"
            : options.length
            ? "Try again"
            : "Generate wording"}
        </Button>
        {error && (
          <p className="mt-3 text-center text-xs text-destructive font-sans">
            {error}
          </p>
        )}
      </div>

      {loading && !options.length && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-muted-foreground/20 p-5 space-y-2"
            >
              <div className="h-2 w-20 rounded bg-muted animate-pulse" />
              <div className="h-3 w-full rounded bg-muted animate-pulse" />
              <div className="h-3 w-5/6 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {options.length > 0 && (
        <div className="space-y-3">
          {options.map((option, i) => (
            <button
              key={i}
              type="button"
              onClick={() => choose(i)}
              className={`w-full text-left rounded-lg border p-5 transition-all duration-200 ${
                selected === i
                  ? "border-foreground bg-foreground/[0.03]"
                  : "border-muted-foreground/20 hover:border-muted-foreground/40"
              }`}
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans mb-2">
                {option.tone}
              </p>
              <p className="font-serif text-base leading-relaxed text-foreground">
                {option.text}
              </p>
            </button>
          ))}
        </div>
      )}

      {selected !== null && (
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans">
            Edit the wording
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={4}
            className={`${inputClass(formData.description)} resize-none rounded-none font-serif`}
          />
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1" size="lg">
          Back
        </Button>
        <Button onClick={onNext} className="flex-1 uppercase tracking-[0.15em]" size="lg">
          Continue
        </Button>
      </div>

      <p className="text-center text-[11px] text-muted-foreground font-sans">
        Skip this step and the wording you typed earlier is kept
      </p>
    </div>
  );
};

export default StepInvite;
