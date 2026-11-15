import { prisma } from "@/lib/prisma";
import { getBookingState } from "@/lib/event-availability";

export type BookingResult =
  | { ok: true; slug: string; message: string }
  | { ok: false; error: string };

// Books a spot for a user. Safe against two people taking the last spot at the
// same time: the event row is locked for the duration of the transaction.
export async function createBooking(
  userId: string,
  eventId: string,
  now: Date,
): Promise<BookingResult> {
  return prisma.$transaction(
    async (tx): Promise<BookingResult> => {
      // Locks this event's row until the transaction finishes, so bookings for the
      // same event are handled one after the other.
      await tx.$queryRaw`SELECT "id" FROM "event" WHERE "id" = ${eventId} FOR UPDATE`;

      const event = await tx.event.findUnique({
        where: { id: eventId },
        select: {
          id: true,
          slug: true,
          status: true,
          startsAt: true,
          endsAt: true,
          capacity: true,
          price: true,
          organizerId: true,
        },
      });

      if (!event || event.status === "DRAFT") {
        return { ok: false, error: "This event could not be found." };
      }
      if (event.organizerId === userId) {
        return { ok: false, error: "You can't book your own event." };
      }
      // Payments are not built yet, so only free events can be booked.
      if (event.price > 0) {
        return { ok: false, error: "Paid tickets aren't available yet." };
      }

      const confirmedCount = await tx.booking.count({
        where: { eventId, status: "CONFIRMED" },
      });

      const state = getBookingState(
        {
          status: event.status,
          startsAt: event.startsAt,
          endsAt: event.endsAt,
          capacity: event.capacity,
          confirmedCount,
        },
        now,
      );

      if (state === "cancelled") {
        return { ok: false, error: "This event has been cancelled." };
      }
      if (state === "ended") {
        return { ok: false, error: "This event has already ended." };
      }

      const existing = await tx.booking.findUnique({
        where: { eventId_userId: { eventId, userId } },
        select: { id: true, status: true },
      });

      // Check this before "sold out", so a person who already has a spot is told so.
      if (existing?.status === "CONFIRMED") {
        return { ok: false, error: "You're already booked for this event." };
      }
      if (state === "sold_out") {
        return { ok: false, error: "This event is sold out." };
      }

      if (existing) {
        // They cancelled before: reuse the same row instead of creating a second one.
        await tx.booking.update({
          where: { id: existing.id },
          data: {
            status: "CONFIRMED",
            paymentStatus: "NOT_REQUIRED",
            cancelledAt: null,
          },
        });
      } else {
        await tx.booking.create({
          data: {
            eventId,
            userId,
            status: "CONFIRMED",
            paymentStatus: "NOT_REQUIRED",
          },
        });
      }

      return { ok: true, slug: event.slug, message: "You're booked!" };
    },
    { maxWait: 5000, timeout: 10000 },
  );
}

// Cancels a user's own booking. Allowed until the event starts.
export async function cancelBooking(
  userId: string,
  eventId: string,
  now: Date,
): Promise<BookingResult> {
  const booking = await prisma.booking.findUnique({
    where: { eventId_userId: { eventId, userId } },
    select: {
      id: true,
      status: true,
      event: { select: { slug: true, startsAt: true } },
    },
  });

  if (!booking || booking.status !== "CONFIRMED") {
    return {
      ok: false,
      error: "You don't have an active booking for this event.",
    };
  }
  if (booking.event.startsAt.getTime() <= now.getTime()) {
    return {
      ok: false,
      error: "This event has already started, so the booking can't be cancelled.",
    };
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "CANCELLED", cancelledAt: now },
  });

  return {
    ok: true,
    slug: booking.event.slug,
    message: "Your booking has been cancelled.",
  };
}

// What the event page needs to know about the current visitor.
export async function getBookingStatus(
  userId: string,
  eventId: string,
): Promise<"CONFIRMED" | "CANCELLED" | null> {
  const booking = await prisma.booking.findUnique({
    where: { eventId_userId: { eventId, userId } },
    select: { status: true },
  });
  return booking?.status ?? null;
}
