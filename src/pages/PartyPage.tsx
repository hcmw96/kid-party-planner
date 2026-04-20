import { useParams } from "react-router-dom";
import { useEvent } from "@/hooks/useEvent";
import { getTemplate } from "@/lib/templates";
import InvitationCard from "@/components/InvitationCard";
import RSVPForm from "@/components/RSVPForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Gift } from "lucide-react";

const PartyPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { data: event, isLoading, error } = useEvent(eventId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md space-y-6">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground font-sans">
        Party not found
      </div>
    );
  }

  const template = getTemplate((event as any).template || "classic_cream");
  const showGift = event.gift_enabled && event.gift_amount && event.gift_amount > 0;
  const giftAmount = showGift ? (event.gift_amount! / 100).toFixed(2) : null;

  const scrollToRSVP = () => {
    document.getElementById("rsvp-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="h-full page-scrollable animate-fade-in">
      {/* Invitation card — full-width themed hero */}
      <InvitationCard
        template={template}
        childName={event.child_name}
        date={event.date}
        location={event.location}
        description={(event as any).description}
      />

      {/* Gift callout — visible before RSVP */}
      {showGift && (
        <div className="px-6 pt-8 max-w-md mx-auto">
          <div className="rounded-lg border border-border bg-accent/40 p-5 text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Gift className="h-4 w-4 text-foreground" strokeWidth={1.5} />
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans">
                Group gift
              </span>
            </div>
            <p className="text-sm text-foreground font-sans leading-relaxed">
              Chip in <span className="font-semibold">£{giftAmount}</span> towards a present for {event.child_name}
            </p>
            <button
              onClick={scrollToRSVP}
              className="text-[11px] uppercase tracking-[0.15em] font-sans text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
            >
              RSVP below to chip in
            </button>
          </div>
        </div>
      )}

      {/* RSVP Form — base UI below the card */}
      <div id="rsvp-form" className="px-6 py-10 max-w-md mx-auto">
        <RSVPForm event={event} />
      </div>
    </div>
  );
};

export default PartyPage;
