import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getManagedEvent } from "@/lib/organizer";
import { requireUser } from "@/lib/session";

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

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <Link
        href="/my-events"
        className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        My events
      </Link>
      <h1 className="text-3xl sm:text-4xl">{event.title}</h1>
      <p className="text-muted-foreground">
        Editing tools and the attendee list are coming in the next step.
      </p>
    </div>
  );
}

export default function ManagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-3xl space-y-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-2/3" />
        </div>
      }
    >
      <ManageContent params={params} />
    </Suspense>
  );
}
