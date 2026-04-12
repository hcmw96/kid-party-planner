import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy, PartyPopper } from "lucide-react";
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
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — try manually");
    }
  };

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center">
          <PartyPopper className="h-8 w-8 text-accent-foreground" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-foreground">Party created! 🥳</h2>
        <p className="text-muted-foreground mt-2">
          {formData.childName}'s party on {new Date(formData.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">Share this link with parents:</p>
        <div className="flex gap-2">
          <Input value={shareUrl} readOnly className="text-sm" />
          <Button onClick={handleCopy} variant="outline" size="icon">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
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
