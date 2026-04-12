import { useParams } from "react-router-dom";
import { useEvent } from "@/hooks/useEvent";
import RSVPForm from "@/components/RSVPForm";
import { PartyPopper, MapPin, CalendarDays } from "lucide-react";

const PartyPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { data: event, isLoading, error } = useEvent(eventId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading party details...
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Party not found 😕
      </div>
    );
  }

  const partyDate = new Date(event.date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Party Info */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <PartyPopper className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {event.child_name}'s Party! 🎉
          </h1>
          <div className="space-y-2 text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span>{partyDate}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          </div>
        </div>

        {/* RSVP Form */}
        <RSVPForm event={event} />
      </div>
    </div>
  );
};

export default PartyPage;
