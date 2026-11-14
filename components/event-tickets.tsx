import { TicketCta } from "@/components/ticket-cta";
import { getSpotsLeft, type BookingState } from "@/lib/event-availability";
import type { EventDetail } from "@/lib/event-detail";
import { formatEventDate, formatPrice } from "@/lib/event-utils";
import { cn } from "@/lib/utils";

type TicketProps = {
  event: EventDetail;
  now: Date;
  bookingState: BookingState;
  isLoggedIn: boolean;
  isOrganizer: boolean;
};

function SpotsNote({ left }: { left: number | null }) {
  if (left === null || left === 0) return null;
  const low = left <= 10;
  return (
    <span
      className={cn(
        "inline-block rounded-md px-2 py-1 text-xs font-semibold text-foreground",
        low ? "bg-brand-yellow" : "bg-brand-blue/20",
      )}
    >
      {low
        ? `Only ${left} ${left === 1 ? "spot" : "spots"} left`
        : `${left} spots left`}
    </span>
  );
}

// Desktop: the sticky card in the right column.
export function TicketCard({
  event,
  now,
  bookingState,
  isLoggedIn,
  isOrganizer,
}: TicketProps) {
  const left = getSpotsLeft(event.capacity, event.confirmedCount);

  return (
    <div className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-muted-foreground">
          General admission
        </p>
        <p className="text-3xl font-extrabold">
          {formatPrice(event.price, event.currency)}
        </p>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold">
          {formatEventDate(event.startsAt, now)}
        </p>
        <SpotsNote left={left} />
      </div>
      <TicketCta
        bookingState={bookingState}
        isLoggedIn={isLoggedIn}
        isOrganizer={isOrganizer}
        className="h-12 w-full text-base font-semibold"
      />
    </div>
  );
}

// Mobile: the fixed bar at the bottom of the screen.
export function TicketBar({
  event,
  now,
  bookingState,
  isLoggedIn,
  isOrganizer,
}: TicketProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="min-w-0">
          <p className="text-xl font-extrabold leading-tight">
            {formatPrice(event.price, event.currency)}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {formatEventDate(event.startsAt, now)}
          </p>
        </div>
        <TicketCta
          bookingState={bookingState}
          isLoggedIn={isLoggedIn}
          isOrganizer={isOrganizer}
          className="h-12 shrink-0 px-6 text-base font-semibold"
        />
      </div>
    </div>
  );
}
