import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, User } from "lucide-react";
import type { EventCardData } from "@/components/event-card";
import { getSpotsLeft } from "@/lib/event-availability";
import {
  formatEventDate,
  formatPrice,
  getEventBadge,
  type EventBadge,
} from "@/lib/event-utils";

export type EventRowData = EventCardData & {
  organizerName: string;
  city: string | null;
  summary: string;
};

const badgeStyles: Record<EventBadge["tone"], string> = {
  danger: "bg-primary text-primary-foreground",
  warning: "bg-brand-yellow text-foreground",
  info: "bg-brand-indigo text-white",
  success: "bg-brand-blue/30 text-foreground",
};

export function EventRow({ event, now }: { event: EventRowData; now: Date }) {
  const badge = getEventBadge(event, now);
  const left = getSpotsLeft(event.capacity, event.confirmedCount);
  const location = event.isOnline
    ? "Online"
    : [event.venue, event.city].filter(Boolean).join(", ");
  const isFree = event.price === 0;

  return (
    <article className="group relative grid gap-4 rounded-2xl border bg-card p-3 transition-shadow focus-within:ring-2 focus-within:ring-ring hover:shadow-md sm:grid-cols-[14rem_minmax(0,1fr)] md:grid-cols-[16rem_minmax(0,1fr)_9rem]">
      <Link
        href={`/events/${event.slug}`}
        aria-label={event.title}
        className="absolute inset-0 z-10 rounded-2xl outline-none"
      />

      <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
        <Image
          src={event.imageUrl}
          alt=""
          fill
          sizes="(min-width: 768px) 256px, (min-width: 640px) 224px, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="min-w-0 space-y-2 sm:py-1">
        {badge && (
          <span
            className={`inline-block rounded-md px-2 py-1 text-xs font-semibold ${badgeStyles[badge.tone]}`}
          >
            {badge.label}
          </span>
        )}
        <h3 className="line-clamp-2 text-xl font-bold leading-snug">
          {event.title}
        </h3>
        <ul className="space-y-1 text-sm">
          <li className="flex items-center gap-2 font-semibold">
            <CalendarDays className="size-4 shrink-0 text-primary" />
            {formatEventDate(event.startsAt, now)}
          </li>
          <li className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-4 shrink-0" />
            <span className="truncate">{location}</span>
          </li>
          <li className="flex items-center gap-2 text-muted-foreground">
            <User className="size-4 shrink-0" />
            <span className="truncate">By {event.organizerName}</span>
          </li>
        </ul>
        {event.summary && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {event.summary}
          </p>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2 border-t pt-3 sm:col-span-2 md:col-span-1 md:flex-col md:items-start md:justify-start md:border-l md:border-t-0 md:pl-4 md:pt-1">
        <div>
          {!isFree && (
            <p className="text-xs font-semibold text-muted-foreground">From</p>
          )}
          <p className="text-xl font-extrabold">
            {isFree ? "Free" : formatPrice(event.price, event.currency)}
          </p>
        </div>
        {left !== null && left > 0 && left <= 10 && (
          <span className="rounded-md bg-brand-yellow px-2 py-1 text-xs font-semibold text-foreground md:mt-2">
            Only {left} left
          </span>
        )}
      </div>
    </article>
  );
}
