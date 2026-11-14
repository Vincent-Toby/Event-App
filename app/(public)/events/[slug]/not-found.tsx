import Link from "next/link";
import { CalendarX2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EventNotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
      <CalendarX2 className="size-12 text-brand-indigo" />
      <h1 className="text-3xl">Event not found</h1>
      <p className="text-muted-foreground">
        This event may have been removed, or the link is wrong.
      </p>
      <Button nativeButton={false} render={<Link href="/" />}>
        Browse events
      </Button>
    </div>
  );
}
