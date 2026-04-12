import { Progress } from "@/components/ui/progress";
import type { Tables } from "@/integrations/supabase/types";
import { Gift } from "lucide-react";

interface Props {
  event: Tables<"events">;
  guests: Tables<"guests">[];
}

const GiftProgress = ({ event, guests }: Props) => {
  if (!event.gift_enabled) return null;

  const attending = guests.filter((g) => g.rsvp_status === "attending");
  const paid = attending.filter((g) => g.contribution_status === "paid");
  const totalCollected = paid.length * (event.gift_amount || 0);
  const progress = attending.length > 0 ? (paid.length / attending.length) * 100 : 0;

  return (
    <div className="p-6 rounded-lg bg-card shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Gift className="h-5 w-5 text-primary" strokeWidth={1.5} />
        <h3 className="font-medium text-foreground text-sm font-sans">Group Gift</h3>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {paid.length} of {attending.length} contributed
          </span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      <p className="text-2xl font-semibold text-foreground font-serif">
        £{(totalCollected / 100).toFixed(2)}
        <span className="text-sm font-normal text-muted-foreground font-sans ml-1">collected</span>
      </p>
    </div>
  );
};

export default GiftProgress;
