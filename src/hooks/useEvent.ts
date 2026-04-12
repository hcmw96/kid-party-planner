import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      if (!eventId) throw new Error("No event ID");
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });
}
