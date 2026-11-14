import { APP_TIMEZONE } from "@/lib/event-utils";

export type EventStatusValue = "DRAFT" | "PUBLISHED" | "CANCELLED";

export type BookingState = "open" | "sold_out" | "ended" | "cancelled";

// null means unlimited.
export function getSpotsLeft(
  capacity: number | null,
  confirmedCount: number,
): number | null {
  if (capacity === null) return null;
  return Math.max(capacity - confirmedCount, 0);
}

// One place that decides whether an event can be booked right now.
// The booking server action must reuse this.
export function getBookingState(
  event: {
    status: EventStatusValue;
    startsAt: Date;
    endsAt: Date | null;
    capacity: number | null;
    confirmedCount: number;
  },
  now: Date,
): BookingState {
  if (event.status === "CANCELLED") return "cancelled";
  const end = event.endsAt ?? event.startsAt;
  if (end.getTime() < now.getTime()) return "ended";
  if (event.capacity !== null && event.confirmedCount >= event.capacity) {
    return "sold_out";
  }
  return "open";
}

const longDate = new Intl.DateTimeFormat("en-US", {
  timeZone: APP_TIMEZONE,
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

const mediumDate = new Intl.DateTimeFormat("en-US", {
  timeZone: APP_TIMEZONE,
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
});

const timeFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: APP_TIMEZONE,
  hour: "numeric",
  minute: "2-digit",
});

const dayKey = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: APP_TIMEZONE }).format(date);

function timeZoneLabel(date: Date) {
  return (
    new Intl.DateTimeFormat("en-US", {
      timeZone: APP_TIMEZONE,
      timeZoneName: "short",
    })
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName")?.value ?? ""
  );
}

// Example: { date: "Saturday, November 14, 2026", time: "6:00 PM - 9:00 PM GMT+1" }
export function formatEventWhen(startsAt: Date, endsAt: Date | null) {
  const zone = timeZoneLabel(startsAt);

  if (!endsAt) {
    return {
      date: longDate.format(startsAt),
      time: `${timeFormat.format(startsAt)} ${zone}`.trim(),
    };
  }

  const time = `${timeFormat.format(startsAt)} - ${timeFormat.format(endsAt)} ${zone}`.trim();

  if (dayKey(startsAt) === dayKey(endsAt)) {
    return { date: longDate.format(startsAt), time };
  }

  return {
    date: `${mediumDate.format(startsAt)} - ${mediumDate.format(endsAt)}`,
    time,
  };
}

// Example: "3 hours", "1 hour 30 minutes", "2 days". Returns null if there is no end time.
export function formatDuration(startsAt: Date, endsAt: Date | null) {
  if (!endsAt) return null;
  const minutes = Math.round((endsAt.getTime() - startsAt.getTime()) / 60_000);
  if (minutes <= 0) return null;

  const days = Math.floor(minutes / 1440);
  if (days >= 1) return `${days} day${days === 1 ? "" : "s"}`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
  if (rest > 0) parts.push(`${rest} minute${rest === 1 ? "" : "s"}`);
  return parts.join(" ");
}
