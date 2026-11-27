import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import GardenCard from "@/components/invitation/GardenCard";
import { countdownLabel } from "@/lib/party";
import { setStatusBarColor, setStatusBarTextColor } from "@/lib/despia";

/**
 * Sophie's garden party is a local demonstration.
 * It never writes a guest, starts a payment, or updates a party.
 */

type Phase = "choose" | "details" | "done";

interface Props {
  onBack: () => void;
}

const PARTY_DATE = "2026-12-12";

const GardenDemo = ({ onBack }: Props) => {
  const [phase, setPhase] = useState<Phase>("choose");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dietary, setDietary] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [gifted, setGifted] = useState(false);
  const replyRef = useRef<HTMLElement>(null);
  const nameId = useId();
  const emailId = useId();
  const dietaryId = useId();

  useEffect(() => {
    void setStatusBarColor("{243, 235, 221}");
    void setStatusBarTextColor("black");
    return () => {
      void setStatusBarColor("{249, 247, 252}");
      void setStatusBarTextColor("black");
    };
  }, []);

  useEffect(() => {
    if (phase === "choose") return;
    replyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [phase]);

  const choose = (coming: boolean) => {
    setAttending(coming);
    setError(null);
    setGifted(false);
    setPhase("details");
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Add your name so the host knows who replied.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Add an email address. It stays on this screen.");
      return;
    }
    setName(trimmed);
    setEmail(email.trim());
    setError(null);
    setPhase("done");
  };

  const reset = () => {
    setPhase("choose");
    setAttending(null);
    setGifted(false);
    setError(null);
  };

  return (
    <div className="garden-page mx-auto w-full max-w-md px-4 pb-16">
      <header className="sticky top-0 z-10 -mx-4 flex items-center justify-between bg-[#F3EBDD]/92 px-3 py-2 backdrop-blur-md">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-0.5 text-[17px] text-[#243027]">
          <ChevronLeft className="h-6 w-6" strokeWidth={2} />
          Back
        </button>
        <p className="pr-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4E5A43]">Demonstration</p>
      </header>

      <div className="overflow-hidden rounded-[28px] shadow-[0_18px_50px_rgba(90,70,40,0.12)]">
        <GardenCard
          childName="Sophie"
          age={6}
          message="Join us for cake, games and a little garden magic."
          dateLabel="Saturday, 12 December 2026"
          timeLabel="2–4pm"
          location="The Garden, Hampstead"
          note="We'll be in the garden if the weather holds."
        />
      </div>

      <section ref={replyRef} id="example-rsvp" className="scroll-mt-16 px-1 pt-4" aria-labelledby="rsvp-heading">
        {phase === "choose" ? (
          <div className="garden-rise space-y-3">
            <h2 id="rsvp-heading" className="garden-serif text-center text-[1.85rem] font-medium tracking-[-0.03em] text-[#243027]">
              Can you make it?
            </h2>
            <button type="button" className="garden-btn garden-btn-primary" onClick={() => choose(true)}>
              We'll be there!
            </button>
            <button type="button" className="garden-btn garden-btn-quiet" onClick={() => choose(false)}>
              Sorry, we can't make it
            </button>
            <p className="pt-1 text-center text-[14px] text-[#4A433C]">No account needed to reply.</p>
          </div>
        ) : null}

        {phase === "details" && attending !== null ? (
          <form onSubmit={submit} className="garden-rise space-y-4" noValidate>
            <div>
              <button type="button" onClick={() => setPhase("choose")} className="text-[14px] font-semibold text-[#4E5A43]">
                Back
              </button>
              <h2 id="rsvp-heading" className="garden-serif mt-2 text-[1.85rem] font-medium tracking-[-0.03em] text-[#243027]">
                {attending ? "Lovely. A few details." : "Sorry you'll miss it."}
              </h2>
              <p className="mt-1 text-[14px] leading-relaxed text-[#4A433C]">
                {attending
                  ? "Tell Amelia who's coming, and anything the kitchen should know."
                  : "A name is enough. Amelia will be glad you said."}
              </p>
            </div>
            <label htmlFor={nameId} className="block">
              <span className="mb-2 block text-[14px] font-semibold text-[#243027]">Your name</span>
              <input
                id={nameId}
                name="demo-name"
                autoComplete="name"
                className="garden-field"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={80}
              />
            </label>
            <label htmlFor={emailId} className="block">
              <span className="mb-2 block text-[14px] font-semibold text-[#243027]">Email</span>
              <input
                id={emailId}
                name="demo-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                className="garden-field"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                maxLength={120}
              />
              <span className="mt-1.5 block text-[13px] text-[#5C564C]">Kept on this screen only. Nothing is sent.</span>
            </label>
            {attending ? (
              <label htmlFor={dietaryId} className="block">
                <span className="mb-2 block text-[14px] font-semibold text-[#243027]">Dietary requirements</span>
                <textarea
                  id={dietaryId}
                  name="demo-dietary"
                  className="garden-field"
                  rows={3}
                  placeholder="Nut allergy, vegetarian…"
                  value={dietary}
                  onChange={(event) => setDietary(event.target.value)}
                  maxLength={240}
                />
                <span className="mt-1.5 block text-[13px] text-[#5C564C]">Optional. Leave blank if there's nothing to add.</span>
              </label>
            ) : null}
            {error ? (
              <p className="text-center text-[13px] font-medium text-[#8C3A42]" role="alert">
                {error}
              </p>
            ) : null}
            <button type="submit" className="garden-btn garden-btn-primary">
              Confirm reply
            </button>
            <p className="text-center text-[14px] text-[#4A433C]">No account needed to reply.</p>
          </form>
        ) : null}

        {phase === "done" && attending !== null ? (
          <div className="space-y-8">
            <div className="garden-rise relative overflow-hidden text-center" aria-live="polite">
              <span className="garden-petal left-[18%] top-2 bg-[#E7A8B0]" aria-hidden />
              <span className="garden-petal left-[46%] top-0 bg-[#E3C15A] [animation-delay:120ms]" aria-hidden />
              <span className="garden-petal right-[22%] top-3 bg-[#A9B89A] [animation-delay:220ms]" aria-hidden />
              <h2 id="rsvp-heading" className="garden-serif text-[2rem] font-medium leading-tight tracking-[-0.03em] text-[#243027]">
                {attending ? "We'll save you a place" : "Thank you for telling us"}
              </h2>
              <p className="garden-serif mx-auto mt-3 max-w-[18rem] text-[1.15rem] leading-relaxed text-[#3c4636]">
                {attending
                  ? `${name}, we'll see you in the garden on Saturday, from 2–4pm.`
                  : `${name}, Amelia will be glad you let her know.`}
              </p>
              {attending && dietary.trim() ? (
                <p className="mx-auto mt-3 max-w-[18rem] text-[14px] leading-relaxed text-[#4A433C]">
                  Noted for the kitchen: {dietary.trim()}.
                </p>
              ) : null}
            </div>

            {attending ? (
              <div className="garden-rise rounded-[24px] bg-[#F7F2E6] px-5 py-5 text-left shadow-[0_10px_30px_rgba(90,70,40,0.08)]">
                <p className="garden-serif text-[1.35rem] leading-snug text-[#243027]">A garden gift, if you'd like</p>
                <p className="mt-2 text-[15px] leading-relaxed text-[#4A433C]">
                  A few families are putting in £10 each towards something special for Sophie. Entirely optional.
                </p>
                {gifted ? (
                  <p className="mt-4 text-[14px] font-semibold leading-relaxed text-[#3E5344]" role="status">
                    Added to the example gift. This is a demonstration, so nothing was charged.
                  </p>
                ) : (
                  <button type="button" className="garden-btn garden-btn-primary mt-4" onClick={() => setGifted(true)}>
                    Chip in £10
                  </button>
                )}
              </div>
            ) : null}

            <div className="garden-rise space-y-4">
              <h2 className="garden-serif text-center text-[1.7rem] font-medium leading-tight tracking-[-0.03em] text-[#243027]">
                And here's what the party organiser sees.
              </h2>
              <OrganiserPreview name={name} attending={attending} dietary={dietary.trim()} gifted={gifted} />
              <button type="button" onClick={reset} className="mx-auto block text-[14px] font-semibold text-[#4E5A43]">
                Try another reply
              </button>
            </div>

            <div className="garden-rise space-y-3 pt-2 text-center">
              <h2 className="garden-serif text-[2rem] font-medium leading-tight tracking-[-0.03em] text-[#243027]">
                Ready to make their day?
              </h2>
              <Link to="/create?style=garden" className="garden-btn garden-btn-primary">
                Create your own party
              </Link>
              <p className="text-[13px] leading-relaxed text-[#5C564C]">
                PartyPal demonstration. Nothing you typed was saved or charged.
              </p>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
};

const OrganiserPreview = ({
  name,
  attending,
  dietary,
  gifted,
}: {
  name: string;
  attending: boolean;
  dietary: string;
  gifted: boolean;
}) => (
  <div className="rounded-[28px] border border-[#E4D8C4] bg-[#F6F3EE] p-2.5 shadow-[0_16px_40px_rgba(70,55,30,0.08)]">
    <div className="rounded-[22px] bg-white px-4 py-4">
      <p className="text-[13px] font-semibold text-[#6B7AFF]">{countdownLabel(PARTY_DATE)}</p>
      <p className="mt-1 text-[1.35rem] font-extrabold leading-none tracking-[-0.04em] text-[#282035]">Sophie's birthday</p>
      <p className="mt-2 text-[13px] leading-relaxed text-[#71677F]">Saturday, 12 December 2026 · 2–4pm · The Garden, Hampstead</p>
      <p className="mb-2 mt-5 text-[15px] font-extrabold tracking-[-0.03em] text-[#282035]">Guest responses</p>
      <p className="mb-2 flex items-center gap-2 text-[14px] font-bold text-[#282035]">
        <span className="h-2 w-2 rounded-full" style={{ background: attending ? "#32936A" : "#71677F" }} />
        {attending ? "Coming" : "Can't make it"}
        <span className="font-semibold text-[#71677F]">1</span>
      </p>
      <div className="rounded-[16px] bg-[#FBF8F3] px-3.5 py-3">
        <div className="flex items-baseline justify-between gap-3">
          <p className="truncate text-[15px] font-bold tracking-[-0.02em] text-[#282035]">{name}</p>
          {gifted ? (
            <span className="shrink-0 text-[12px] font-semibold text-[#32936A]">Chipped in</span>
          ) : (
            <span className="shrink-0 text-[12px] font-semibold text-[#5C4818]">Just now</span>
          )}
        </div>
        {attending && dietary ? <p className="mt-1 text-[13px] leading-relaxed text-[#71677F]">{dietary}</p> : null}
      </div>
      {gifted ? (
        <div className="mt-4 border-t border-[#F0E8DC] pt-4">
          <p className="text-[13px] font-semibold text-[#71677F]">Group gift</p>
          <p className="mt-1 text-[1.7rem] font-extrabold leading-none tracking-[-0.04em] text-[#282035]">
            £10
            <span className="ml-2 text-[14px] font-semibold text-[#71677F]">raised</span>
          </p>
          <p className="mt-1 text-[13px] text-[#71677F]">Suggested £10 each. Skipping is always fine.</p>
        </div>
      ) : null}
    </div>
    <p className="px-2 pb-1 pt-2.5 text-center text-[12px] leading-relaxed text-[#6A6256]">
      A preview of Amelia's guest list. This reply was not saved.
    </p>
  </div>
);

export default GardenDemo;
