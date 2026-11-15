import { APP_TIMEZONE, APP_UTC_OFFSET_MINUTES } from "@/lib/event-utils";

const dateFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const timeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: APP_TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

// Example: { date: "2026-11-15", time: "18:30" }, in the app timezone,
// ready for <input type="date"> and <input type="time">.
export function toInputParts(date: Date) {
  return { date: dateFormat.format(date), time: timeFormat.format(date) };
}

function offsetString() {
  const sign = APP_UTC_OFFSET_MINUTES >= 0 ? "+" : "-";
  const abs = Math.abs(APP_UTC_OFFSET_MINUTES);
  const hours = String(Math.floor(abs / 60)).padStart(2, "0");
  const minutes = String(abs % 60).padStart(2, "0");
  return `${sign}${hours}:${minutes}`;
}

// Turns "2026-11-15" + "18:30" (app timezone) into an ISO timestamp.
// Returns "" when either part is missing or invalid.
export function fromInputParts(date: string, time: string) {
  if (!date || !time) return "";
  const parsed = new Date(`${date}T${time}:00${offsetString()}`);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}
