import type { Metadata } from "next";
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
import { TicketBar, TicketCard } from "@/components/event-tickets";
import { LogoLoader } from "@/components/logo-loader";
import { getBookingStatus } from "@/lib/booking";
import { getBookingState } from "@/lib/event-availability";
import { getEventBySlug, getSimilarEvents } from "@/lib/event-detail";
import { getEventMetadata } from "@/lib/event-metadata";
import { getSession } from "@/lib/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventMetadata(slug);

  if (!event) {
    return { title: "Event", robots: { index: false, follow: false } };
  }

  return {
    title: event.title,
    description: event.description,
    openGraph: {
      type: "website",
      title: event.title,
      description: event.description,
      images: [
        { url: event.imageUrl, width: 1200, height: 630, alt: event.title },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.description,
      images: [event.imageUrl],
    },
  };
}

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

  const [similar, bookingStatus] = await Promise.all([
    getSimilarEvents(event, now),
    viewerId
      ? getBookingStatus(viewerId, event.id)
      : Promise.resolve<"CONFIRMED" | "CANCELLED" | null>(null),
  ]);

  const ticketProps = {
    event,
    now,
    bookingState,
    bookingStatus,
    isLoggedIn: viewerId !== null,
    isOrganizer,
    // A booking can be cancelled until the event starts.
    canCancel: event.startsAt.getTime() > now.getTime(),
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
    <Suspense fallback={<LogoLoader label="Loading event" />}>
      <EventContent params={params} />
    </Suspense>
  );
}