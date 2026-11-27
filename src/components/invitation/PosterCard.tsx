import art from "@/assets/card-poster.jpg";

interface Props {
  childName: string;
  age?: number | null;
  dateLabel: string;
  timeLabel?: string | null;
  location: string;
  message?: string | null;
  note?: string | null;
}

const PosterCard = ({ childName, age, dateLabel, timeLabel, location, message, note }: Props) => {
  const name = childName.trim() || "The birthday star";

  return (
    <article className="relative overflow-hidden text-white">
      <img src={art} alt="" className="block w-full" />
      <div className="absolute inset-x-0 bottom-0">
        <div className="h-14 bg-gradient-to-t from-[#0E4DA7] to-transparent" aria-hidden />
        <div className="bg-[#0E4DA7] px-6 pb-7">
        <p className="text-[12px] font-extrabold uppercase tracking-[0.22em]">You're invited</p>
        <h1 className="mt-2 text-[3rem] font-extrabold leading-[0.88] tracking-[-0.05em]">{name}</h1>
        <p className="mt-1 text-[1.15rem] font-semibold">{age ? `turns ${age}` : "is having a birthday"}</p>
        {message?.trim() ? <p className="mt-3 max-w-[18rem] whitespace-pre-line text-[15px] leading-relaxed text-white/90">{message.trim()}</p> : null}
        <div className="mt-4 space-y-0.5 text-[15px] font-semibold">
          <p>{dateLabel}</p>
          {timeLabel ? <p>{timeLabel}</p> : null}
          <p className="font-medium text-white/85">{location || "Somewhere lovely"}</p>
        </div>
        {note?.trim() ? <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-white/85">{note.trim()}</p> : null}
        </div>
      </div>
    </article>
  );
};

export default PosterCard;
