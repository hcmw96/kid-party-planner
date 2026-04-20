import { Link } from "react-router-dom";
import { Clock, Gift, Users } from "lucide-react";
import loginBg from "@/assets/login-bg.svg";

const Landing = () => {
  return (
    <div
      className="h-full flex flex-col overflow-hidden animate-fade-in relative"
      style={{ backgroundImage: `url(${loginBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-background/60" />

      <header className="relative z-10 px-6 py-5 flex items-center justify-between">
        <span className="text-sm font-serif font-semibold tracking-[0.3em] uppercase text-foreground">
          PartyPal
        </span>
        <Link
          to="/login"
          className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors font-sans"
        >
          Log in
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center max-w-sm mx-auto gap-8 pb-8 w-full">
        <div className="space-y-4">
          <h1 className="text-4xl font-serif italic text-foreground leading-[1.15]">
            The easiest way to organise a children's party
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed font-sans">
            One link for RSVPs, dietary info, and a group gift.<br />No app downloads, no fuss.
          </p>
        </div>

        <div className="grid gap-3 w-full">
          <Feature
            icon={<Clock className="h-4 w-4 text-foreground" strokeWidth={1.5} />}
            title="Two-minute setup"
            description="Create your party, share a link. Done."
          />
          <Feature
            icon={<Users className="h-4 w-4 text-foreground" strokeWidth={1.5} />}
            title="Instant RSVPs"
            description="Guests respond in two taps — no login needed."
          />
          <Feature
            icon={<Gift className="h-4 w-4 text-foreground" strokeWidth={1.5} />}
            title="Group gift"
            description="Collect contributions so parents can chip in together."
          />
        </div>

        <Link to="/login" className="w-full">
          <button className="w-full h-12 rounded-lg bg-foreground text-background text-sm uppercase tracking-[0.15em] font-sans font-medium transition-all duration-200 hover:bg-foreground/90">
            Get started
          </button>
        </Link>
      </main>
    </div>
  );
};

const Feature = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="flex items-start gap-3 text-left p-4 rounded-lg bg-card/70 backdrop-blur-sm">
    <div className="mt-0.5">{icon}</div>
    <div>
      <h3 className="font-sans font-semibold text-foreground text-sm">{title}</h3>
      <p className="text-xs text-muted-foreground mt-0.5 font-sans">{description}</p>
    </div>
  </div>
);

export default Landing;
