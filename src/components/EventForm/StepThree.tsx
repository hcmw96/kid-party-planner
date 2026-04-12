import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy } from "lucide-react";
import type { EventFormData } from "@/pages/CreateEvent";
import { toast } from "sonner";

interface Props {
  eventId: string;
  formData: EventFormData;
}

const StepThree = ({ eventId, formData }: Props) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/party/${eventId}`;

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
    <div className="space-y-8 text-center">
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

      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">Share this link with parents</p>
        <div className="flex gap-2">
          <Input value={shareUrl} readOnly className="text-sm" />
          <Button onClick={handleCopy} variant="outline" size="icon">
            {copied ? <Check className="h-4 w-4" strokeWidth={1.5} /> : <Copy className="h-4 w-4" strokeWidth={1.5} />}
          </Button>
        </div>
      </div>

      <Button onClick={() => navigate(`/dashboard/${eventId}`)} className="w-full" size="lg">
        Go to dashboard
      </Button>
    </div>
  );
};

export default StepThree;
