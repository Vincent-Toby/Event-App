import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { BrowseFilters } from "@/lib/browse-params";
import { todayRange, weekendRange } from "@/lib/event-utils";
import type { EventCardData } from "@/components/event-card";

const MAX_RESULTS = 48;

export async function getBrowseEvents(
  filters: BrowseFilters,
  now: Date,
): Promise<EventCardData[]> {
  const and: Prisma.EventWhereInput[] = [
    { status: "PUBLISHED" },
    // Hide events that have already finished.
    {
      OR: [{ endsAt: { gte: now } }, { endsAt: null, startsAt: { gte: now } }],
    },
  ];

  if (filters.category) {
    and.push({ category: filters.category });
  }

  if (filters.tab === "today") {
    const { start, end } = todayRange(now);
    and.push({ startsAt: { gte: start, lt: end } });
  } else if (filters.tab === "weekend") {
    const { start, end } = weekendRange(now);
    and.push({ startsAt: { gte: start, lt: end } });
  }

  if (filters.q) {
    and.push({
      OR: [
        { title: { contains: filters.q, mode: "insensitive" } },
        { description: { contains: filters.q, mode: "insensitive" } },
        { venue: { contains: filters.q, mode: "insensitive" } },
        { city: { contains: filters.q, mode: "insensitive" } },
        { tags: { has: filters.q.toLowerCase() } },
      ],
    });
  }

  const events = await prisma.event.findMany({
    where: { AND: and },
    orderBy: { startsAt: "asc" },
    take: MAX_RESULTS,
    select: {
      slug: true,
      title: true,
      imageUrl: true,
      venue: true,
      isOnline: true,
      startsAt: true,
      createdAt: true,
      price: true,
      currency: true,
      capacity: true,
      _count: { select: { bookings: { where: { status: "CONFIRMED" } } } },
    },
  });

  return events.map(({ _count, ...event }) => ({
    ...event,
    confirmedCount: _count.bookings,
  }));
}
