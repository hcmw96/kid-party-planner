import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, Gift, Users } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col animate-fade-in">
      <header className="px-6 py-5 flex items-center justify-between">
        <span className="text-lg font-semibold text-foreground font-serif tracking-wide">PartyPal</span>
        <Link to="/login">
          <Button variant="ghost" size="sm">Log in</Button>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-md mx-auto gap-10 pb-24">
        <div className="space-y-5">
          <h1 className="text-4xl font-serif font-semibold tracking-tight text-foreground leading-[1.15]">
            The easiest way to organise a children's party
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            One link for RSVPs, dietary info, and a group gift. No app downloads, no fuss.
          </p>
        </div>

        <Link to="/login" className="w-full">
          <Button size="lg" className="w-full text-base">
            Get started — it's free
          </Button>
        </Link>

        <div className="grid gap-5 w-full mt-4">
          <Feature
            icon={<Clock className="h-5 w-5 text-primary" strokeWidth={1.5} />}
            title="Two-minute setup"
            description="Create your party, share a link. Done."
          />
          <Feature
            icon={<Users className="h-5 w-5 text-secondary" strokeWidth={1.5} />}
            title="Instant RSVPs"
            description="Guests respond in two taps — no login needed."
          />
          <Feature
            icon={<Gift className="h-5 w-5 text-primary" strokeWidth={1.5} />}
            title="Group gift"
            description="Collect contributions so parents can chip in together."
          />
        </div>
      </main>
    </div>
  );
};

const Feature = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="flex items-start gap-4 text-left p-5 rounded-lg bg-card shadow-sm">
    <div className="mt-0.5">{icon}</div>
    <div>
      <h3 className="font-semibold text-foreground text-sm">{title}</h3>
      <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
    </div>
  </div>
);

export default Landing;
