const DAY = 24 * 60 * 60 * 1000;

// How long the "Date changed" label stays visible after a change.
export const DATE_CHANGED_DAYS = 14;

// True when the start time was moved recently and the event hasn't started yet.
export function isDateChanged(
  info: { dateChangedAt: Date | null; startsAt: Date },
  now: Date,
) {
  if (!info.dateChangedAt) return false;
  if (info.startsAt.getTime() <= now.getTime()) return false;
  return now.getTime() - info.dateChangedAt.getTime() <= DATE_CHANGED_DAYS * DAY;
}