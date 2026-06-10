import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, X, Gift } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { haptic } from "@/lib/despia";

interface Props {
  event: Tables<"events">;
}

const RSVPForm = ({ event }: Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [guestId, setGuestId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (attending === null) {
      toast.error("Please select Yes or No");
      return;
    }
    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("guests")
        .insert({
          event_id: event.id,
          name,
          email,
          rsvp_status: attending ? "attending" : "not_attending",
          dietary_notes: dietaryNotes || null,
        })
        .select("id")
        .single();

      if (error) throw error;
      setGuestId(data.id);
      setSubmitted(true);
      await haptic(attending ? "success" : "warning");
      toast.success(attending ? "See you there!" : "Thanks for letting us know");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async () => {
    if (!guestId) return;
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { guest_id: guestId, event_id: event.id },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch {
      toast.error("Payment setup failed — try again");
    }
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="pt-8 text-center space-y-5">
          <Check className="h-8 w-8 text-secondary mx-auto" strokeWidth={1.5} />
          <h3 className="text-xl font-semibold text-foreground font-serif">
            {attending ? "You're on the list" : "Maybe next time"}
          </h3>

          {attending && event.gift_enabled && event.gift_amount && event.gift_amount > 0 && (
            <div className="p-6 rounded-lg bg-accent space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Gift className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                <span className="font-medium text-foreground text-sm">Chip in for a group gift</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Contribute £{(event.gift_amount / 100).toFixed(2)} towards a present for {event.child_name}
              </p>
              <Button onClick={handlePayment} className="w-full" size="lg">
                Pay £{(event.gift_amount / 100).toFixed(2)}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Your name</Label>
            <Input
              id="name"
              placeholder="e.g. Alex Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Can you make it?</Label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={attending === true ? "default" : "outline"}
                className="flex-1"
                size="lg"
                onClick={() => setAttending(true)}
              >
                <Check className="h-4 w-4 mr-1" strokeWidth={1.5} /> Yes
              </Button>
              <Button
                type="button"
                variant={attending === false ? "default" : "outline"}
                className="flex-1"
                size="lg"
                onClick={() => setAttending(false)}
              >
                <X className="h-4 w-4 mr-1" strokeWidth={1.5} /> No
              </Button>
            </div>
          </div>

          {attending && (
            <div className="space-y-2">
              <Label htmlFor="dietary">Allergies or dietary needs (optional)</Label>
              <Textarea
                id="dietary"
                placeholder="e.g. nut allergy, vegetarian"
                value={dietaryNotes}
                onChange={(e) => setDietaryNotes(e.target.value)}
                rows={2}
              />
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={submitting || attending === null}>
            {submitting ? "Submitting..." : "Submit RSVP"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RSVPForm;
