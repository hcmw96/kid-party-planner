import { Link } from "react-router-dom";
import balloonHero from "@/assets/balloon-hero.png";

const Landing = () => {
  return (
    <div className="page-scrollable h-full bg-[#F9F7FC]">
      <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-16 lg:px-12">
        <header className="flex items-center justify-between py-4 lg:col-span-2">
          <span className="text-[20px] font-extrabold tracking-[-0.04em] text-[#282035]">PartyPal</span>
          <Link to="/login" className="text-[15px] font-semibold text-[#71677F]">
            Log in
          </Link>
        </header>

        <section className="flex flex-1 flex-col justify-center pb-8 lg:pb-16">
          <div className="relative mx-auto mb-4 h-[220px] w-full max-w-[340px] lg:hidden">
            <HeroBalloon />
          </div>

          <h1 className="text-[2.7rem] font-extrabold leading-[0.95] tracking-[-0.05em] text-[#282035] sm:text-[3.4rem]">
            Big birthdays.
            <br />
            Little effort.
          </h1>
          <p className="mt-4 max-w-sm text-[16px] leading-relaxed text-[#71677F]">
            Invitations, RSVPs and group gifts. All taken care of, in one little link.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2">
            <Feature
              tint="#EAE2F8"
              mark={<MailMark />}
              label="Invitations"
            />
            <Feature
              tint="#E7F6EE"
              mark={<TickMark />}
              label="RSVPs"
            />
            <Feature
              tint="#FDE7F3"
              mark={<GiftMark />}
              label="Group gifts"
            />
          </div>

          <div className="mt-6">
            <Link to="/create" className="ink-button">
              Create a party
              <span aria-hidden className="ml-1.5">
                →
              </span>
            </Link>
            <p className="mt-3 text-center text-[13px] font-medium text-[#71677F]">
              Ready in two minutes · Free to start
            </p>
            <Link to="/example" className="ghost-button mt-1 w-full">
              See an example party
            </Link>
          </div>
        </section>

        <div className="relative hidden h-[520px] lg:block">
          <HeroBalloon />
        </div>
      </div>
    </div>
  );
};

const HeroBalloon = () => (
  <div className="relative h-full w-full">
    <div
      className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl lg:h-72 lg:w-72"
      style={{ background: "radial-gradient(circle, rgba(107,122,255,0.35), rgba(243,74,165,0.22) 55%, transparent 70%)" }}
      aria-hidden
    />
    <img
      src={balloonHero}
      alt=""
      className="absolute left-1/2 top-[42%] h-36 w-36 -translate-x-1/2 -translate-y-1/2 object-contain motion-safe:animate-float lg:top-1/2 lg:h-72 lg:w-72"
    />
    <div className="absolute left-0 top-2 w-[158px] -rotate-6 rounded-[18px] bg-white px-3 py-2.5 shadow-[0_12px_30px_rgba(40,32,53,0.08)] lg:left-4 lg:top-16 lg:w-[180px]">
      <p className="flex items-center gap-2 text-[13px] font-bold tracking-[-0.02em] text-[#282035]">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E7F6EE]">
          <TickMark small />
        </span>
        Sophie's coming!
      </p>
    </div>
    <div className="absolute bottom-1 right-0 w-[142px] rotate-[5deg] rounded-[18px] bg-white px-3 py-2.5 shadow-[0_12px_30px_rgba(40,32,53,0.08)] lg:bottom-16 lg:right-2 lg:w-[164px]">
      <p className="flex items-center gap-2 text-[13px] font-bold tracking-[-0.02em] text-[#282035]">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FDE7F3]">
          <GiftMark small />
        </span>
        £85 raised
      </p>
    </div>
  </div>
);

const Feature = ({ tint, mark, label }: { tint: string; mark: React.ReactNode; label: string }) => (
  <div className="rounded-[18px] bg-white px-2 py-3 text-center shadow-[0_8px_24px_rgba(40,32,53,0.04)]">
    <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-2xl" style={{ background: tint }}>
      {mark}
    </span>
    <p className="mt-2 text-[12px] font-bold tracking-[-0.02em] text-[#282035] sm:text-[13px]">{label}</p>
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

export default Landing;
