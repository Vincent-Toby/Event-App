import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatEventDate, formatPrice } from "@/lib/event-utils";
import type { OrganizerEventItem } from "@/lib/organizer";

export type MyEventGroup = "upcoming" | "past" | "cancelled";

function statusChip(item: OrganizerEventItem, group: MyEventGroup) {
  if (group === "cancelled") {
    return { label: "Cancelled", className: "bg-primary/10 text-primary" };
  }
  if (group === "past") {
    return { label: "Ended", className: "bg-muted text-foreground" };
  }
  if (item.status === "DRAFT") {
    return { label: "Draft", className: "bg-brand-yellow text-foreground" };
  }
  return { label: "Live", className: "bg-brand-blue/30 text-foreground" };
}

export function MyEventRow({
  item,
  group,
  now,
}: {
  item: OrganizerEventItem;
  group: MyEventGroup;
  now: Date;
}) {
  const chip = statusChip(item, group);
  const location = item.isOnline
    ? "Online"
    : [item.venue, item.city].filter(Boolean).join(", ");
  const percent =
    item.capacity && item.capacity > 0
      ? Math.min(100, Math.round((item.confirmedCount / item.capacity) * 100))
      : null;

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
          <span
            className={`inline-block rounded-md px-2 py-1 text-xs font-semibold ${chip.className}`}
          >
            {chip.label}
          </span>
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
            <li className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4 shrink-0" />
              <span className="truncate">{location}</span>
            </li>
            <li className="flex items-center gap-2 text-muted-foreground">
              <Users className="size-4 shrink-0" />
              {item.capacity
                ? `${item.confirmedCount} of ${item.capacity} booked`
                : `${item.confirmedCount} booked`}
            </li>
          </ul>
          {percent !== null && (
            <div
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Spots booked"
              className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-brand-indigo"
                style={{ width: `${percent}%` }}
              />
            </div>
          )}
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
            View
          </Button>
          <Button
            nativeButton={false}
            render={<Link href={`/events/${item.slug}/manage`} />}
          >
            Manage
          </Button>
        </div>
      </div>
    </article>
  );
}
