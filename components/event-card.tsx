import Image from "next/image";
import Link from "next/link";
import {
  formatEventDate,
  formatPrice,
  getEventBadge,
  type EventBadge,
} from "@/lib/event-utils";

export type EventCardData = {
  slug: string;
  title: string;
  imageUrl: string;
  venue: string;
  isOnline: boolean;
  startsAt: Date;
  createdAt: Date;
  price: number;
  currency: string;
  capacity: number | null;
  confirmedCount: number;
};

const badgeStyles: Record<EventBadge["tone"], string> = {
  danger: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  warning: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
  info: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200",
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
};

export function EventCard({ event, now }: { event: EventCardData; now: Date }) {
  const badge = getEventBadge(event, now);

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group block space-y-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
        <Image
          src={event.imageUrl}
          alt={event.title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="space-y-1">
        {badge && (
          <span
            className={`inline-block rounded-md px-2 py-1 text-xs font-medium ${badgeStyles[badge.tone]}`}
          >
            {badge.label}
          </span>
        )}
        <h3 className="line-clamp-2 text-lg font-semibold leading-snug">
          {event.title}
        </h3>
        <p className="text-sm font-medium">
          {formatEventDate(event.startsAt, now)}
        </p>
        <p className="truncate text-sm text-muted-foreground">
          {event.isOnline ? "Online" : event.venue}
        </p>
        <p className="text-sm font-semibold">
          {formatPrice(event.price, event.currency)}
        </p>
      </div>
    </Link>
  );
}
