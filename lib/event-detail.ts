import { prisma } from "@/lib/prisma";
import type { EventStatusValue } from "@/lib/event-availability";
import type { EventCategoryValue } from "@/lib/event-categories";
import type { EventCardData } from "@/components/event-card";

export type EventDetail = {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  category: EventCategoryValue;
  venue: string;
  city: string | null;
  isOnline: boolean;
  tags: string[];
  startsAt: Date;
  endsAt: Date | null;
  capacity: number | null;
  price: number;
  currency: string;
  status: EventStatusValue;
  createdAt: Date;
  dateChangedAt: Date | null;
  previousStartsAt: Date | null;
  organizerId: string;
  organizerName: string;
  organizerImage: string | null;
  confirmedCount: number;
};

// Slugs we generate are lowercase letters, digits and dashes.
const SLUG_PATTERN = /^[a-z0-9-]{1,100}$/;

export async function getEventBySlug(slug: string): Promise<EventDetail | null> {
  if (!SLUG_PATTERN.test(slug)) return null;

  const event = await prisma.event.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      imageUrl: true,
      category: true,
      venue: true,
      city: true,
      isOnline: true,
      tags: true,
      startsAt: true,
      endsAt: true,
      capacity: true,
      price: true,
      currency: true,
      status: true,
      createdAt: true,
      dateChangedAt: true,
      previousStartsAt: true,
      organizerId: true,
      // Never select the organizer's email here.
      organizer: { select: { name: true, image: true } },
      _count: { select: { bookings: { where: { status: "CONFIRMED" } } } },
    },
  });

  if (!event) return null;

  const { organizer, _count, ...rest } = event;
  return {
    ...rest,
    organizerName: organizer.name,
    organizerImage: organizer.image,
    confirmedCount: _count.bookings,
  };
}

// Up to 4 upcoming events in the same category, excluding this one.
export async function getSimilarEvents(
  event: { id: string; category: EventCategoryValue },
  now: Date,
): Promise<EventCardData[]> {
  const events = await prisma.event.findMany({
    where: {
      id: { not: event.id },
      status: "PUBLISHED",
      category: event.category,
      OR: [{ endsAt: { gte: now } }, { endsAt: null, startsAt: { gte: now } }],
    },
    orderBy: { startsAt: "asc" },
    take: 4,
    select: {
      slug: true,
      title: true,
      imageUrl: true,
      venue: true,
      isOnline: true,
      startsAt: true,
      createdAt: true,
      dateChangedAt: true,
      price: true,
      currency: true,
      capacity: true,
      _count: { select: { bookings: { where: { status: "CONFIRMED" } } } },
    },
  });

  return events.map(({ _count, ...item }) => ({
    ...item,
    confirmedCount: _count.bookings,
  }));
}
