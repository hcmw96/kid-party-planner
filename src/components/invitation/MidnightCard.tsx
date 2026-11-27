import art from "@/assets/card-midnight.jpg";

interface Props {
  childName: string;
  age?: number | null;
  dateLabel: string;
  timeLabel?: string | null;
  location: string;
  message?: string | null;
  note?: string | null;
}

const MidnightCard = ({ childName, age, dateLabel, timeLabel, location, message, note }: Props) => {
  const name = childName.trim() || "The birthday star";

  return (
    <article className="relative overflow-hidden text-[#F4EFE4]">
      <img src={art} alt="" className="block w-full" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#010409] from-30% to-transparent px-6 pb-8 pt-24 text-center">
        <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-[#E4C56A]">After dark</p>
        <h1 className="garden-serif mt-3 text-[3.2rem] font-medium leading-[0.9] tracking-[-0.03em]">{name}</h1>
        <p className="mt-2 text-[13px] font-semibold uppercase tracking-[0.2em] text-[#C9C0AE]">
          {age ? `Turns ${age}` : "A birthday"}
        </p>
        {message?.trim() ? (
          <p className="garden-serif mx-auto mt-4 max-w-[16rem] whitespace-pre-line text-[1.05rem] leading-snug">{message.trim()}</p>
        ) : null}
        <div className="mx-auto my-4 h-px w-12 bg-[#E4C56A]/70" aria-hidden />
        <div className="space-y-1 text-[15px]">
          <p>{dateLabel}</p>
          {timeLabel ? <p>{timeLabel}</p> : null}
          <p className="text-[#C9C0AE]">{location || "Somewhere lovely"}</p>
        </div>
        {note?.trim() ? <p className="mx-auto mt-3 max-w-[16rem] whitespace-pre-line text-[14px] leading-relaxed text-[#C9C0AE]">{note.trim()}</p> : null}
      </div>
    </article>
  );
};

export default MidnightCard;
