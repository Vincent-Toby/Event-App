import Link from "next/link";
import { BookingControls } from "@/components/booking-controls";
import { Button } from "@/components/ui/button";
import type { BookingState } from "@/lib/event-availability";

type TicketCtaProps = {
  eventId: string;
  bookingState: BookingState;
  bookingStatus: "CONFIRMED" | "CANCELLED" | null;
  isLoggedIn: boolean;
  isOrganizer: boolean;
  isPaid: boolean;
  canCancel: boolean;
  compact?: boolean;
  className?: string;
};

export function TicketCta({
  eventId,
  bookingState,
  bookingStatus,
  isLoggedIn,
  isOrganizer,
  isPaid,
  canCancel,
  compact = false,
  className,
}: TicketCtaProps) {
  if (bookingState === "cancelled") {
    return (
      <Button disabled className={className}>
        Event cancelled
      </Button>
    );
  }

  const isBooked = isLoggedIn && bookingStatus === "CONFIRMED";

  if (isBooked && bookingState !== "ended") {
    return (
      <BookingControls
        eventId={eventId}
        isBooked
        canCancel={canCancel}
        compact={compact}
        className={className}
      />
    );
  }

  if (bookingState === "ended") {
    return (
      <Button disabled className={className}>
        Event ended
      </Button>
    );
  }

  if (bookingState === "sold_out") {
    return (
      <Button disabled className={className}>
        Sold out
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

  if (isPaid) {
    return (
      <Button disabled className={className}>
        Payments coming soon
      </Button>
    );
  }

  return (
    <BookingControls
      eventId={eventId}
      isBooked={false}
      canCancel={canCancel}
      compact={compact}
      className={className}
    />
  );
}
