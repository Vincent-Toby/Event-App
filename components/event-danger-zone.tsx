"use client";

import { startTransition, useActionState, useState } from "react";
import {
  cancelEventAction,
  deleteEventAction,
  type ManageEventState,
} from "@/app/(public)/events/[slug]/manage/actions";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const initialState: ManageEventState = {};

type EventDangerZoneProps = {
  eventId: string;
  confirmedCount: number;
  isCancelled: boolean;
  canCancel: boolean;
  canDelete: boolean;
};

export function EventDangerZone({
  eventId,
  confirmedCount,
  isCancelled,
  canCancel,
  canDelete,
}: EventDangerZoneProps) {
  const [cancelState, cancelAction, isCancelling] = useActionState(
    cancelEventAction,
    initialState,
  );
  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteEventAction,
    initialState,
  );
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function run(action: (formData: FormData) => void, close: () => void) {
    close();
    const formData = new FormData();
    formData.set("eventId", eventId);
    startTransition(() => {
      action(formData);
    });
  }

  return (
    <section className="space-y-4 rounded-2xl border border-primary/30 p-6">
      <h2 className="text-xl">Danger zone</h2>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="max-w-md space-y-1">
          <p className="font-bold">Cancel this event</p>
          <p className="text-sm text-muted-foreground">
            {isCancelled
              ? "This event is cancelled."
              : canCancel
                ? "People who booked will see it as cancelled. This can't be undone."
                : "This event has already ended."}
          </p>
        </div>
        {!isCancelled && canCancel && (
          <Popover open={cancelOpen} onOpenChange={setCancelOpen}>
            <PopoverTrigger
              render={<Button variant="outline" disabled={isCancelling} />}
            >
              {isCancelling ? "Cancelling..." : "Cancel event"}
            </PopoverTrigger>
            <PopoverContent side="top" align="end" className="w-80 space-y-4">
              <div className="space-y-1">
                <p className="font-bold">Cancel this event?</p>
                <p className="text-sm text-muted-foreground">
                  {confirmedCount > 0
                    ? `${confirmedCount} ${confirmedCount === 1 ? "person has" : "people have"} booked. They will see it as cancelled on their bookings page. This can't be undone.`
                    : "No one has booked yet. This can't be undone."}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCancelOpen(false)}
                >
                  Keep event
                </Button>
                <Button
                  className="flex-1 bg-brand-red text-white hover:bg-brand-red/90"
                  onClick={() => run(cancelAction, () => setCancelOpen(false))}
                >
                  Yes, cancel
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
      {cancelState.message && (
        <p role="alert" className="text-sm font-semibold text-destructive">
          {cancelState.message}
        </p>
      )}
      {cancelState.success && (
        <p role="status" className="text-sm font-semibold text-brand-indigo">
          {cancelState.success}
        </p>
      )}

      <div className="border-t" />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="max-w-md space-y-1">
          <p className="font-bold">Delete this event</p>
          <p className="text-sm text-muted-foreground">
            {canDelete
              ? "Removes the event for good. This can't be undone."
              : "Events with bookings can't be deleted. Cancel it instead."}
          </p>
        </div>
        {canDelete ? (
          <Popover open={deleteOpen} onOpenChange={setDeleteOpen}>
            <PopoverTrigger
              render={<Button variant="outline" disabled={isDeleting} />}
            >
              {isDeleting ? "Deleting..." : "Delete event"}
            </PopoverTrigger>
            <PopoverContent side="top" align="end" className="w-80 space-y-4">
              <div className="space-y-1">
                <p className="font-bold">Delete this event?</p>
                <p className="text-sm text-muted-foreground">
                  The event will be removed permanently. This can&apos;t be
                  undone.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDeleteOpen(false)}
                >
                  Keep event
                </Button>
                <Button
                  className="flex-1 bg-brand-red text-white hover:bg-brand-red/90"
                  onClick={() => run(deleteAction, () => setDeleteOpen(false))}
                >
                  Yes, delete
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <Button variant="outline" disabled>
            Delete event
          </Button>
        )}
      </div>
      {deleteState.message && (
        <p role="alert" className="text-sm font-semibold text-destructive">
          {deleteState.message}
        </p>
      )}
    </section>
  );
}
