import { prisma } from "@/lib/prisma";

// Counts only confirmed bookings for events that have not ended and are not
// cancelled. This matches the "Upcoming" tab on the My bookings page.
export async function getUpcomingBookingCount(userId: string, now: Date) {
  return prisma.booking.count({
    where: {
      userId,
      status: "CONFIRMED",
      event: {
        status: { not: "CANCELLED" },
        OR: [{ endsAt: { gte: now } }, { endsAt: null, startsAt: { gte: now } }],
      },
    },
  });
}
