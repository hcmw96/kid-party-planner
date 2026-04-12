import { useParams } from "react-router-dom";
import { useEvent } from "@/hooks/useEvent";
import { getTemplate } from "@/lib/templates";
import InvitationCard from "@/components/InvitationCard";
import RSVPForm from "@/components/RSVPForm";
import { Skeleton } from "@/components/ui/skeleton";

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

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Invitation card — full-width themed hero */}
      <InvitationCard
        template={template}
        childName={event.child_name}
        date={event.date}
        location={event.location}
      />

      {/* RSVP Form — base UI below the card */}
      <div className="px-6 py-10 max-w-md mx-auto">
        <RSVPForm event={event} />
      </div>
    </div>
  );
};

export default PartyPage;
