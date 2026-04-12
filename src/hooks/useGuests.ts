import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useGuests(eventId: string | undefined) {
  return useQuery({
    queryKey: ["guests", eventId],
    queryFn: async () => {
      if (!eventId) throw new Error("No event ID");
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });
}
