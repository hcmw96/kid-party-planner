import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PartyPopper, Clock, Gift, Users } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PartyPopper className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-foreground">PartyPal</span>
        </div>
        <Link to="/login">
          <Button variant="outline" size="sm">Log in</Button>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-lg mx-auto gap-8 pb-20">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground leading-tight">
            Organise a kids' party in <span className="text-primary">under 2 minutes</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            One link for RSVPs, dietary info, and a group gift. No app downloads, no fuss.
          </p>
        </div>

        <Link to="/login">
          <Button size="lg" className="text-lg px-8 py-6 rounded-2xl shadow-lg">
            Get Started — it's free 🎉
          </Button>
        </Link>

        {/* Features */}
        <div className="grid gap-6 w-full mt-8">
          <Feature
            icon={<Clock className="h-6 w-6 text-primary" />}
            title="2-minute setup"
            description="Create your party, share a link. Done."
          />
          <Feature
            icon={<Users className="h-6 w-6 text-secondary" />}
            title="Instant RSVPs"
            description="Guests respond in 2 taps — no login needed."
          />
          <Feature
            icon={<Gift className="h-6 w-6 text-accent" />}
            title="Group gift"
            description="Collect contributions so parents can chip in together."
          />
        </div>
      </main>
    </div>
  );
};

const Feature = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="flex items-start gap-4 text-left p-4 rounded-2xl bg-card border">
    <div className="mt-0.5">{icon}</div>
    <div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default Landing;
