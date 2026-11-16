import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { AttendeeList } from "@/components/attendee-list";
import { EventDangerZone } from "@/components/event-danger-zone";
import { LogoLoader } from "@/components/logo-loader";
import { ManageEventForm } from "@/components/manage-event-form";
import { Button } from "@/components/ui/button";
import { getSpotsLeft } from "@/lib/event-availability";
import { formatPrice } from "@/lib/event-utils";
import { getAttendees, getManagedEvent } from "@/lib/organizer";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Manage event",
  robots: { index: false, follow: false },
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
    </div>
  );
}

async function ManageContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireUser();

  // Only the person who created the event gets anything back.
  const event = await getManagedEvent(slug, user.id);
  if (!event) notFound();

  const now = new Date();
  const attendees = await getAttendees(user.id, event.id);

  const isCancelled = event.status === "CANCELLED";
  const started = event.startsAt.getTime() <= now.getTime();
  const end = event.endsAt ?? event.startsAt;
  const ended = end.getTime() < now.getTime();

  const canEdit = !isCancelled && !started;
  const canCancel = !isCancelled && !ended;
  const canDelete = event.confirmedCount === 0;

  const spotsLeft = getSpotsLeft(event.capacity, event.confirmedCount);
  const chip = isCancelled
    ? { label: "Cancelled", className: "bg-primary/10 text-primary" }
    : ended
      ? { label: "Ended", className: "bg-muted text-foreground" }
      : event.status === "DRAFT"
        ? { label: "Draft", className: "bg-brand-yellow text-foreground" }
        : { label: "Live", className: "bg-brand-blue/30 text-foreground" };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-10">
      <div className="space-y-4">
        <Link
          href="/my-events"
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          My events
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <span
              className={`inline-block rounded-md px-2 py-1 text-xs font-semibold ${chip.className}`}
            >
              {chip.label}
            </span>
            <h1 className="text-3xl sm:text-4xl">{event.title}</h1>
          </div>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/events/${event.slug}`} />}
          >
            View event
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Booked"
          value={
            event.capacity
              ? `${event.confirmedCount} of ${event.capacity}`
              : String(event.confirmedCount)
          }
        />
        <Stat
          label="Spots left"
          value={spotsLeft === null ? "Unlimited" : String(spotsLeft)}
        />
        <Stat label="Price" value={formatPrice(event.price, event.currency)} />
      </div>

      {canEdit ? (
        <section className="space-y-6">
          <h2 className="text-2xl">Edit event</h2>
          <ManageEventForm
            event={{
              id: event.id,
              title: event.title,
              description: event.description,
              imageUrl: event.imageUrl,
              category: event.category,
              venue: event.venue,
              city: event.city,
              isOnline: event.isOnline,
              tags: event.tags,
              startsAt: event.startsAt.toISOString(),
              endsAt: event.endsAt ? event.endsAt.toISOString() : null,
              capacity: event.capacity,
              price: event.price,
              currency: event.currency,
              confirmedCount: event.confirmedCount,
            }}
          />
        </section>
      ) : (
        <div
          role="status"
          className="rounded-xl border border-brand-yellow bg-brand-yellow/20 px-4 py-3 text-sm font-semibold"
        >
          {isCancelled
            ? "This event is cancelled, so it can't be edited."
            : "This event has already started, so it can't be edited."}
        </div>
      )}

      <AttendeeList attendees={attendees} now={now} />

      <EventDangerZone
        eventId={event.id}
        confirmedCount={event.confirmedCount}
        isCancelled={isCancelled}
        canCancel={canCancel}
        canDelete={canDelete}
      />
    </div>
  );
}

export default function ManagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<LogoLoader label="Loading event" />}>
      <ManageContent params={params} />
    </Suspense>
  );
}
