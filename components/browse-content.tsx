import Link from "next/link";
import { CalendarX2 } from "lucide-react";
import { BrowseTabs } from "@/components/browse-tabs";
import { CategoryCircles } from "@/components/category-circles";
import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { parseBrowseParams, type BrowseFilters } from "@/lib/browse-params";
import { CATEGORY_LABELS } from "@/lib/event-categories";
import { getBrowseEvents } from "@/lib/events-query";
import { connection } from "next/server";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getHeading(filters: BrowseFilters) {
  if (filters.q) return `Results for “${filters.q}”`;
  if (filters.category) return `${CATEGORY_LABELS[filters.category]} events`;
  if (filters.tab === "today") return "Events today";
  if (filters.tab === "weekend") return "Events this weekend";
  return "Upcoming events";
}

export async function BrowseContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Reading searchParams first is what allows us to read the current time below.
  const filters = parseBrowseParams(await searchParams);
  await connection();
  const now = new Date();
  const events = await getBrowseEvents(filters, now);
  const hasFilters =
    filters.category !== null || filters.q !== "" || filters.tab !== "all";

  return (
    <div className="space-y-10">
      <CategoryCircles filters={filters} />

      <section id="events" className="scroll-mt-6 space-y-6">
        <BrowseTabs filters={filters} />
        <h2 className="text-2xl sm:text-3xl">{getHeading(filters)}</h2>

        {events.length > 0 ? (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {events.map((event) => (
              <EventCard key={event.slug} event={event} now={now} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-brand-blue/50 bg-brand-blue/10 px-6 py-16 text-center">
            <CalendarX2 className="size-10 text-brand-indigo" />
            <div className="space-y-1">
              <h3 className="text-xl">
                {hasFilters ? "No events match your filters" : "No events yet"}
              </h3>
              <p className="text-muted-foreground">
                {hasFilters
                  ? "Try a different category or date, or clear your filters."
                  : "Be the first to create one."}
              </p>
            </div>
            {hasFilters ? (
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href="/" />}
              >
                Clear filters
              </Button>
            ) : (
              <Button nativeButton={false} render={<Link href="/events/new" />}>
                Create event
              </Button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export function BrowseSkeleton() {
  return (
    <div className="space-y-10">
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex w-24 shrink-0 flex-col items-center gap-2">
            <Skeleton className="size-20 rounded-full sm:size-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
      <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
