import { useEffect, useRef } from "react";
import canopy from "@/assets/garden-spray.jpg";
import yours from "@/assets/card-yours.jpg";
import poster from "@/assets/card-poster.jpg";
import midnight from "@/assets/card-midnight.jpg";
import ticket from "@/assets/card-ticket.jpg";
import { personalArtUrl, type EventFormData } from "@/lib/eventForm";

const CARDS = [
  { id: "paint", title: "Make yours", blurb: "Painted from the one thing they love" },
  { id: "garden", title: "The Garden", blurb: "Wildflowers, painted on ivory paper" },
  { id: "poster", title: "Poster", blurb: "Flat colour, like a printed poster" },
  { id: "midnight", title: "Midnight", blurb: "A gold moon on a dark sky" },
  { id: "ticket", title: "Ticket", blurb: "A letterpress admit-one" },
] as const;

interface Props {
  formData: EventFormData;
  selected: string;
  painting?: boolean;
  onSelect: (id: string) => void;
}

const PresetShelf = ({ formData, selected, painting = false, onSelect }: Props) => {
  const railRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const chosen = CARDS.find((card) => card.id === selected) ?? CARDS[0];
  const name = formData.childName.trim() || "Them";
  const age = formData.age.trim();

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const rail = railRef.current;
    const card = rail?.querySelector<HTMLElement>(`[data-preset="${selected}"]`);
    if (!rail || !card) return;
    const left = card.offsetLeft - 20;
    rail.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [selected]);

  return (
    <div>
      <div ref={railRef} className="card-rail -mx-5" role="group" aria-label="Invitation cards">
        {CARDS.map((card) => (
          <button
            key={card.id}
            type="button"
            data-preset={card.id}
            aria-pressed={selected === card.id}
            aria-label={card.title}
            onClick={() => onSelect(card.id)}
            className="card-rail-item"
          >
            <span className="card-rail-face" aria-hidden>
              <CardFace
                id={card.id}
                name={name}
                age={age}
                faceUrl={personalArtUrl(formData, card.id)}
                painting={painting && selected === card.id}
              />
            </span>
            <span className={`card-rail-label ${selected === card.id ? "text-[#141414]" : "text-[#71677F]"}`}>{card.title}</span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-[14px] leading-relaxed text-[#71677F]">{chosen.blurb}</p>
    </div>
  );
};

const CardFace = ({ id, name, age, faceUrl, painting }: { id: string; name: string; age: string; faceUrl: string | null; painting: boolean }) => {
  if (painting && !faceUrl && id !== "paint" && id !== "garden") {
    const tone = id === "midnight" ? "bg-[#10131A]" : id === "poster" ? "bg-[#0E4DA7]" : "bg-[#E7DCC8]";
    return <span className={`block h-full ${tone}`} />;
  }

  if (faceUrl && id !== "paint" && id !== "garden") {
    return (
      <span className="block h-full">
        <img src={faceUrl} alt="" className="h-full w-full object-cover object-top" />
      </span>
    );
  }

  if (id === "paint") {
    return (
      <span className="relative block h-full text-[#1A1408]">
        <img src={yours} alt="" className="h-full w-full object-cover" />
        <span className="absolute inset-x-2 top-[18%] rounded-[16px] bg-[#FCF0DB]/90 px-2 py-3 text-center">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#1A1408]/70">Generate</span>
          <span className="mt-1 block text-[1.28rem] font-extrabold leading-[0.95] tracking-[-0.04em]">Make theirs</span>
          <span className="mt-1 block text-[11px] font-semibold leading-tight text-[#1A1408]/75">from what they love</span>
        </span>
      </span>
    );
  }

  if (id === "garden") {
    return (
      <span className="flex h-full flex-col bg-[#F7F2E6] text-center">
        <img src={canopy} alt="" className="h-[46%] w-full object-cover object-[center_20%]" />
        <span className="flex flex-1 flex-col items-center justify-center px-2">
          <span className="garden-serif text-[1.25rem] leading-none text-[#243027]">{name}</span>
          {age ? <span className="garden-serif mt-1 text-[2.4rem] leading-none text-[#B85D6C]">{age}</span> : null}
        </span>
      </span>
    );
  }

  if (id === "poster") {
    return (
      <span className="relative block h-full text-white">
        <img src={poster} alt="" className="h-full w-full object-cover object-[center_42%]" />
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0E4DA7] to-transparent px-3 pb-3 pt-8 text-left text-[1.15rem] font-extrabold leading-none tracking-[-0.03em]">
          {name}
          {age ? <span className="mt-1 block text-[1.4rem]">{age}</span> : null}
        </span>
      </span>
    );
  }

  if (id === "midnight") {
    return (
      <span className="relative block h-full text-[#F4EFE4]">
        <img src={midnight} alt="" className="h-full w-full object-cover object-top" />
        <span className="absolute inset-x-0 bottom-0 px-3 pb-3 text-center">
          <span className="garden-serif block text-[1.2rem] leading-none">{name}</span>
          {age ? <span className="mt-1 block text-[11px] font-semibold tracking-[0.16em] text-[#E4C56A]">{age}</span> : null}
        </span>
      </span>
    );
  }

  return (
    <span className="relative block h-full text-[#F6F0E4]">
      <img src={ticket} alt="" className="h-full w-full object-cover object-[center_30%]" />
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#372F25] to-transparent px-3 pb-3 pt-8 text-left text-[1rem] font-extrabold uppercase leading-none tracking-[-0.03em]">
        {name}
      </span>
    </span>
  );
};

export default PresetShelf;
