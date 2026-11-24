export interface EventFormData {
  childName: string;
  date: string;
  location: string;
  locationAddress: string;
  locationLat: number | null;
  locationLng: number | null;
  description: string;
  notes: string;
  organiserName: string;
  template: string;
  artUrl: string | null;
  age: string;
  inspiration: string;
  partyType: string;
  giftEnabled: boolean;
  giftAmount: string;
  startTime: string;
  endTime: string;
}

export const emptyEventForm = (date: string): EventFormData => ({
  childName: "",
  date,
  location: "",
  locationAddress: "",
  locationLat: null,
  locationLng: null,
  description: "",
  notes: "",
  organiserName: "",
  template: "classic",
  artUrl: null,
  age: "",
  inspiration: "",
  partyType: "birthday",
  giftEnabled: false,
  giftAmount: "10",
  startTime: "14:00",
  endTime: "16:00",
});
