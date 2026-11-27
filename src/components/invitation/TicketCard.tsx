import art from "@/assets/card-ticket.jpg";

interface Props {
  childName: string;
  age?: number | null;
  dateLabel: string;
  timeLabel?: string | null;
  location: string;
  message?: string | null;
  note?: string | null;
}

const TicketCard = ({ childName, age, dateLabel, timeLabel, location, message, note }: Props) => {
  const name = childName.trim() || "The birthday star";
  const when = [dateLabel, timeLabel].filter(Boolean).join(" · ");

  return (
    <article className="relative overflow-hidden text-[#F6F0E4]">
      <img src={art} alt="" className="block w-full" />
      <div className="absolute inset-x-0 bottom-0">
        <div className="h-16 bg-gradient-to-t from-[#372F25] to-transparent" aria-hidden />
        <div className="bg-[#372F25] px-6 pb-7">
        <p className="text-[12px] font-extrabold tracking-[0.28em]">ADMIT ONE{age ? ` · ${age}` : ""}</p>
        <h1 className="mt-2 text-[2.6rem] font-extrabold uppercase leading-[0.9] tracking-[-0.04em]">{name}</h1>
        {message?.trim() ? <p className="mt-3 max-w-[18rem] whitespace-pre-line text-[15px] leading-relaxed text-[#F6F0E4]/90">{message.trim()}</p> : null}
        <div className="mt-4 space-y-1 text-[15px] font-semibold">
          <p>{when || "All afternoon"}</p>
          <p className="font-medium text-[#F6F0E4]/85">{location || "Somewhere lovely"}</p>
        </div>
        {note?.trim() ? <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-[#F6F0E4]/80">{note.trim()}</p> : null}
        </div>
      </div>
    </article>
  );
};

export default TicketCard;
