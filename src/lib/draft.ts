import type { EventFormData } from "@/lib/eventForm";

const KEY = "partypal-draft";

export interface PartyDraft {
  form: EventFormData;
  step: number;
}

export function loadDraft(): PartyDraft | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PartyDraft;
    if (!parsed?.form || typeof parsed.step !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveDraft(draft: PartyDraft) {
  localStorage.setItem(KEY, JSON.stringify(draft));
}

export function clearDraft() {
  localStorage.removeItem(KEY);
}
