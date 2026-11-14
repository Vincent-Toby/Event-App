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
  danger: "bg-primary text-primary-foreground",
  warning: "bg-brand-yellow text-foreground",
  info: "bg-brand-indigo text-white",
  success: "bg-brand-blue/30 text-foreground",
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
            className={`inline-block rounded-md px-2 py-1 text-xs font-semibold ${badgeStyles[badge.tone]}`}
          >
            {badge.label}
          </span>
        )}
        <h3 className="line-clamp-2 text-lg font-bold leading-snug">
          {event.title}
        </h3>
        <p className="text-sm font-semibold">
          {formatEventDate(event.startsAt, now)}
        </p>
        <p className="truncate text-sm text-muted-foreground">
          {event.isOnline ? "Online" : event.venue}
        </p>
        <p className="text-sm font-bold">
          {formatPrice(event.price, event.currency)}
        </p>
      </div>
    </Link>
  );
}
