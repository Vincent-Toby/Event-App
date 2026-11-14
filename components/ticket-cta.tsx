import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { BookingState } from "@/lib/event-availability";

const DISABLED_LABELS: Record<Exclude<BookingState, "open">, string> = {
  cancelled: "Event cancelled",
  ended: "Event ended",
  sold_out: "Sold out",
};

type TicketCtaProps = {
  bookingState: BookingState;
  isLoggedIn: boolean;
  isOrganizer: boolean;
  className?: string;
};

export function TicketCta({
  bookingState,
  isLoggedIn,
  isOrganizer,
  className,
}: TicketCtaProps) {
  if (bookingState !== "open") {
    return (
      <Button disabled className={className}>
        {DISABLED_LABELS[bookingState]}
      </Button>
    );
  }

  if (isOrganizer) {
    return (
      <Button variant="outline" disabled className={className}>
        This is your event
      </Button>
    );
  }

  if (!isLoggedIn) {
    return (
      <Button
        className={className}
        nativeButton={false}
        render={<Link href="/sign-in" />}
      >
        Sign in to book
      </Button>
    );
  }

  // The booking step replaces this placeholder button.
  return (
    <Button disabled className={className}>
      Book now
    </Button>
  );
}
