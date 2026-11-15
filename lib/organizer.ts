import type { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { EventStatusValue } from "@/lib/event-availability";
import type { EventCategoryValue } from "@/lib/event-categories";
import type { eventSchema } from "@/lib/validations/event";

export type EventInput = z.output<typeof eventSchema>;

export type OrganizerResult =
  | { ok: true; slug: string; message: string }
  | { ok: false; error: string };

// ---------- Reading ----------

export type OrganizerEventItem = {
  id: string;
  slug: string;
  title: string;
  imageUrl: string;
  venue: string;
  city: string | null;
  isOnline: boolean;
  startsAt: Date;
  endsAt: Date | null;
  capacity: number | null;
  price: number;
  currency: string;
  status: EventStatusValue;
  confirmedCount: number;
};

export type OrganizerEventGroups = {
  upcoming: OrganizerEventItem[];
  past: OrganizerEventItem[];
  cancelled: OrganizerEventItem[];
};

const MAX_EVENTS = 200;

export async function getOrganizerEvents(
  userId: string,
  now: Date,
): Promise<OrganizerEventGroups> {
  const rows = await prisma.event.findMany({
    where: { organizerId: userId },
    orderBy: { startsAt: "desc" },
    take: MAX_EVENTS,
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
      capacity: true,
      price: true,
      currency: true,
      status: true,
      _count: { select: { bookings: { where: { status: "CONFIRMED" } } } },
    },
  });

  const groups: OrganizerEventGroups = { upcoming: [], past: [], cancelled: [] };

  for (const row of rows) {
    const { _count, ...rest } = row;
    const item: OrganizerEventItem = { ...rest, confirmedCount: _count.bookings };
    const end = item.endsAt ?? item.startsAt;

    if (item.status === "CANCELLED") groups.cancelled.push(item);
    else if (end.getTime() < now.getTime()) groups.past.push(item);
    else groups.upcoming.push(item);
  }

  // Upcoming: soonest first. The others: most recent first (already ordered).
  groups.upcoming.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

  return groups;
}

export type ManagedEvent = {
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
  confirmedCount: number;
};

// Returns the event only if this user created it. Anyone else gets null.
export async function getManagedEvent(
  slug: string,
  userId: string,
): Promise<ManagedEvent | null> {
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) return null;

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
      organizerId: true,
      _count: { select: { bookings: { where: { status: "CONFIRMED" } } } },
    },
  });

  if (!event || event.organizerId !== userId) return null;

  const { organizerId: _organizerId, _count, ...rest } = event;
  return { ...rest, confirmedCount: _count.bookings };
}

export type Attendee = {
  bookingId: string;
  ref: string;
  name: string;
  email: string;
  bookedAt: Date;
};

// Only the organizer of the event gets any rows back; everyone else gets an empty list.
export async function getAttendees(
  userId: string,
  eventId: string,
): Promise<Attendee[]> {
  const bookings = await prisma.booking.findMany({
    where: {
      eventId,
      status: "CONFIRMED",
      event: { organizerId: userId },
    },
    orderBy: { createdAt: "asc" },
    take: 1000,
    select: {
      id: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
    },
  });

  return bookings.map((booking) => ({
    bookingId: booking.id,
    ref: booking.id.slice(-8).toUpperCase(),
    name: booking.user.name,
    email: booking.user.email,
    bookedAt: booking.createdAt,
  }));
}

// ---------- Changing ----------

// Edits an event. Allowed until it starts. The event's link (slug) never changes.
export async function updateEvent(
  userId: string,
  eventId: string,
  input: EventInput,
  imageUrl: string | null,
  now: Date,
): Promise<OrganizerResult> {
  return prisma.$transaction(
    async (tx): Promise<OrganizerResult> => {
      // Locks this event's row, so a booking cannot slip in while we check capacity.
      await tx.$queryRaw`SELECT "id" FROM "event" WHERE "id" = ${eventId} FOR UPDATE`;

      const event = await tx.event.findUnique({
        where: { id: eventId },
        select: {
          slug: true,
          organizerId: true,
          status: true,
          startsAt: true,
          price: true,
        },
      });

      if (!event || event.organizerId !== userId) {
        return { ok: false, error: "You can only edit your own events." };
      }
      if (event.status === "CANCELLED") {
        return { ok: false, error: "Cancelled events can't be edited." };
      }
      if (event.startsAt.getTime() <= now.getTime()) {
        return {
          ok: false,
          error: "This event has already started, so it can't be edited.",
        };
      }

      const confirmedCount = await tx.booking.count({
        where: { eventId, status: "CONFIRMED" },
      });
      const newPrice = Math.round(input.price * 100);

      if (confirmedCount > 0 && newPrice !== event.price) {
        return {
          ok: false,
          error: "The price can't be changed once people have booked.",
        };
      }
      if (input.capacity !== undefined && input.capacity < confirmedCount) {
        return {
          ok: false,
          error: `Capacity can't be lower than the ${confirmedCount} ${confirmedCount === 1 ? "person" : "people"} already booked.`,
        };
      }

      await tx.event.update({
        where: { id: eventId },
        data: {
          title: input.title,
          description: input.description,
          category: input.category,
          venue: input.venue,
          city: input.city || null,
          isOnline: input.isOnline,
          tags: input.tags,
          startsAt: input.startsAt,
          endsAt: input.endsAt ?? null,
          capacity: input.capacity ?? null,
          price: newPrice,
          ...(imageUrl ? { imageUrl } : {}),
        },
      });

      return { ok: true, slug: event.slug, message: "Your event has been updated." };
    },
    { maxWait: 5000, timeout: 10000 },
  );
}

// Cancels an event. Allowed until it ends. People who booked keep their bookings;
// the event shows as cancelled for them.
export async function cancelEvent(
  userId: string,
  eventId: string,
  now: Date,
): Promise<OrganizerResult> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      slug: true,
      organizerId: true,
      status: true,
      startsAt: true,
      endsAt: true,
    },
  });

  if (!event || event.organizerId !== userId) {
    return { ok: false, error: "You can only cancel your own events." };
  }
  if (event.status === "CANCELLED") {
    return { ok: false, error: "This event is already cancelled." };
  }
  const end = event.endsAt ?? event.startsAt;
  if (end.getTime() < now.getTime()) {
    return { ok: false, error: "This event has already ended." };
  }

  await prisma.event.update({
    where: { id: eventId },
    data: { status: "CANCELLED" },
  });

  return { ok: true, slug: event.slug, message: "The event has been cancelled." };
}

// Deletes an event. Only allowed when nobody has a confirmed booking.
export async function deleteEvent(
  userId: string,
  eventId: string,
): Promise<OrganizerResult> {
  return prisma.$transaction(
    async (tx): Promise<OrganizerResult> => {
      await tx.$queryRaw`SELECT "id" FROM "event" WHERE "id" = ${eventId} FOR UPDATE`;

      const event = await tx.event.findUnique({
        where: { id: eventId },
        select: { slug: true, organizerId: true },
      });

      if (!event || event.organizerId !== userId) {
        return { ok: false, error: "You can only delete your own events." };
      }

      const confirmedCount = await tx.booking.count({
        where: { eventId, status: "CONFIRMED" },
      });
      if (confirmedCount > 0) {
        return {
          ok: false,
          error:
            "This event has bookings, so it can't be deleted. Cancel it instead.",
        };
      }

      await tx.event.delete({ where: { id: eventId } });
      return { ok: true, slug: event.slug, message: "The event has been deleted." };
    },
    { maxWait: 5000, timeout: 10000 },
  );
}
