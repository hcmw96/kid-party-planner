import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useIsAdmin() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["is_admin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      if (error) return false;
      return data?.is_admin ?? false;
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin_stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_admin_stats");
      if (error) throw error;
      return data as {
        total_hosts: number;
        total_events: number;
        total_guests: number;
        attending_guests: number;
        total_donations: number;
        events_this_week: number;
        signups_this_week: number;
      };
    },
    refetchInterval: 30_000,
  });
}

export function useAdminEvents() {
  return useQuery({
    queryKey: ["admin_events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          id,
          child_name,
          date,
          location,
          created_at,
          gift_enabled,
          gift_pot_total,
          organiser_id
        `)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });
}

export function useAdminHosts() {
  return useQuery({
    queryKey: ["admin_hosts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, is_admin, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAdminDonations() {
  return useQuery({
    queryKey: ["admin_donations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donations")
        .select(`
          id,
          amount_pence,
          currency,
          donor_name,
          donor_email,
          created_at,
          event_id,
          events:event_id ( child_name )
        `)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });
}
