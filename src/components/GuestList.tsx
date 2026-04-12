import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

interface Props {
  guests: Tables<"guests">[];
}

const statusConfig = {
  attending: { label: "Attending", className: "bg-accent/20 text-accent-foreground border-accent/30" },
  not_attending: { label: "Can't make it", className: "bg-destructive/10 text-destructive border-destructive/20" },
  pending: { label: "No response", className: "bg-muted text-muted-foreground border-muted" },
};

const GuestList = ({ guests }: Props) => {
  const attending = guests.filter((g) => g.rsvp_status === "attending");
  const notAttending = guests.filter((g) => g.rsvp_status === "not_attending");
  const pending = guests.filter((g) => g.rsvp_status === "pending");

  const sections = [
    { title: "Attending", emoji: "✅", guests: attending },
    { title: "Not attending", emoji: "❌", guests: notAttending },
    { title: "No response", emoji: "⏳", guests: pending },
  ];

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.title}>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            {section.emoji} {section.title} ({section.guests.length})
          </h4>
          {section.guests.length === 0 ? (
            <p className="text-sm text-muted-foreground/50 pl-2">None yet</p>
          ) : (
            <div className="space-y-2">
              {section.guests.map((guest) => (
                <div key={guest.id} className="flex items-center justify-between p-3 rounded-xl bg-card border">
                  <div>
                    <p className="font-medium text-foreground text-sm">{guest.name}</p>
                    <p className="text-xs text-muted-foreground">{guest.email}</p>
                    {guest.dietary_notes && (
                      <p className="text-xs text-primary mt-1">🥜 {guest.dietary_notes}</p>
                    )}
                  </div>
                  {guest.rsvp_status === "attending" && guest.contribution_status === "paid" && (
                    <Badge variant="outline" className="bg-accent/10 text-accent-foreground text-xs">
                      💳 Paid
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
