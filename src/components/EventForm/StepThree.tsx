import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Copy, ExternalLink } from "lucide-react";
import type { EventFormData } from "@/pages/CreateEvent";
import { toast } from "sonner";
import { getShareUrl, getDisplayShareUrl } from "@/lib/shareUrl";

interface Props {
  eventId: string;
  formData: EventFormData;
}

const StepThree = ({ eventId, formData }: Props) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const shareUrl = getShareUrl(eventId);
  const displayUrl = getDisplayShareUrl(eventId);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — try manually");
    }
  };

  return (
    <div className="space-y-10 text-center">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground font-serif">Party created</h2>
        <p className="text-muted-foreground text-sm">
          {formData.childName}'s party on{" "}
          {new Date(formData.date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Share with parents
        </p>

        <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
          <p className="text-sm text-foreground/80 font-mono truncate">{displayUrl}</p>
        </div>

        <div className="flex items-center justify-center gap-6 text-[11px] uppercase tracking-[0.2em]">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-foreground hover:opacity-70 transition-opacity"
          >
            {copied ? <Check className="h-3.5 w-3.5" strokeWidth={1.5} /> : <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />}
            {copied ? "Copied" : "Copy link"}
          </button>
          <span className="text-muted-foreground/40">/</span>
          <a
            href={`/party/${eventId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-foreground hover:opacity-70 transition-opacity"
          >
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
            Preview
          </a>
        </div>
      </div>

      <Button onClick={() => navigate(`/dashboard/${eventId}`)} className="w-full" size="lg">
        Go to dashboard
      </Button>
    </div>
  );
};

export default StepThree;
