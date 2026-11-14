import { EventForm } from "@/components/event-form";
import { requireUser } from "@/lib/session";

export default async function NewEventPage() {
  await requireUser();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Create event</h1>
        <p className="text-sm text-muted-foreground">
          Add the details people need to find and book your event.
        </p>
      </div>
      <EventForm />
    </div>
  );
}