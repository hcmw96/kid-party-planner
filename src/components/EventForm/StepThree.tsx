import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import type { EventFormData } from "@/lib/eventForm";
import { getTemplate } from "@/lib/templates";
import { ageFromTitle, birthdayTitle, composeDescription, formatPartyDate, splitPartyNotes } from "@/lib/party";
import { getShareUrl } from "@/lib/shareUrl";
import InvitationCard from "@/components/InvitationCard";
import Confetti from "@/components/design/Confetti";

interface Props {
  eventId: string;
  formData: EventFormData;
}

const whatsAppHref = (name: string, url: string) =>
  `https://wa.me/?text=${encodeURIComponent(`You're invited to ${name}'s party.\n${url}`)}`;

const StepThree = ({ eventId, formData }: Props) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = getShareUrl(eventId);
  const description = composeDescription({
    wording: formData.description,
    notes: formData.notes,
    start: formData.startTime,
    end: formData.endTime,
  });
  const { timeLabel, body } = splitPartyNotes(description);
  const title = birthdayTitle(formData.childName, formData.age);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  return (
    <div className="step-rise relative space-y-6">
      <Confetti />
      <div>
        <h2 className="text-[2rem] font-extrabold leading-[1.05] tracking-[-0.045em] text-[#282035]">
          You're ready to party
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[#71677F]">
          Send this to the parents. They can reply without an account.
        </p>
      </div>

      <div className="overflow-hidden rounded-[24px] shadow-[0_16px_40px_rgba(40,32,53,0.08)]">
        <InvitationCard
          template={getTemplate(formData.template)}
          childName={formData.childName}
          age={ageFromTitle(title)}
          dateLabel={formatPartyDate(formData.date)}
          timeLabel={timeLabel}
          location={formData.location}
          note={body}
          artUrl={formData.artUrl}
          variant="poster"
        />
      </div>

      <a className="ink-button" href={whatsAppHref(formData.childName, shareUrl)} target="_blank" rel="noreferrer">
        Share on WhatsApp
      </a>
      <button type="button" onClick={() => void handleCopy()} className="soft-button">
        {copied ? "Copied" : "Copy invitation link"}
      </button>
      <div className="grid grid-cols-2 gap-3">
        <Link to={`/party/${eventId}`} className="soft-button" target="_blank" rel="noreferrer">
          View invitation
        </Link>
        <Link to={`/dashboard/${eventId}`} className="soft-button">
          Manage party
        </Link>
      </div>
    </div>
  );
};

export default StepThree;
