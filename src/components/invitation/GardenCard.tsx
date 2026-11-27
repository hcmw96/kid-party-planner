import type { CSSProperties } from "react";
import { getStationery } from "@/lib/stationery";

interface Props {
  preset?: string;
  childName: string;
  age?: number | null;
  kicker?: string;
  message?: string | null;
  dateLabel: string;
  timeLabel?: string | null;
  location: string;
  note?: string | null;
}

const GardenCard = ({
  preset = "garden",
  childName,
  age,
  kicker,
  message,
  dateLabel,
  timeLabel,
  location,
  note,
}: Props) => {
  const paper = getStationery(preset);
  const name = childName.trim() || "The birthday star";
  const tone = {
    background: paper.paper,
    "--invite-ink": paper.ink,
    "--invite-soft": paper.soft,
    "--invite-kicker": paper.kickerColor,
    "--invite-age": paper.age,
  } as CSSProperties;

  return (
    <article className="overflow-hidden text-center" style={tone}>
      <img src={paper.canopy} alt="" className="block h-[168px] w-full object-cover object-[center_18%]" />
      <div className="relative z-10 px-6 pb-8 pt-4">
        <h1>
          <span className="garden-kicker block">{kicker || paper.kicker}</span>
          <span className="garden-name block">{name}</span>
          <span className="garden-turning block">{age ? "is turning" : "is having a birthday"}</span>
          {age ? (
            <span className="relative mx-auto mt-1 block h-[108px] w-full max-w-[280px]">
              {paper.sprig ? (
                <img src={paper.sprig} alt="" className="garden-sprig pointer-events-none absolute -left-3 top-1 h-28 w-28" />
              ) : null}
              <span className={age > 9 ? "garden-six garden-six-wide" : "garden-six"}>{age}</span>
              <img src={paper.motif} alt="" className="garden-butterfly garden-drift pointer-events-none absolute -right-1 top-0 h-[76px] w-[76px]" />
            </span>
          ) : null}
        </h1>
        {message?.trim() ? (
          <p className="garden-serif mx-auto mt-3 max-w-[16rem] whitespace-pre-line text-[1.08rem] leading-snug" style={{ color: paper.soft }}>
            {message.trim()}
          </p>
        ) : null}
        <div className="mx-auto my-3 flex items-center justify-center gap-3" aria-hidden>
          <span className="h-px w-10" style={{ background: paper.rule }} />
          <span className="h-1.5 w-1.5 rotate-45" style={{ background: paper.diamond }} />
          <span className="h-px w-10" style={{ background: paper.rule }} />
        </div>
        <p className="garden-serif text-[1.08rem] leading-snug" style={{ color: paper.ink }}>
          {dateLabel}
          {timeLabel ? (
            <>
              <br />
              {timeLabel}
            </>
          ) : null}
          <br />
          {location || "Somewhere lovely"}
        </p>
        {note?.trim() ? (
          <p className="garden-serif mx-auto mt-3 max-w-[16rem] text-[0.98rem] italic leading-snug" style={{ color: paper.soft }}>
            {note.trim()}
          </p>
        ) : null}
      </div>
      <img src={paper.floor} alt="" className="block h-[88px] w-full object-cover object-bottom" />
    </article>
  );
};

export default GardenCard;
