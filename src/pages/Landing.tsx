import { Link } from "react-router-dom";
import balloonHero from "@/assets/balloon-hero.png";

const confetti = [
  { left: "18%", top: "18%", rotate: "-18deg", color: "#F6C15B", w: 7, h: 11 },
  { left: "28%", top: "8%", rotate: "24deg", color: "#6B7AFF", w: 6, h: 9 },
  { left: "72%", top: "12%", rotate: "16deg", color: "#F34AA5", w: 8, h: 5 },
  { left: "82%", top: "28%", rotate: "-28deg", color: "#7ED0A8", w: 6, h: 10 },
  { left: "12%", top: "46%", rotate: "32deg", color: "#F34AA5", w: 5, h: 8 },
  { left: "86%", top: "52%", rotate: "-12deg", color: "#F6C15B", w: 7, h: 4 },
  { left: "22%", top: "68%", rotate: "18deg", color: "#6B7AFF", w: 5, h: 9 },
  { left: "76%", top: "70%", rotate: "-22deg", color: "#F34AA5", w: 6, h: 8 },
];

const Landing = () => {
  return (
    <div className="page-scrollable relative h-full bg-[#F9F7FC]">
      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-md flex-col px-5 pb-10">
        <header className="flex items-center justify-between py-4">
          <span className="text-[20px] font-extrabold tracking-[-0.04em] text-[#282035]">PartyPal</span>
          <Link to="/login" className="text-[15px] font-semibold text-[#71677F]">
            Log in
          </Link>
        </header>

        <section className="flex flex-1 flex-col justify-center text-center">
          <HeroBalloon />

          <h1 className="mt-2 text-[2.65rem] font-extrabold leading-[0.95] tracking-[-0.05em] text-[#282035]">
            Big birthdays.
            <br />
            Little effort.
          </h1>
          <p className="mx-auto mt-4 max-w-[280px] text-[16px] leading-relaxed text-[#71677F]">
            Invitations, RSVPs and group gifts. All taken care of, in one little link.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2.5">
            <Feature tint="#EAE2F8" mark={<MailMark />} label="Invitations" />
            <Feature tint="#E7F6EE" mark={<TickMark />} label="RSVPs" />
            <Feature tint="#FDE7F3" mark={<GiftMark />} label="Group gifts" />
          </div>

          <div className="mt-6">
            <Link to="/create" className="ink-button">
              Create a party
              <span aria-hidden className="ml-1.5">
                →
              </span>
            </Link>
            <p className="mt-3 text-[13px] font-medium text-[#71677F]">Ready in two minutes · Free to start</p>
            <Link
              to="/example"
              className="mt-3 inline-flex items-center justify-center gap-2 text-[15px] font-semibold text-[#71677F] underline decoration-[#C9C0D4] underline-offset-[5px]"
            >
              See an example party
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#C9C0D4]">
                <PlayMark />
              </span>
            </Link>
          </div>
        </section>
      </div>
      <BottomWave />
    </div>
  );
};

const HeroBalloon = () => (
  <div className="relative mx-auto h-[300px] w-full">
    <div
      className="absolute left-1/2 top-[46%] h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
      style={{ background: "radial-gradient(circle, rgba(107,122,255,0.28), rgba(243,74,165,0.18) 55%, transparent 72%)" }}
      aria-hidden
    />
    {confetti.map((piece) => (
      <span
        key={`${piece.left}-${piece.top}`}
        className="absolute rounded-[2px]"
        style={{
          left: piece.left,
          top: piece.top,
          width: piece.w,
          height: piece.h,
          background: piece.color,
          transform: `rotate(${piece.rotate})`,
        }}
        aria-hidden
      />
    ))}
    <div className="absolute left-1/2 top-[42%] h-56 w-56 -translate-x-1/2 -translate-y-1/2">
      <img src={balloonHero} alt="" className="h-full w-full object-contain motion-safe:animate-float" />
    </div>
    <div className="absolute left-0 top-16 -rotate-6 rounded-full bg-white py-2 pl-2 pr-3.5 shadow-[0_10px_28px_rgba(40,32,53,0.1)]">
      <p className="flex items-center gap-2 text-[13px] font-bold tracking-[-0.02em] text-[#282035]">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E7F6EE]">
          <TickMark small />
        </span>
        Sophie's coming!
      </p>
    </div>
    <div className="absolute right-0 top-[58%] rotate-[4deg] rounded-full bg-white py-2 pl-2 pr-3.5 shadow-[0_10px_28px_rgba(40,32,53,0.1)]">
      <p className="flex items-center gap-2 text-[13px] font-bold tracking-[-0.02em] text-[#282035]">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FDE7F3]">
          <GiftMark small />
        </span>
        £85 raised
      </p>
    </div>
  </div>
);

const Feature = ({ tint, mark, label }: { tint: string; mark: React.ReactNode; label: string }) => (
  <div className="rounded-[22px] bg-white px-2 py-4 text-center shadow-[0_8px_24px_rgba(40,32,53,0.05)]">
    <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full" style={{ background: tint }}>
      {mark}
    </span>
    <p className="mt-2.5 text-[13px] font-bold tracking-[-0.02em] text-[#282035]">{label}</p>
  </div>
);

const TickMark = ({ small = false }: { small?: boolean }) => (
  <svg width={small ? 12 : 16} height={small ? 12 : 16} viewBox="0 0 16 16" aria-hidden>
    <path d="M3.2 8.3 6.4 11.4 12.8 4.6" fill="none" stroke="#32936A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GiftMark = ({ small = false }: { small?: boolean }) => (
  <svg width={small ? 12 : 16} height={small ? 12 : 16} viewBox="0 0 16 16" aria-hidden>
    <rect x="2.5" y="7" width="11" height="6.5" rx="1.4" fill="none" stroke="#F34AA5" strokeWidth="1.4" />
    <path d="M2.5 9.2h11M8 7v6.5M8 7c-1.2 0-2.2-1.6-1.2-2.6S8 5.6 8 7Zm0 0c1.2 0 2.2-1.6 1.2-2.6S8 5.6 8 7Z" fill="none" stroke="#F34AA5" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const MailMark = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
    <rect x="2" y="3.5" width="12" height="9" rx="1.6" fill="none" stroke="#6B7AFF" strokeWidth="1.4" />
    <path d="M3 5.2 8 8.6 13 5.2" fill="none" stroke="#6B7AFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PlayMark = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden>
    <path d="M2.2 1.4v5.2L6.6 4 2.2 1.4Z" fill="#71677F" />
  </svg>
);

const BottomWave = () => (
  <svg className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full" viewBox="0 0 390 110" preserveAspectRatio="none" aria-hidden>
    <path d="M0 58c48 22 96-18 150-6s92 34 140 18 68-28 100-16v56H0Z" fill="#F4E4F2" />
    <path d="M0 78c60 16 110-8 170 2s90 18 130 4 58-14 90-6v32H0Z" fill="#FBEAF6" />
  </svg>
);

export default Landing;
