import Link from "next/link";
import { SearchX } from "lucide-react";
import { EventRow, type EventRowData } from "@/components/event-row";
import {
  SearchFiltersChips,
  SearchFiltersSidebar,
} from "@/components/search-filters";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { parseBrowseParams } from "@/lib/browse-params";
import { CATEGORY_LABELS } from "@/lib/event-categories";
import { searchEvents } from "@/lib/search-query";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function EventList({ events, now }: { events: EventRowData[]; now: Date }) {
  return (
    <div className="space-y-4">
      {events.map((event) => (
        <EventRow key={event.slug} event={event} now={now} />
      ))}
    </div>
  );
}

// ["anime", "convention"] -> “anime” and “convention”
function joinWords(words: string[]) {
  const quoted = words.map((word) => `“${word}”`);
  if (quoted.length <= 1) return quoted.join("");
  return `${quoted.slice(0, -1).join(", ")} and ${quoted[quoted.length - 1]}`;
}

export async function SearchResults({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Reading searchParams first is what allows us to read the current time below.
  const filters = parseBrowseParams(await searchParams);
  const now = new Date();
  const results = await searchEvents(filters, now);

  const hasQuery = filters.q !== "";
  const hasFilters = filters.category !== null || filters.tab !== "all";
  const total = results.exact.length + results.related.length;

  const heading = hasQuery
    ? `Results for “${filters.q}”`
    : filters.category
      ? `${CATEGORY_LABELS[filters.category]} events`
      : "All events";

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl">{heading}</h1>
        {total > 0 && (
          <p className="text-muted-foreground">
            {total} {total === 1 ? "event" : "events"} found
          </p>
        )}
      </div>

      <SearchFiltersChips filters={filters} />

      <div className="grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <SearchFiltersSidebar filters={filters} />

        <div className="space-y-12">
          {results.exact.length > 0 && (
            <section>
              <EventList events={results.exact} now={now} />
            </section>
          )}

          {results.related.length > 0 && (
            <section className="space-y-6">
              {results.exact.length === 0 ? (
                <div
                  role="status"
                  className="rounded-xl border border-brand-yellow bg-brand-yellow/20 px-4 py-3 text-sm font-semibold"
                >
                  No exact matches for “{filters.q}”. Showing related events
                  that match {joinWords(results.relatedTerms)}.
                </div>
              ) : (
                <div className="space-y-1 border-t pt-10">
                  <h2 className="text-2xl">Related events</h2>
                  <p className="text-muted-foreground">
                    These match some of your words:{" "}
                    {joinWords(results.relatedTerms)}.
                  </p>
                </div>
              )}
              <EventList events={results.related} now={now} />
            </section>
          )}

          {total === 0 && (
            <section className="space-y-10">
              <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-brand-blue/50 bg-brand-blue/10 px-6 py-16 text-center">
                <SearchX className="size-10 text-brand-indigo" />
                <div className="space-y-1">
                  <h2 className="text-xl">
                    {hasQuery
                      ? `No events found for “${filters.q}”`
                      : hasFilters
                        ? "No events match your filters"
                        : "No events yet"}
                  </h2>
                  <p className="text-muted-foreground">
                    {hasQuery || hasFilters
                      ? "Try fewer or different words, or clear your filters."
                      : "Be the first to create one."}
                  </p>
                </div>
                {hasQuery || hasFilters ? (
                  <Button
                    variant="outline"
                    nativeButton={false}
                    render={<Link href="/search" />}
                  >
                    Clear filters
                  </Button>
                ) : (
                  <Button
                    nativeButton={false}
                    render={<Link href="/events/new" />}
                  >
                    Create event
                  </Button>
                )}
              </div>

              {results.fallback.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-2xl">Upcoming events you might like</h2>
                  <EventList events={results.fallback} now={now} />
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-72" />
      <div className="grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <div className="hidden space-y-3 lg:block">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="grid gap-4 rounded-2xl border p-3 sm:grid-cols-[14rem_minmax(0,1fr)] md:grid-cols-[16rem_minmax(0,1fr)_9rem]"
            >
              <Skeleton className="aspect-video w-full rounded-xl" />
              <div className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <Skeleton className="hidden h-12 w-24 md:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
