import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, MapPin, Plus, LogOut } from "lucide-react";

const PartyList = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: events = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ["events", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("organiser_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    retry: 1,
  });

  if (!authLoading && !user) {
    navigate("/login", { replace: true });
    return null;
  }

  if (authLoading || (user && isLoading)) {
    return (
      <div className="min-h-screen px-6 py-10 max-w-lg mx-auto space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full page-scrollable px-6 py-10 max-w-lg mx-auto space-y-6 animate-fade-in">
        <span className="text-sm font-serif font-semibold tracking-[0.3em] uppercase text-foreground">
          PartyPal
        </span>
        <div className="text-center py-16 space-y-4">
          <p className="text-muted-foreground text-sm">
            Couldn’t load your parties.
          </p>
          <p className="text-xs text-muted-foreground/80 font-sans">
            {error instanceof Error ? error.message : "Something went wrong"}
          </p>
          <Button onClick={() => refetch()}>Try again</Button>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="h-full page-scrollable px-6 py-10 max-w-lg mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <span className="text-sm font-serif font-semibold tracking-[0.3em] uppercase text-foreground">
          PartyPal
        </span>
        <Button variant="ghost" size="icon" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" strokeWidth={1.5} />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-serif italic text-foreground">Your parties</h1>
          <Button size="sm" onClick={() => navigate("/create")} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            New party
          </Button>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-muted-foreground text-sm">No parties yet.</p>
            <Button onClick={() => navigate("/create")}>Create your first party</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => navigate(`/dashboard/${event.id}`)}
                className="w-full text-left p-4 rounded-lg border border-border bg-card hover:bg-accent/40 transition-colors"
              >
                <p className="font-serif font-semibold text-foreground">{event.child_name}'s Party</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" strokeWidth={1.5} />
                    {new Date(event.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" strokeWidth={1.5} />
                    {event.location}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PartyList;
