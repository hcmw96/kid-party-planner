export function ordinal(n: number): string {
  const v = n % 100;
  const suffixes = ["th", "st", "nd", "rd"];
  const suffix = suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
  return `${n}${suffix}`;
}

export function birthdayTitle(name: string, age: string): string {
  const trimmed = name.trim();
  const years = Number.parseInt(age, 10);
  if (!trimmed) return "Birthday party";
  if (!Number.isFinite(years) || years < 1 || years > 18) return `${trimmed}'s party`;
  return `${trimmed}'s ${ordinal(years)} birthday`;
}

export function ageFromTitle(title: string | null | undefined): number | null {
  if (!title) return null;
  const match = title.match(/(\d+)(?:st|nd|rd|th) birthday/i);
  if (!match) return null;
  const years = Number.parseInt(match[1], 10);
  return years >= 1 && years <= 18 ? years : null;
}

export function formatTime(value: string): string {
  const [hourText, minuteText] = value.split(":");
  const hour = Number.parseInt(hourText, 10);
  const minute = Number.parseInt(minuteText ?? "0", 10);
  if (!Number.isFinite(hour)) return value;
  const hour12 = hour % 12 || 12;
  const suffix = hour < 12 ? "am" : "pm";
  if (!minute) return `${hour12}${suffix}`;
  return `${hour12}:${String(minute).padStart(2, "0")}${suffix}`;
}

export function timePhrase(start: string, end: string): string {
  if (!start || !end) return "";
  return `From ${formatTime(start)} to ${formatTime(end)}`;
}

export function composeDescription(input: {
  wording?: string;
  notes?: string;
  start?: string;
  end?: string;
}): string {
  const time = input.start && input.end ? timePhrase(input.start, input.end) : "";
  return [time, input.notes?.trim() ?? "", input.wording?.trim() ?? ""]
    .filter(Boolean)
    .join("\n\n");
}

const TIME_LINE = /^From .+ to .+$/;

export function splitPartyNotes(description: string | null | undefined): {
  timeLabel: string | null;
  body: string;
} {
  if (!description?.trim()) return { timeLabel: null, body: "" };
  const [first, ...rest] = description.split(/\n\n/);
  if (first && TIME_LINE.test(first.trim())) {
    const timeLabel = first
      .trim()
      .replace(/^From\s+/i, "")
      .replace(/\s+to\s+/i, " – ");
    return { timeLabel, body: rest.join("\n\n").trim() };
  }
  return { timeLabel: null, body: description.trim() };
}

export function defaultPartyDate(from = new Date()): string {
  const date = new Date(from);
  date.setDate(date.getDate() + 14);
  const daysUntilSaturday = (6 - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + daysUntilSaturday);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function formatUkDate(date: string): string {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatPartyDate(date: string): string {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function countdownLabel(date: string, today = new Date()): string {
  const party = new Date(`${date}T12:00:00`);
  if (Number.isNaN(party.getTime())) return "";
  const start = new Date(today);
  start.setHours(12, 0, 0, 0);
  const days = Math.round((party.getTime() - start.getTime()) / 86_400_000);
  if (days > 1) return `${days} days to go`;
  if (days === 1) return "Tomorrow";
  if (days === 0) return "Today";
  if (days === -1) return "Yesterday";
  return "What a party";
}
