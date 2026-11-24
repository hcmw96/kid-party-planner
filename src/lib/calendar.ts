interface CalendarInput {
  title: string;
  date: string;
  start?: string | null;
  end?: string | null;
  location?: string | null;
  details?: string | null;
}

const compactTime = (value: string) => value.replace(":", "") + "00";

export function calendarHref({
  title,
  date,
  start,
  end,
  location,
  details,
}: CalendarInput): string {
  const day = date.replace(/-/g, "");
  const dates =
    start && end ? `${day}T${compactTime(start)}/${day}T${compactTime(end)}` : `${day}/${nextDay(day)}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates,
    ctz: "Europe/London",
  });
  if (location) params.set("location", location);
  if (details) params.set("details", details);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function nextDay(compact: string): string {
  const year = Number(compact.slice(0, 4));
  const month = Number(compact.slice(4, 6));
  const day = Number(compact.slice(6, 8));
  const date = new Date(year, month - 1, day + 1);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}${m}${d}`;
}
