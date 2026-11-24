import GuestInvite from "@/components/GuestInvite";
import type { Tables } from "@/integrations/supabase/types";
import { birthdayTitle, composeDescription, defaultPartyDate } from "@/lib/party";

const exampleEvent = (): Tables<"events"> => ({
  id: "example",
  organiser_id: "example",
  title: birthdayTitle("Sophie", "6"),
  child_name: "Sophie",
  date: defaultPartyDate(),
  location: "The garden, Hampstead",
  location_address: null,
  location_lat: null,
  location_lng: null,
  organiser_name: "Amelia",
  description: composeDescription({
    start: "14:00",
    end: "16:00",
    notes: "We'll be in the garden if the weather holds.",
  }),
  template: "classic",
  art_url: null,
  gift_enabled: true,
  gift_amount: 1000,
  gift_pot_total: 0,
  created_at: new Date().toISOString(),
});

const ExampleParty = () => (
  <div className="page-scrollable h-full bg-[#F9F7FC]">
    <GuestInvite event={exampleEvent()} demo />
  </div>
);

export default ExampleParty;
