import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, User } from "lucide-react";
import { CancelBookingButton } from "@/components/cancel-booking-button";
import { Button } from "@/components/ui/button";
import { isDateChanged } from "@/lib/date-changed";
import { formatEventDate, formatPrice } from "@/lib/event-utils";
import type { BookingListItem } from "@/lib/user-bookings";

export type BookingGroup = "upcoming" | "past" | "cancelled";

function statusChip(item: BookingListItem, group: BookingGroup) {
  if (group === "cancelled") {
    return {
      label:
        item.status === "CANCELLED" ? "You cancelled" : "Event cancelled",
      className: "bg-primary/10 text-primary",
    };
  }
  if (group === "past") {
    return { label: "Event ended", className: "bg-muted text-foreground" };
  }
  return { label: "Confirmed", className: "bg-brand-blue/30 text-foreground" };
}

export function BookingRow({
  item,
  group,
  now,
}: {
  item: BookingListItem;
  group: BookingGroup;
  now: Date;
}) {
  const chip = statusChip(item, group);
  const location = item.isOnline
    ? "Online"
    : [item.venue, item.city].filter(Boolean).join(", ");
  const canCancel =
    group === "upcoming" &&
    item.status === "CONFIRMED" &&
    item.startsAt.getTime() > now.getTime();
  // Only upcoming bookings need the warning that the date moved.
  const dateChanged =
    group === "upcoming" &&
    item.previousStartsAt !== null &&
    isDateChanged(
      { dateChangedAt: item.dateChangedAt, startsAt: item.startsAt },
      now,
    );

  return (
    <article className="grid gap-4 rounded-2xl border bg-card p-3 sm:grid-cols-[14rem_minmax(0,1fr)]">
      <Link
        href={`/events/${item.slug}`}
        aria-label={item.title}
        className="relative block aspect-video overflow-hidden rounded-xl bg-muted"
      >
        <Image
          src={item.imageUrl}
          alt=""
          fill
          sizes="(min-width: 640px) 224px, 100vw"
          className="object-cover"
        />
      </Link>

      <div className="min-w-0 space-y-3 sm:py-1">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-md px-2 py-1 text-xs font-semibold ${chip.className}`}
            >
              {chip.label}
            </span>
            {dateChanged && (
              <span className="rounded-md bg-brand-yellow px-2 py-1 text-xs font-semibold text-foreground">
                Date changed
              </span>
            )}
            <span className="text-xs font-semibold text-muted-foreground">
              Ref {item.ref}
            </span>
          </div>
          <h3 className="line-clamp-2 text-xl font-bold leading-snug">
            <Link href={`/events/${item.slug}`} className="hover:underline">
              {item.title}
            </Link>
          </h3>
          <ul className="space-y-1 text-sm">
            <li className="flex items-center gap-2 font-semibold">
              <CalendarDays className="size-4 shrink-0 text-primary" />
              {formatEventDate(item.startsAt, now)}
            </li>
            {dateChanged && item.previousStartsAt && (
              <li className="w-fit rounded-md bg-brand-yellow/30 px-2 py-1 font-semibold">
                Date changed. It was {formatEventDate(item.previousStartsAt, now)}.
              </li>
            )}
            <li className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4 shrink-0" />
              <span className="truncate">{location}</span>
            </li>
            <li className="flex items-center gap-2 text-muted-foreground">
              <User className="size-4 shrink-0" />
              <span className="truncate">By {item.organizerName}</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <p className="mr-auto text-lg font-extrabold">
            {formatPrice(item.price, item.currency)}
          </p>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/events/${item.slug}`} />}
          >
            View event
          </Button>
          {canCancel && <CancelBookingButton eventId={item.eventId} />}
        </div>
      </div>
    </article>
  );
}
