import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

interface Props {
  guests: Tables<"guests">[];
}

const GuestList = ({ guests }: Props) => {
  const attending = guests.filter((g) => g.rsvp_status === "attending");
  const notAttending = guests.filter((g) => g.rsvp_status === "not_attending");
  const pending = guests.filter((g) => g.rsvp_status === "pending");

  const sections = [
    { title: "Attending", guests: attending },
    { title: "Not attending", guests: notAttending },
    { title: "No response", guests: pending },
  ];

  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <div key={section.title}>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {section.title} ({section.guests.length})
          </h4>
          {section.guests.length === 0 ? (
            <p className="text-sm text-muted-foreground/50 pl-1">None yet</p>
          ) : (
            <div className="space-y-2">
              {section.guests.map((guest) => (
                <div key={guest.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <div>
                    <p className="font-medium text-foreground text-sm">{guest.name}</p>
                    <p className="text-xs text-muted-foreground">{guest.email}</p>
                    {guest.dietary_notes && (
                      <p className="text-xs text-muted-foreground mt-1">{guest.dietary_notes}</p>
                    )}
                  </div>
                  {guest.rsvp_status === "attending" && guest.contribution_status === "paid" && (
                    <Badge variant="outline" className="text-xs">
                      Paid
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default GuestList;
