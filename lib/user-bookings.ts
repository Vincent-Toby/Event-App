import { prisma } from "@/lib/prisma";
import type { EventStatusValue } from "@/lib/event-availability";

export type BookingListItem = {
  bookingId: string;
  // Short code shown to the person, for check-in later.
  ref: string;
  status: "CONFIRMED" | "CANCELLED";
  eventId: string;
  slug: string;
  title: string;
  imageUrl: string;
  venue: string;
  city: string | null;
  isOnline: boolean;
  startsAt: Date;
  endsAt: Date | null;
  price: number;
  currency: string;
  eventStatus: EventStatusValue;
  organizerName: string;
};

export type BookingGroups = {
  upcoming: BookingListItem[];
  past: BookingListItem[];
  cancelled: BookingListItem[];
};

const MAX_BOOKINGS = 200;

export async function getUserBookings(
  userId: string,
  now: Date,
): Promise<BookingGroups> {
  const rows = await prisma.booking.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: MAX_BOOKINGS,
    select: {
      id: true,
      status: true,
      event: {
        select: {
          id: true,
          slug: true,
          title: true,
          imageUrl: true,
          venue: true,
          city: true,
          isOnline: true,
          startsAt: true,
          endsAt: true,
          price: true,
          currency: true,
          status: true,
          // Never select the organizer's email here.
          organizer: { select: { name: true } },
        },
      },
    },
  });

  const groups: BookingGroups = { upcoming: [], past: [], cancelled: [] };

  for (const row of rows) {
    const { event } = row;
    const item: BookingListItem = {
      bookingId: row.id,
      ref: row.id.slice(-8).toUpperCase(),
      status: row.status,
      eventId: event.id,
      slug: event.slug,
      title: event.title,
      imageUrl: event.imageUrl,
      venue: event.venue,
      city: event.city,
      isOnline: event.isOnline,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      price: event.price,
      currency: event.currency,
      eventStatus: event.status,
      organizerName: event.organizer.name,
    };

    const end = event.endsAt ?? event.startsAt;
    if (row.status === "CANCELLED" || event.status === "CANCELLED") {
      groups.cancelled.push(item);
    } else if (end.getTime() < now.getTime()) {
      groups.past.push(item);
    } else {
      groups.upcoming.push(item);
    }
  }

  const soonestFirst = (a: BookingListItem, b: BookingListItem) =>
    a.startsAt.getTime() - b.startsAt.getTime();
  const latestFirst = (a: BookingListItem, b: BookingListItem) =>
    b.startsAt.getTime() - a.startsAt.getTime();

  groups.upcoming.sort(soonestFirst);
  groups.past.sort(latestFirst);
  groups.cancelled.sort(latestFirst);

  return groups;
}
