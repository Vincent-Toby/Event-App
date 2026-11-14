import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import {
  EventDetails,
  EventHero,
  EventStatusBanner,
  SimilarEvents,
} from "@/components/event-details";
import { EventPageSkeleton } from "@/components/event-page-skeleton";
import { TicketBar, TicketCard } from "@/components/event-tickets";
import { getBookingState } from "@/lib/event-availability";
import { getEventBySlug, getSimilarEvents } from "@/lib/event-detail";
import { getSession } from "@/lib/session";

async function EventContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const session = await getSession();
  const viewerId = session?.user.id ?? null;
  const isOrganizer = viewerId === event.organizerId;

  // Drafts are only visible to the person who created them.
  if (event.status === "DRAFT" && !isOrganizer) notFound();

  const now = new Date();
  const bookingState = getBookingState(event, now);
  const similar = await getSimilarEvents(event, now);

  const ticketProps = {
    event,
    now,
    bookingState,
    isLoggedIn: viewerId !== null,
    isOrganizer,
  };

  return (
    <div className="space-y-8 pb-28 lg:pb-0">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        All events
      </Link>

      <EventStatusBanner event={event} bookingState={bookingState} />
      <EventHero event={event} />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <EventDetails event={event} now={now} />
        <aside className="hidden lg:block">
          <div className="sticky top-6">
            <TicketCard {...ticketProps} />
          </div>
        </aside>
      </div>

      <SimilarEvents events={similar} category={event.category} now={now} />
      <TicketBar {...ticketProps} />
    </div>
  );
}

export default function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<EventPageSkeleton />}>
      <EventContent params={params} />
    </Suspense>
  );
}
