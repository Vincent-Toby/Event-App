import { EventForm } from "@/components/event-form";
import { requireUser } from "@/lib/session";

export default async function NewEventPage() {
  await requireUser();
  return <EventForm />;
}
