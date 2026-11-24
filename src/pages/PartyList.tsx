import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut } from "lucide-react";
import NativeNavBar from "@/components/native/NativeNavBar";
import { NativeList, NativeListRow } from "@/components/native/NativeList";
import NativeButton from "@/components/native/NativeButton";
import { haptic, showActionSheet, isDespia } from "@/lib/despia";

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

  const handleMore = async () => {
    await haptic("light");
    if (isDespia) {
      const value = await showActionSheet({
        title: "Account",
        items: [
          {
            label: "Sign out",
            value: "signout",
            iconIos: "rectangle.portrait.and.arrow.right",
            iconAndroid: "logout",
            destructive: true,
          },
        ],
      });
      if (value === "signout") {
        await signOut();
        navigate("/");
      }
      return;
    }
    await signOut();
    navigate("/");
  };

  if (authLoading || (user && isLoading)) {
    return (
      <div className="animate-fade-in">
        <NativeNavBar largeTitle="Parties" />
        <div className="px-4 pt-4 space-y-3">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="animate-fade-in">
        <NativeNavBar largeTitle="Parties" />
        <div className="px-6 py-16 text-center space-y-4">
          <p className="text-muted-foreground text-sm font-sans">
            Couldn’t load your parties.
          </p>
          <p className="text-xs text-muted-foreground/80 font-sans">
            {error instanceof Error ? error.message : "Something went wrong"}
          </p>
          <NativeButton onClick={() => refetch()}>Try again</NativeButton>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-6">
      <NativeNavBar
        largeTitle="Parties"
        trailing={
          <button
            type="button"
            onClick={handleMore}
            className="native-btn-plain p-2"
            aria-label="Account"
          >
            <LogOut className="h-5 w-5" strokeWidth={1.75} />
          </button>
        }
      />

      <div className="pt-4 space-y-6">
        {events.length === 0 ? (
          <div className="px-6 py-16 text-center space-y-4">
            <p className="text-muted-foreground text-[15px] font-sans">
              No parties yet.
            </p>
            <NativeButton
              onClick={() => navigate("/create")}
              hapticOnPress="heavy"
            >
              Create your first party
            </NativeButton>
          </div>
        ) : (
          <NativeList>
            {events.map((event) => {
              const dateLabel = new Date(event.date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              return (
                <NativeListRow
                  key={event.id}
                  title={`${event.child_name}'s Party`}
                  subtitle={`${dateLabel} · ${event.location}`}
                  onClick={async () => {
                    await haptic("light");
                    navigate(`/dashboard/${event.id}`);
                  }}
                />
              );
            })}
          </NativeList>
        )}

        {events.length > 0 && (
          <div className="px-4">
            <NativeButton
              onClick={() => navigate("/create")}
              hapticOnPress="heavy"
            >
              New party
            </NativeButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartyList;
