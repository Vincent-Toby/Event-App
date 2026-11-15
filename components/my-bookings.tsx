import Link from "next/link";
import { Ticket } from "lucide-react";
import { BookingRow } from "@/components/booking-row";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/lib/session";
import { getUserBookings } from "@/lib/user-bookings";
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
    title: "No upcoming bookings",
    text: "Find an event you like and book your spot.",
  },
  past: {
    title: "No past events yet",
    text: "Events you booked will show up here after they end.",
  },
  cancelled: {
    title: "No cancelled bookings",
    text: "Bookings you cancel, and events that get cancelled, show up here.",
  },
};

export async function MyBookings({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Reading the params and the session first is what allows us to read the time below.
  const params = await searchParams;
  const tab = parseTab(params.tab);
  const user = await requireUser();
  const now = new Date();

  const groups = await getUserBookings(user.id, now);
  const items = groups[tab];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl">My bookings</h1>
        <p className="text-muted-foreground">
          Your tickets and the events you&apos;re going to.
        </p>
      </div>

      <nav aria-label="Booking status" className="flex gap-6 overflow-x-auto border-b">
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <Link
              key={item.id}
              href={item.id === "upcoming" ? "/bookings" : `/bookings?tab=${item.id}`}
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
            <BookingRow
              key={item.bookingId}
              item={item}
              group={tab}
              now={now}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-brand-blue/50 bg-brand-blue/10 px-6 py-16 text-center">
          <Ticket className="size-10 text-brand-indigo" />
          <div className="space-y-1">
            <h2 className="text-xl">{EMPTY[tab].title}</h2>
            <p className="text-muted-foreground">{EMPTY[tab].text}</p>
          </div>
          {tab === "upcoming" && (
            <Button nativeButton={false} render={<Link href="/search" />}>
              Browse events
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function MyBookingsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-5 w-72" />
      </div>
      <Skeleton className="h-10 w-80" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="grid gap-4 rounded-2xl border p-3 sm:grid-cols-[14rem_minmax(0,1fr)]"
        >
          <Skeleton className="aspect-video w-full rounded-xl" />
          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
