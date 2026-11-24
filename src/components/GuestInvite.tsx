import { useEffect } from "react";
import type { Tables } from "@/integrations/supabase/types";
import { getTemplate } from "@/lib/templates";
import { ageFromTitle, formatPartyDate, splitPartyNotes } from "@/lib/party";
import { setStatusBarColor, setStatusBarTextColor } from "@/lib/despia";
import InvitationCard from "@/components/InvitationCard";
import RSVPForm from "@/components/RSVPForm";

interface Props {
  event: Tables<"events">;
  demo?: boolean;
}

const GuestInvite = ({ event, demo = false }: Props) => {
  const template = getTemplate(event.template || "classic");
  const { timeLabel, body } = splitPartyNotes(event.description);
  const showGift = event.gift_enabled && event.gift_amount && event.gift_amount > 0;

  useEffect(() => {
    if (template.dark) {
      void setStatusBarColor("{20, 24, 43}");
      void setStatusBarTextColor("white");
    } else {
      void setStatusBarColor("{249, 247, 252}");
      void setStatusBarTextColor("black");
    }
    return () => {
      void setStatusBarColor("{249, 247, 252}");
      void setStatusBarTextColor("black");
    };
  }, [template.dark]);

  return (
    <div className="min-h-full bg-[#F9F7FC] lg:py-10">
      <div className="mx-auto min-h-full max-w-md bg-[#F9F7FC] lg:overflow-hidden lg:rounded-[28px] lg:shadow-[0_24px_60px_rgba(40,32,53,0.08)]">
        {demo ? (
          <p className="px-6 pt-4 text-center text-[13px] font-medium text-[#71677F]">
            An example party, so you can try the invitation.
          </p>
        ) : null}
        <InvitationCard
          template={template}
          childName={event.child_name}
          age={ageFromTitle(event.title)}
          dateLabel={formatPartyDate(event.date)}
          timeLabel={timeLabel}
          location={event.location}
          note={body}
          artUrl={event.art_url}
        />
        <div id="rsvp-form" className="space-y-6 px-5 pb-16 pt-2">
          {showGift ? (
            <p className="text-center text-[14px] leading-relaxed text-[#71677F]">
              There's an optional group gift after you reply. No pressure at all.
            </p>
          ) : null}
          <RSVPForm event={event} demo={demo} />
        </div>
      </div>
    </div>
  );
};

export default GuestInvite;
