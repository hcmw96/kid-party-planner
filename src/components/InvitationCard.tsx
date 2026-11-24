import type { InvitationTemplate } from "@/lib/templates";
import ThemeArtwork from "@/components/invitation/ThemeArtwork";
import balloonIcon from "@/assets/balloon-icon.png";

interface Props {
  template: InvitationTemplate;
  childName: string;
  age?: number | null;
  dateLabel: string;
  timeLabel?: string | null;
  location: string;
  note?: string | null;
  artUrl?: string | null;
  variant?: "card" | "poster";
  onRsvp?: () => void;
}

const InvitationCard = ({
  template,
  childName,
  age,
  dateLabel,
  timeLabel,
  location,
  note,
  artUrl,
  variant = "card",
  onRsvp,
}: Props) => {
  const name = childName.trim() || "The birthday star";
  const poster = variant === "poster";

  return (
    <article
      className="relative overflow-hidden"
      style={{ background: template.palette.background, color: template.palette.text }}
    >
      <div className={`relative ${poster ? "h-48" : "h-64"}`}>
        {artUrl ? (
          <img src={artUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <ThemeArtwork id={template.id} />
        )}
        <div
          className="absolute inset-x-0 bottom-0 h-16"
          style={{
            background: `linear-gradient(to bottom, transparent, ${template.palette.background})`,
          }}
        />
      </div>

      <div className={`relative px-6 text-center ${poster ? "pb-5" : "px-7 pb-8"}`}>
        <p className="text-[15px] font-semibold" style={{ color: template.palette.accent }}>
          {template.headline}
        </p>
        <h1 className="mt-2 text-[2.6rem] font-extrabold leading-[0.95] tracking-[-0.045em]">
          {name}
        </h1>
        <p className="mt-2 text-[1.25rem] font-medium leading-snug tracking-[-0.02em]">
          {age ? `is turning ${age}` : "is having a birthday"}
        </p>

        <dl className="mt-6 space-y-1 text-[15px]" style={{ color: template.palette.muted }}>
          <div>
            <dt className="sr-only">When</dt>
            <dd>{[dateLabel, timeLabel].filter(Boolean).join(" · ")}</dd>
          </div>
          <div>
            <dt className="sr-only">Where</dt>
            <dd>{location || "Somewhere lovely"}</dd>
          </div>
        </dl>

        {!poster && note ? (
          <p className="mx-auto mt-5 max-w-xs whitespace-pre-line text-[15px] leading-relaxed" style={{ color: template.palette.text }}>
            {note}
          </p>
        ) : null}

        {!poster && onRsvp ? (
          <button type="button" onClick={onRsvp} className="ink-button mt-7">
            Can you come?
          </button>
        ) : null}

        {!poster ? (
          <p className="mt-6 inline-flex items-center gap-1.5 text-[12px] font-semibold tracking-[-0.01em]" style={{ color: template.palette.muted }}>
            <img src={balloonIcon} alt="" className="h-4 w-4 object-contain" />
            PartyPal
          </p>
        ) : null}
      </div>
    </article>
  );
};

export default InvitationCard;
