import type { Tables } from "@/integrations/supabase/types";

interface Props {
  event: Tables<"events">;
  guests: Tables<"guests">[];
}

const GiftProgress = ({ event, guests }: Props) => {
  if (!event.gift_enabled) return null;

  const paid = guests.filter((guest) => guest.rsvp_status === "attending" && guest.contribution_status === "paid");
  const fromGuests = paid.length * (event.gift_amount || 0);
  const raised = event.gift_pot_total > 0 ? event.gift_pot_total : fromGuests;
  const suggested = event.gift_amount && event.gift_amount > 0 ? event.gift_amount / 100 : null;

  return (
    <section className="overflow-hidden rounded-[24px] bg-white shadow-[0_8px_24px_rgba(40,32,53,0.04)]">
      <div className="relative h-28 bg-[#FDE7F3]">
        <svg viewBox="0 0 320 110" className="absolute inset-0 h-full w-full" aria-hidden>
          <rect width="320" height="110" fill="#FDE7F3" />
          <rect x="118" y="48" width="84" height="46" rx="8" fill="#F34AA5" />
          <rect x="108" y="38" width="104" height="16" rx="6" fill="#6B7AFF" />
          <path d="M160 38c-12 0-22-14-10-22 8-6 18 4 10 22Zm0 0c12 0 22-14 10-22-8-6-18 4-10 22Z" fill="#F6C15B" />
        </svg>
      </div>
      <div className="space-y-3 px-5 py-5">
        <p className="text-[13px] font-semibold text-[#71677F]">Group gift</p>
        <p className="text-[2rem] font-extrabold leading-none tracking-[-0.04em] text-[#282035]">
          £{(raised / 100).toFixed(0)}
          <span className="ml-2 text-[15px] font-semibold text-[#71677F]">raised</span>
        </p>
        {suggested ? <p className="text-[14px] text-[#71677F]">Suggested £{suggested.toFixed(0)} each. Skipping is always fine.</p> : null}
        {paid.length > 0 ? (
          <ul className="space-y-1 pt-1">
            {paid.map((guest) => (
              <li key={guest.id} className="text-[14px] font-semibold text-[#282035]">
                {guest.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[14px] text-[#71677F]">No contributions yet.</p>
        )}
      </div>
    </section>
  );
};

export default GiftProgress;
