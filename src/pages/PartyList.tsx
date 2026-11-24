import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";
import NativeNavBar from "@/components/native/NativeNavBar";
import { haptic, showActionSheet, isDespia } from "@/lib/despia";
import balloonHero from "@/assets/balloon-hero.png";
import { countdownLabel, formatPartyDate } from "@/lib/party";
import { getTemplate } from "@/lib/templates";

const PartyList = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: events = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ["events", user?.id],
    queryFn: async () => {
      const { data, error: queryError } = await supabase
        .from("events")
        .select("*")
        .eq("organiser_id", user!.id)
        .order("created_at", { ascending: false });
      if (queryError) throw queryError;
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
      <div>
        <NativeNavBar largeTitle="Parties" />
        <div className="space-y-3 px-5 pt-4">
          <div className="h-20 animate-pulse rounded-[20px] bg-white" />
          <div className="h-20 animate-pulse rounded-[20px] bg-white" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <NativeNavBar largeTitle="Parties" />
        <div className="space-y-4 px-6 py-16 text-center">
          <p className="text-[15px] text-[#71677F]">Couldn't load your parties.</p>
          <p className="text-[13px] text-[#71677F]">{error instanceof Error ? error.message : "Something went wrong"}</p>
          <button type="button" className="ink-button" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <NativeNavBar
        largeTitle="Parties"
        trailing={
          <button type="button" onClick={() => void handleMore()} className="native-btn-plain p-2" aria-label="Account">
            <LogOut className="h-5 w-5" strokeWidth={1.75} />
          </button>
        }
      />

      <div className="mx-auto max-w-lg px-5 pt-2">
        {events.length === 0 ? (
          <div className="px-2 py-12 text-center">
            <img src={balloonHero} alt="" className="mx-auto h-28 w-28 object-contain motion-safe:animate-float" />
            <p className="mt-4 text-[1.4rem] font-extrabold tracking-[-0.04em] text-[#282035]">Ready when you are</p>
            <p className="mt-2 text-[15px] leading-relaxed text-[#71677F]">
              Your first invitation takes a couple of minutes.
            </p>
            <button type="button" className="ink-button mt-6" onClick={() => navigate("/create")}>
              Create a party
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const theme = getTemplate(event.template || "classic");
              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={async () => {
                    await haptic("light");
                    navigate(`/dashboard/${event.id}`);
                  }}
                  className="flex w-full items-center gap-4 rounded-[22px] bg-white px-4 py-4 text-left shadow-[0_8px_24px_rgba(40,32,53,0.04)]"
                >
                  <span className="h-12 w-1.5 shrink-0 rounded-full" style={{ background: theme.palette.accent }} />
                  <span className="min-w-0">
                    <span className="block truncate text-[16px] font-extrabold tracking-[-0.03em] text-[#282035]">
                      {event.child_name}'s birthday
                    </span>
                    <span className="mt-0.5 block truncate text-[13px] text-[#71677F]">
                      {countdownLabel(event.date)} · {formatPartyDate(event.date)}
                    </span>
                  </span>
                </button>
              );
            })}
            <button type="button" className="ink-button mt-4" onClick={() => navigate("/create")}>
              New party
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartyList;
