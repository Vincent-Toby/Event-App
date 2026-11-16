import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  MapPin,
  Monitor,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react";
import { EventCard, type EventCardData } from "@/components/event-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  formatDuration,
  formatEventWhen,
  getSpotsLeft,
  type BookingState,
} from "@/lib/event-availability";
import type { EventDetail } from "@/lib/event-detail";
import {
  CATEGORY_LABELS,
  type EventCategoryValue,
} from "@/lib/event-categories";
import { isDateChanged } from "@/lib/date-changed";
import {
  formatEventDate,
  formatPrice,
  getEventBadge,
  type EventBadge,
} from "@/lib/event-utils";

const badgeStyles: Record<EventBadge["tone"], string> = {
  danger: "bg-primary text-primary-foreground",
  warning: "bg-brand-yellow text-foreground",
  info: "bg-brand-indigo text-white",
  success: "bg-brand-blue/30 text-foreground",
};

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function EventHero({ event }: { event: EventDetail }) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-3xl bg-muted sm:aspect-[21/9]">
      <Image
        src={event.imageUrl}
        alt={event.title}
        fill
        priority
        sizes="(min-width: 1280px) 1200px, 100vw"
        className="object-cover"
      />
    </div>
  );
}

export function EventStatusBanner({
  event,
  bookingState,
}: {
  event: EventDetail;
  bookingState: BookingState;
}) {
  let message: string | null = null;
  if (event.status === "DRAFT") {
    message = "This event is a draft. Only you can see it.";
  } else if (bookingState === "cancelled") {
    message = "This event has been cancelled.";
  } else if (bookingState === "ended") {
    message = "This event has ended.";
  }
  if (!message) return null;

  return (
    <div
      role="status"
      className="rounded-xl border border-brand-yellow bg-brand-yellow/20 px-4 py-3 text-sm font-semibold"
    >
      {message}
    </div>
  );
}

function InfoBlock({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex gap-4">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-blue/20 text-brand-indigo">
        <Icon className="size-6" />
      </span>
      <div className="space-y-1">
        <h2 className="text-xl">{title}</h2>
        {children}
      </div>
    </section>
  );
}

export function EventDetails({
  event,
  now,
}: {
  event: EventDetail;
  now: Date;
}) {
  const when = formatEventWhen(event.startsAt, event.endsAt);
  const duration = formatDuration(event.startsAt, event.endsAt);
  const left = getSpotsLeft(event.capacity, event.confirmedCount);
  const badge = getEventBadge(event, now);

  type Highlight = { icon: LucideIcon; text: string };
  const highlights: Highlight[] = [];
  if (duration) {
    highlights.push({ icon: Clock, text: `Duration: ${duration}` });
  }
  highlights.push({
    icon: event.isOnline ? Monitor : MapPin,
    text: event.isOnline ? "Online event" : "In person",
  });
  highlights.push({
    icon: Ticket,
    text:
      event.price === 0
        ? "Free to attend"
        : `Tickets: ${formatPrice(event.price, event.currency)}`,
  });
  if (left !== null) {
    highlights.push({
      icon: Users,
      text: left === 0 ? "Sold out" : `${left} ${left === 1 ? "spot" : "spots"} left`,
    });
  }

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {badge && (
            <span
              className={`rounded-md px-2 py-1 text-xs font-semibold ${badgeStyles[badge.tone]}`}
            >
              {badge.label}
            </span>
          )}
          <Link
            href={`/?category=${event.category}`}
            className="rounded-full bg-muted px-3 py-1 text-xs font-semibold transition-colors hover:bg-secondary"
          >
            {CATEGORY_LABELS[event.category]}
          </Link>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl">{event.title}</h1>
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarImage
              src={event.organizerImage ?? undefined}
              alt={event.organizerName}
            />
            <AvatarFallback>{initialsOf(event.organizerName)}</AvatarFallback>
          </Avatar>
          <p className="text-muted-foreground">
            By <span className="font-semibold text-foreground">{event.organizerName}</span>
          </p>
        </div>
      </header>

      <InfoBlock icon={CalendarDays} title="Date and time">
        <p className="font-semibold">{when.date}</p>
        <p className="text-muted-foreground">{when.time}</p>
        {event.previousStartsAt && isDateChanged(event, now) && (
          <p className="inline-block rounded-md bg-brand-yellow/30 px-2 py-1 text-sm font-semibold">
            Date changed. It was {formatEventDate(event.previousStartsAt, now)}.
          </p>
        )}
      </InfoBlock>

      <InfoBlock icon={event.isOnline ? Monitor : MapPin} title="Location">
        <p className="font-semibold">
          {event.isOnline ? "Online event" : event.venue}
        </p>
        {!event.isOnline && event.city && (
          <p className="text-muted-foreground">{event.city}</p>
        )}
      </InfoBlock>

      <section className="space-y-4">
        <h2 className="text-xl">Good to know</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {highlights.map((item) => (
            <li
              key={item.text}
              className="flex items-center gap-3 rounded-xl bg-muted/60 px-4 py-3 text-sm font-semibold"
            >
              <item.icon className="size-5 shrink-0 text-brand-indigo" />
              {item.text}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl">About this event</h2>
        <p className="whitespace-pre-line text-base leading-relaxed">
          {event.description}
        </p>
      </section>

      {event.tags.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag) => (
              <Link
                key={tag}
                href={`/?q=${encodeURIComponent(tag)}`}
                className="rounded-full bg-muted px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary"
              >
                {tag}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-xl">Organized by</h2>
        <div className="flex items-center gap-4 rounded-2xl bg-muted/50 p-5">
          <Avatar className="size-14">
            <AvatarImage
              src={event.organizerImage ?? undefined}
              alt={event.organizerName}
            />
            <AvatarFallback>{initialsOf(event.organizerName)}</AvatarFallback>
          </Avatar>
          <p className="text-lg font-bold">{event.organizerName}</p>
        </div>
      </section>
    </div>
  );
}

export function SimilarEvents({
  events,
  category,
  now,
}: {
  events: EventCardData[];
  category: EventCategoryValue;
  now: Date;
}) {
  if (events.length === 0) return null;

  return (
    <section className="space-y-6 border-t pt-10">
      <h2 className="text-2xl sm:text-3xl">
        More {CATEGORY_LABELS[category]} events
      </h2>
      <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {events.map((item) => (
          <EventCard key={item.slug} event={item} now={now} />
        ))}
      </div>
    </section>
  );
}
