// The app shows and filters times in this timezone.
// Africa/Lagos is UTC+1 with no daylight saving. If you change the timezone,
// update the offset too (it is only used by the Today / This weekend filters).
export const APP_TIMEZONE = "Africa/Lagos";
export const APP_UTC_OFFSET_MINUTES = 60;

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const OFFSET_MS = APP_UTC_OFFSET_MINUTES * MINUTE;

export function startOfLocalDay(now: Date) {
  const shifted = new Date(now.getTime() + OFFSET_MS);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - OFFSET_MS);
}

// From now until the end of today.
export function todayRange(now: Date) {
  return {
    start: now,
    end: new Date(startOfLocalDay(now).getTime() + DAY),
  };
}

// Friday 18:00 until Monday 00:00. If it is already the weekend, starts now.
export function weekendRange(now: Date) {
  const dayStart = startOfLocalDay(now).getTime();
  const dow = new Date(now.getTime() + OFFSET_MS).getUTCDay(); // 0 = Sunday
  const toFriday = dow === 0 ? -2 : dow === 6 ? -1 : 5 - dow;
  const fridayEvening = dayStart + toFriday * DAY + 18 * HOUR;
  return {
    start: new Date(Math.max(now.getTime(), fridayEvening)),
    end: new Date(dayStart + (toFriday + 3) * DAY),
  };
}

const dayKey = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: APP_TIMEZONE }).format(date);

const timeFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: APP_TIMEZONE,
  hour: "numeric",
  minute: "2-digit",
});

const dateFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: APP_TIMEZONE,
  weekday: "short",
  month: "short",
  day: "numeric",
});

// "Today • 6:00 PM", "Tomorrow • 6:00 PM", or "Fri, Nov 17 • 8:30 AM"
export function formatEventDate(date: Date, now: Date) {
  const key = dayKey(date);
  const time = timeFormat.format(date);
  if (key === dayKey(now)) return `Today • ${time}`;
  if (key === dayKey(new Date(now.getTime() + DAY))) return `Tomorrow • ${time}`;
  return `${dateFormat.format(date)} • ${time}`;
}

// Prices are stored in cents. 0 means free.
export function formatPrice(priceInCents: number, currency: string) {
  if (priceInCents === 0) return "Free";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    priceInCents / 100,
  );
}

export type EventBadge = {
  label: string;
  tone: "danger" | "warning" | "info" | "success";
};

export function getEventBadge(
  event: {
    capacity: number | null;
    confirmedCount: number;
    startsAt: Date;
    createdAt: Date;
  },
  now: Date,
): EventBadge | null {
  if (event.capacity !== null) {
    if (event.confirmedCount >= event.capacity) {
      return { label: "Sold out", tone: "danger" };
    }
    if (event.confirmedCount / event.capacity >= 0.8) {
      return { label: "Almost full", tone: "warning" };
    }
  }
  const untilStart = event.startsAt.getTime() - now.getTime();
  if (untilStart > 0 && untilStart <= 2 * DAY) {
    return { label: "Sales end soon", tone: "info" };
  }
  if (now.getTime() - event.createdAt.getTime() <= 3 * DAY) {
    return { label: "Just added", tone: "success" };
  }
  return null;
}
