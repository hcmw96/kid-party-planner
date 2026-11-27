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
  /** "paint" or a template id. Omitted on older drafts. */
  invitationStyle?: string;
  artUrl: string | null;
  age: string;
  inspiration: string;
  partyType: string;
  giftEnabled: boolean;
  giftAmount: string;
  startTime: string;
  endTime: string;
  /** A painted card for a shelf style, kept only while the details still match. */
  personalArt?: Record<string, { key: string; url: string }>;
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
  personalArt: {},
});

const letteredStyles = new Set(["ticket", "poster", "midnight"]);

export const isLetteredStyle = (id: string) => letteredStyles.has(id);

/** Details that are lettered onto a painted card. */
export function artKey(
  form: { childName: string; age: string; date: string; startTime: string; endTime: string; location: string },
  style: string,
): string {
  return [style, form.childName.trim(), form.age.trim(), form.date, form.startTime, form.endTime, form.location.trim()].join("\u001f");
}

export function personalArtUrl(form: EventFormData, style: string): string | null {
  const hit = form.personalArt?.[style];
  if (!hit?.url || hit.key !== artKey(form, style)) return null;
  return hit.url;
}

import { isShelfStyle } from "@/lib/stationery";

/** The shelf choice: a stationery preset, or a painting. */
export function invitationChoice(form: { invitationStyle?: string; template: string; artUrl: string | null }): string {
  if (form.invitationStyle) return form.invitationStyle;
  if (form.template === "garden") return "garden";
  if (form.artUrl) return "paint";
  return form.template || "classic";
}

/** A choice the shelf can actually show. Older themes fall back to The Garden. */
export function shelfChoice(form: { invitationStyle?: string; template: string; artUrl: string | null }): string {
  const choice = invitationChoice(form);
  if (isShelfStyle(choice)) return choice;
  return "garden";
}
