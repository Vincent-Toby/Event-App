"use client";

import { startTransition, useActionState, useState } from "react";
import {
  cancelBookingAction,
  type BookingActionState,
} from "@/app/(public)/events/[slug]/actions";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const initialState: BookingActionState = {};

export function CancelBookingButton({ eventId }: { eventId: string }) {
  const [state, action, isCancelling] = useActionState(
    cancelBookingAction,
    initialState,
  );
  const [open, setOpen] = useState(false);

  function handleConfirm() {
    setOpen(false);
    const formData = new FormData();
    formData.set("eventId", eventId);
    startTransition(() => {
      action(formData);
    });
  }

  return (
    <div className="space-y-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={<Button variant="outline" disabled={isCancelling} />}
        >
          {isCancelling ? "Cancelling..." : "Cancel booking"}
        </PopoverTrigger>
        <PopoverContent side="top" align="start" className="w-72 space-y-4">
          <div className="space-y-1">
            <p className="font-bold">Cancel this booking?</p>
            <p className="text-sm text-muted-foreground">
              You’ll lose your spot, and someone else will be able to take it.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Keep booking
            </Button>
            <Button
              className="flex-1 bg-brand-red text-white hover:bg-brand-red/90"
              onClick={handleConfirm}
            >
              Yes, cancel
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {state.error && (
        <p role="alert" className="text-xs font-semibold text-destructive">
          {state.error}
        </p>
      )}
    </div>
  );
}
