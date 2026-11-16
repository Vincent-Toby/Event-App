import type { Metadata } from "next";
import { EventForm } from "@/components/event-form";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Create an event",
  robots: { index: false, follow: false },
};

export default async function NewEventPage() {
  await requireUser();
  return <EventForm />;
}
