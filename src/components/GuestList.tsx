import type { Tables } from "@/integrations/supabase/types";

interface Props {
  guests: Tables<"guests">[];
}

const GuestList = ({ guests }: Props) => {
  const coming = guests.filter((guest) => guest.rsvp_status === "attending");
  const declined = guests.filter((guest) => guest.rsvp_status === "not_attending");
  const waiting = guests.filter((guest) => guest.rsvp_status === "pending");

  if (guests.length === 0) {
    return (
      <p className="rounded-[22px] bg-white px-5 py-6 text-[15px] leading-relaxed text-[#71677F] shadow-[0_8px_24px_rgba(40,32,53,0.04)]">
        No replies yet. Share the invitation and they'll appear here.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <Group title="Coming" count={coming.length} guests={coming} tone="#32936A" />
      <Group title="Can't make it" count={declined.length} guests={declined} tone="#71677F" />
      {waiting.length > 0 ? <Group title="Awaiting reply" count={waiting.length} guests={waiting} tone="#6B7AFF" /> : null}
    </div>
  );
};

const Group = ({
  title,
  count,
  guests,
  tone,
}: {
  title: string;
  count: number;
  guests: Tables<"guests">[];
  tone: string;
}) => (
  <div>
    <p className="mb-2 flex items-center gap-2 text-[14px] font-bold text-[#282035]">
      <span className="h-2 w-2 rounded-full" style={{ background: tone }} />
      {title}
      <span className="font-semibold text-[#71677F]">{count}</span>
    </p>
    {guests.length === 0 ? (
      <p className="pl-4 text-[14px] text-[#71677F]">No one yet</p>
    ) : (
      <ul className="space-y-2">
        {guests.map((guest) => (
          <li key={guest.id} className="rounded-[18px] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(40,32,53,0.04)]">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[15px] font-bold tracking-[-0.02em] text-[#282035]">{guest.name}</p>
              {guest.contribution_status === "paid" ? (
                <span className="text-[12px] font-semibold text-[#32936A]">Chipped in</span>
              ) : null}
            </div>
            {guest.dietary_notes ? (
              <p className="mt-1 text-[13px] leading-relaxed text-[#71677F]">{guest.dietary_notes}</p>
            ) : null}
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default GuestList;
