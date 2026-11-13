import { useState } from "react";
import { Button } from "@/components/ui/button";
import { templates } from "@/lib/templates";
import InvitationPreview from "@/components/InvitationPreview";
import type { EventFormData } from "@/pages/CreateEvent";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

interface Props {
  formData: EventFormData;
  updateField: (field: keyof EventFormData, value: unknown) => void;
  onBack: () => void;
  onNext: () => void;
}

const underlineBase =
  "w-full border-0 border-b bg-transparent px-0 py-2 text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-colors duration-200 font-sans";
const underlineIdle = "border-muted-foreground/30";
const underlineFilled = "border-foreground";

const StepInvite = ({ formData, updateField, onBack, onNext }: Props) => {
  const [wordingOptions, setWordingOptions] = useState<string[]>([]);
  const [wordingLoading, setWordingLoading] = useState(false);
  const [artLoading, setArtLoading] = useState(false);
  const [artCaption, setArtCaption] = useState<string | null>(null);
  const [lastArtUrl, setLastArtUrl] = useState<string | null>(formData.artUrl);

  const promptsReady =
    !!formData.film.trim() && !!formData.food.trim() && !!formData.dreamJob.trim();

  const inputClass = (value: string) =>
    `${underlineBase} ${value ? underlineFilled : underlineIdle}`;

  const invokeErrorMessage = async (error: { message: string }, data: unknown) => {
    if (data && typeof data === "object" && "error" in data) {
      const msg = (data as { error?: unknown }).error;
      if (typeof msg === "string" && msg.trim()) return msg;
    }
    return error.message || "Something went wrong";
  };

  const generateArt = async () => {
    if (!promptsReady) {
      toast.error("Add favourite film, food and dream job first");
      return;
    }
    setArtLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-invite-art", {
        body: {
          childName: formData.childName,
          age: formData.age,
          film: formData.film,
          food: formData.food,
          dreamJob: formData.dreamJob,
          partyType: formData.partyType,
        },
      });
      if (error) throw new Error(await invokeErrorMessage(error, data));
      const payload = data as {
        art_url?: string;
        art_direction?: { caption?: string };
        error?: string;
      } | null;
      if (payload?.error) throw new Error(payload.error);
      if (!payload?.art_url) throw new Error("No artwork returned");
      setLastArtUrl(payload.art_url);
      updateField("artUrl", payload.art_url);
      setArtCaption(payload.art_direction?.caption ?? "Custom artwork");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn’t generate artwork");
    } finally {
      setArtLoading(false);
    }
  };

  const generateWording = async () => {
    if (!promptsReady) {
      toast.error("Add favourite film, food and dream job first");
      return;
    }
    setWordingLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-invite", {
        body: {
          childName: formData.childName,
          age: formData.age,
          film: formData.film,
          food: formData.food,
          dreamJob: formData.dreamJob,
          partyType: formData.partyType,
        },
      });
      if (error) throw new Error(await invokeErrorMessage(error, data));
      const options = (data as { options?: string[] } | null)?.options ?? [];
      if (!options.length) throw new Error("No wording options returned");
      setWordingOptions(options);
      if (!formData.description) {
        updateField("description", options[0]);
      }
      // Wording returns first; kick off a single art option in the background.
      void generateArt();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn’t generate wording");
    } finally {
      setWordingLoading(false);
    }
  };

  const selectTemplate = (templateId: string) => {
    updateField("template", templateId);
    updateField("artUrl", null);
  };

  const selectGeneratedArt = () => {
    if (!lastArtUrl) return;
    updateField("artUrl", lastArtUrl);
  };

  const previewArtUrl = formData.artUrl ?? lastArtUrl;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 font-sans">
          Step 2 of 3
        </p>
        <h2 className="text-3xl font-serif italic text-foreground">Invitation</h2>
        <p className="text-muted-foreground mt-2 text-sm font-sans">
          Three answers shape the wording — and, if you like, the artwork.
        </p>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans">
              Age
            </label>
            <input
              inputMode="numeric"
              placeholder="7"
              value={formData.age}
              onChange={(e) => updateField("age", e.target.value)}
              className={inputClass(formData.age)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans">
              Party type
            </label>
            <select
              value={formData.partyType}
              onChange={(e) => updateField("partyType", e.target.value)}
              className={`${underlineBase} ${underlineFilled} appearance-none rounded-none`}
            >
              <option value="birthday">Birthday</option>
              <option value="celebration">Celebration</option>
              <option value="playdate">Playdate</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans">
            Favourite film
          </label>
          <input
            placeholder="e.g. a classic adventure"
            value={formData.film}
            onChange={(e) => updateField("film", e.target.value)}
            className={inputClass(formData.film)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans">
            Favourite food
          </label>
          <input
            placeholder="e.g. strawberries"
            value={formData.food}
            onChange={(e) => updateField("food", e.target.value)}
            className={inputClass(formData.food)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans">
            Dream job
          </label>
          <input
            placeholder="e.g. astronaut"
            value={formData.dreamJob}
            onChange={(e) => updateField("dreamJob", e.target.value)}
            className={inputClass(formData.dreamJob)}
          />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          size="lg"
          disabled={!promptsReady || wordingLoading}
          onClick={generateWording}
        >
          {wordingLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" strokeWidth={1.5} />
              Writing invitations…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" strokeWidth={1.5} />
              Generate wording
            </>
          )}
        </Button>
      </div>

      {wordingOptions.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans">
            Choose wording
          </p>
          {wordingOptions.map((option) => {
            const selected = formData.description === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => updateField("description", option)}
                className={`w-full text-left rounded-lg border px-4 py-3 text-sm font-sans leading-relaxed transition-all ${
                  selected
                    ? "border-foreground bg-card ring-1 ring-foreground"
                    : "border-border/60 hover:border-foreground/40"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans mb-1">
            Design
          </p>
          <p className="text-xs text-muted-foreground font-sans">
            Hand-designed templates are the default. Artwork is optional.
          </p>
        </div>

        {templates.map((template) => (
          <InvitationPreview
            key={template.id}
            template={template}
            childName={formData.childName}
            selected={formData.template === template.id && !formData.artUrl}
            onSelect={() => selectTemplate(template.id)}
          />
        ))}

        <div
          className={`rounded-lg overflow-hidden border transition-all ${
            formData.artUrl
              ? "ring-2 ring-foreground ring-offset-2 ring-offset-background border-transparent"
              : "border-border/60"
          }`}
        >
          <button
            type="button"
            className="w-full text-left"
            onClick={selectGeneratedArt}
            disabled={!lastArtUrl}
          >
            <div className="aspect-[16/9] relative bg-muted/40 flex items-center justify-center overflow-hidden">
              {previewArtUrl ? (
                <img
                  src={previewArtUrl}
                  alt={artCaption ?? "Generated invitation artwork"}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="px-6 text-center space-y-2">
                  <Sparkles className="h-5 w-5 mx-auto text-muted-foreground" strokeWidth={1.5} />
                  <p className="text-sm font-sans text-muted-foreground">
                    {artLoading
                      ? "Painting a background…"
                      : "Generate a custom background from the same answers"}
                  </p>
                </div>
              )}
              {artLoading && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-foreground" strokeWidth={1.5} />
                </div>
              )}
            </div>
          </button>
          <div className="px-4 py-3 bg-card flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-sans text-sm font-medium text-foreground">AI artwork</p>
              <p className="font-sans text-xs text-muted-foreground truncate">
                {artCaption ?? "Abstract background · one option at a time"}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!promptsReady || artLoading}
              onClick={generateArt}
            >
              {artLoading ? "Working…" : lastArtUrl ? "Try another" : "Generate"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1" size="lg">
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!formData.template}
          className="flex-1 uppercase tracking-[0.15em]"
          size="lg"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default StepInvite;
