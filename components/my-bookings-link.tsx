import Link from "next/link";
import { Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MyBookingsLink({ count }: { count: number }) {
  return (
    <Button
      variant="ghost"
      className="gap-2"
      nativeButton={false}
      render={<Link href="/bookings" />}
    >
      <Ticket className="size-4" />
      My bookings
      {count > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
          {count > 9 ? "9+" : count}
          <span className="sr-only">
            {" "}
            upcoming {count === 1 ? "booking" : "bookings"}
          </span>
        </span>
      )}
    </Button>
  );
}
