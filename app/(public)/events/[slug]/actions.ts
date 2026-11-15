"use server";

import { revalidatePath } from "next/cache";
import { cancelBooking, createBooking } from "@/lib/booking";
import { getSession } from "@/lib/session";

export type BookingActionState = {
  error?: string;
  message?: string;
};

const GENERIC_ERROR = "Something went wrong. Please try again.";

function readEventId(formData: FormData) {
  const value = String(formData.get("eventId") ?? "");
  return value && value.length <= 60 ? value : null;
}

// Refreshes every page and the header, so the My bookings count updates right away.
function refreshEverything() {
  revalidatePath("/", "layout");
}

export async function bookEventAction(
  _prev: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  const session = await getSession();
  if (!session) return { error: "Please sign in to book." };

  const eventId = readEventId(formData);
  if (!eventId) return { error: GENERIC_ERROR };

  try {
    const result = await createBooking(session.user.id, eventId, new Date());
    if (!result.ok) return { error: result.error };

    refreshEverything();
    return { message: result.message };
  } catch (error) {
    console.error("bookEventAction failed", error);
    return { error: GENERIC_ERROR };
  }
}

export async function cancelBookingAction(
  _prev: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  const session = await getSession();
  if (!session) return { error: "Please sign in." };

  const eventId = readEventId(formData);
  if (!eventId) return { error: GENERIC_ERROR };

  try {
    const result = await cancelBooking(session.user.id, eventId, new Date());
    if (!result.ok) return { error: result.error };

    refreshEverything();
    return { message: result.message };
  } catch (error) {
    console.error("cancelBookingAction failed", error);
    return { error: GENERIC_ERROR };
  }
}
