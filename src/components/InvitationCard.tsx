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
  const when = [dateLabel, timeLabel].filter(Boolean).join(" · ");

  if (artUrl) {
    return (
      <article className="relative w-full max-w-full overflow-hidden text-white">
        <img src={artUrl} alt="" className="absolute inset-0 h-full w-full max-w-full object-cover object-[center_18%]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(12,10,16,0.08)_0%,rgba(12,10,16,0.02)_34%,rgba(12,10,16,0.45)_62%,rgba(12,10,16,0.78)_100%)]" />
        <div
          className={`relative flex flex-col justify-end text-center ${
            poster ? "min-h-[34rem] px-6 pb-8 pt-28" : "min-h-[42rem] px-7 pb-9 pt-32"
          }`}
          style={{ textShadow: "0 2px 18px rgba(0,0,0,0.35)" }}
        >
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white/75">
            {template.headline}
          </p>
          <h1 className="mt-3 text-[3.1rem] font-extrabold leading-[0.92] tracking-[-0.045em] text-white">
            {name}
          </h1>
          <p className="mt-2 text-[1.35rem] font-medium tracking-[-0.02em] text-white/90">
            {age ? `is turning ${age}` : "is having a birthday"}
          </p>
          <dl className="mt-5 space-y-1 text-[15px] text-white/80">
            <div>
              <dt className="sr-only">When</dt>
              <dd>{when}</dd>
            </div>
            <div>
              <dt className="sr-only">Where</dt>
              <dd>{location || "Somewhere lovely"}</dd>
            </div>
          </dl>
          {!poster && note ? (
            <p className="mx-auto mt-5 max-w-xs whitespace-pre-line text-[15px] leading-relaxed text-white/90">
              {note}
            </p>
          ) : null}
          {!poster && onRsvp ? (
            <button
              type="button"
              onClick={onRsvp}
              className="mt-7 w-full rounded-[18px] bg-white py-3.5 text-[16px] font-bold tracking-[-0.02em] text-[#282035]"
              style={{ textShadow: "none" }}
            >
              Can you come?
            </button>
          ) : null}
          {!poster ? (
            <p className="mt-6 inline-flex items-center justify-center gap-1.5 text-[12px] font-semibold tracking-[-0.01em] text-white/70">
              <img src={balloonIcon} alt="" className="h-6 w-6 rounded-[22%] object-cover" />
              PartyPal
            </p>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <article
      className="relative w-full max-w-full overflow-hidden"
      style={{ background: template.palette.background, color: template.palette.text }}
    >
      <div className={`relative ${poster ? "h-48" : "h-64"}`}>
        <ThemeArtwork id={template.id} />
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
            <dd>{when}</dd>
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
            <img src={balloonIcon} alt="" className="h-6 w-6 rounded-[22%] object-cover" />
            PartyPal
          </p>
        ) : null}
      </div>
    </article>
  );
};

export default InvitationCard;
