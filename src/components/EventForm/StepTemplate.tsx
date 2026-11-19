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

const readFunctionError = async (fnError: unknown): Promise<string> => {
  const fallback =
    (fnError as { message?: string })?.message ||
    "Couldn’t generate artwork. Please try again.";
  const res = (fnError as { context?: Response })?.context;
  if (!res || typeof res.json !== "function") return fallback;
  try {
    const body = await res.json();
    return typeof body?.error === "string" && body.error ? body.error : fallback;
  } catch {
    return fallback;
  }
};

const StepTemplate = ({ formData, updateField, onBack, onNext }: Props) => {
  const [artLoading, setArtLoading] = useState(false);
  const [artCaption, setArtCaption] = useState<string | null>(null);
  const [lastArtUrl, setLastArtUrl] = useState<string | null>(formData.artUrl);

  const promptsReady = Boolean(
    formData.film.trim() && formData.food.trim() && formData.dreamJob.trim(),
  );

  const generateArt = async () => {
    if (!promptsReady) {
      toast.error("Add favourite film, food and dream job on the previous step first");
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
          partyType: formData.partyType || "birthday",
        },
      });
      if (error) throw new Error(await readFunctionError(error));
      if (data?.error) throw new Error(data.error);
      if (!data?.art_url) throw new Error("No artwork returned");
      setLastArtUrl(data.art_url);
      updateField("artUrl", data.art_url);
      setArtCaption(data.art_direction?.caption ?? "Custom artwork");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn’t generate artwork");
    } finally {
      setArtLoading(false);
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
          Step 3 of 4
        </p>
        <h2 className="text-3xl font-serif italic text-foreground">Choose your invitation</h2>
        <p className="mt-2 text-sm text-muted-foreground font-sans">
          Hand-designed templates are the default. Artwork is optional.
        </p>
      </div>

      <div className="space-y-3">
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
                      : promptsReady
                        ? "Generate a custom background from the same answers"
                        : "Fill in the three prompts on the previous step to unlock artwork"}
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
        <Button onClick={onNext} className="flex-1 uppercase tracking-[0.15em]" size="lg">
          Continue
        </Button>
      </div>
    </div>
  );
};

export default StepTemplate;
