"use client";

import { startTransition, useActionState, useState } from "react";
import { CircleCheck } from "lucide-react";
import {
  bookEventAction,
  cancelBookingAction,
  type BookingActionState,
} from "@/app/(public)/events/[slug]/actions";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const initialState: BookingActionState = {};

type BookingControlsProps = {
  eventId: string;
  isBooked: boolean;
  canCancel: boolean;
  compact?: boolean;
  className?: string;
};

export function BookingControls({
  eventId,
  isBooked,
  canCancel,
  compact = false,
  className,
}: BookingControlsProps) {
  const [bookState, bookAction, isBooking] = useActionState(
    bookEventAction,
    initialState,
  );
  const [cancelState, cancelAction, isCancelling] = useActionState(
    cancelBookingAction,
    initialState,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Errors come from the action the visitor can currently use; the success
  // message comes from the action that just finished.
  const error = isBooked ? cancelState.error : bookState.error;
  const message = isBooked ? bookState.message : cancelState.message;
  const note = error ?? message;

  function handleConfirmCancel() {
    setConfirmOpen(false);
    const formData = new FormData();
    formData.set("eventId", eventId);
    startTransition(() => {
      cancelAction(formData);
    });
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        compact ? "items-end" : "items-stretch",
      )}
    >
      {isBooked ? (
        <div className={cn("flex gap-2", compact ? "items-center" : "flex-col")}>
          <div className="flex items-center justify-center gap-2 rounded-lg bg-brand-blue/20 px-4 py-3 text-sm font-bold text-brand-indigo">
            <CircleCheck className="size-5" />
            {compact ? "Going" : "You\u2019re going!"}
          </div>
          {canCancel && (
            <Popover open={confirmOpen} onOpenChange={setConfirmOpen}>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    disabled={isCancelling}
                    className={cn("h-11", !compact && "w-full")}
                  />
                }
              >
                {isCancelling
                  ? "Cancelling..."
                  : compact
                    ? "Cancel"
                    : "Cancel booking"}
              </PopoverTrigger>
              <PopoverContent side="top" align="end" className="w-72 space-y-4">
                <div className="space-y-1">
                  <p className="font-bold">Cancel this booking?</p>
                  <p className="text-sm text-muted-foreground">
                    You’ll lose your spot, and someone else will be able to
                    take it.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setConfirmOpen(false)}
                  >
                    Keep booking
                  </Button>
                  <Button
                    className="flex-1 bg-brand-red text-white hover:bg-brand-red/90"
                    onClick={handleConfirmCancel}
                  >
                    Yes, cancel
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      ) : (
        <form action={bookAction}>
          <input type="hidden" name="eventId" value={eventId} />
          <Button type="submit" disabled={isBooking} className={className}>
            {isBooking ? "Booking..." : "Book now"}
          </Button>
        </form>
      )}

      {note && (
        <p
          role={error ? "alert" : "status"}
          className={cn(
            "text-xs font-semibold",
            error ? "text-destructive" : "text-brand-indigo",
            compact && "max-w-48 text-right",
          )}
        >
          {note}
        </p>
      )}
    </div>
  );
}
