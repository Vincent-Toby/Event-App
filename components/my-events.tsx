import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { MyEventRow } from "@/components/my-event-row";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrganizerEvents } from "@/lib/organizer";
import { requireUser } from "@/lib/session";
import { cn } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const TABS = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "cancelled", label: "Cancelled" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function parseTab(raw: string | string[] | undefined): TabId {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return TABS.some((tab) => tab.id === value) ? (value as TabId) : "upcoming";
}

const EMPTY: Record<TabId, { title: string; text: string }> = {
  upcoming: {
    title: "No upcoming events",
    text: "Create an event and it will show up here.",
  },
  past: {
    title: "No past events yet",
    text: "Events you organized appear here after they end.",
  },
  cancelled: {
    title: "No cancelled events",
    text: "Events you cancel will show up here.",
  },
};

export async function MyEvents({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Reading the params and the session first is what allows us to read the time below.
  const params = await searchParams;
  const tab = parseTab(params.tab);
  const user = await requireUser();
  const now = new Date();

  const groups = await getOrganizerEvents(user.id, now);
  const items = groups[tab];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl">My events</h1>
          <p className="text-muted-foreground">
            Events you created, and who is coming.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/events/new" />}>
          Create event
        </Button>
      </div>

      <nav aria-label="Event status" className="flex gap-6 overflow-x-auto border-b">
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <Link
              key={item.id}
              href={item.id === "upcoming" ? "/my-events" : `/my-events?tab=${item.id}`}
              scroll={false}
              aria-current={active ? "page" : undefined}
              className={cn(
                "-mb-px shrink-0 border-b-2 py-3 text-base font-semibold transition-colors",
                active
                  ? "border-brand-indigo text-brand-indigo"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label} ({groups[item.id].length})
            </Link>
          );
        })}
      </nav>

      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item) => (
            <MyEventRow key={item.id} item={item} group={tab} now={now} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-brand-blue/50 bg-brand-blue/10 px-6 py-16 text-center">
          <CalendarPlus className="size-10 text-brand-indigo" />
          <div className="space-y-1">
            <h2 className="text-xl">{EMPTY[tab].title}</h2>
            <p className="text-muted-foreground">{EMPTY[tab].text}</p>
          </div>
          {tab === "upcoming" && (
            <Button nativeButton={false} render={<Link href="/events/new" />}>
              Create event
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function MyEventsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-5 w-64" />
      </div>
      <Skeleton className="h-10 w-80" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="grid gap-4 rounded-2xl border p-3 sm:grid-cols-[14rem_minmax(0,1fr)]"
        >
          <Skeleton className="aspect-video w-full rounded-xl" />
          <div className="space-y-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
