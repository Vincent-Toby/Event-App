"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { uploadEventImage } from "@/lib/cloudinary";
import { cancelEvent, deleteEvent, updateEvent } from "@/lib/organizer";
import { requireUser } from "@/lib/session";
import { eventSchema } from "@/lib/validations/event";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const GENERIC_ERROR = "Something went wrong. Please try again.";

export type ManageEventState = {
  errors?: Record<string, string>;
  message?: string;
  success?: string;
};

function readEventId(formData: FormData) {
  const value = String(formData.get("eventId") ?? "");
  return value && value.length <= 60 ? value : null;
}

// Refreshes every page and the header after a change.
function refreshEverything() {
  revalidatePath("/", "layout");
}

export async function updateEventAction(
  _prev: ManageEventState,
  formData: FormData,
): Promise<ManageEventState> {
  const user = await requireUser();
  const eventId = readEventId(formData);
  if (!eventId) return { message: GENERIC_ERROR };

  const str = (key: string) => String(formData.get(key) ?? "");

  const parsed = eventSchema.safeParse({
    title: str("title"),
    description: str("description"),
    category: str("category"),
    venue: str("venue"),
    city: str("city"),
    isOnline: formData.get("isOnline") === "on",
    startsAt: str("startsAt"),
    endsAt: str("endsAt") || undefined,
    capacity: str("capacity") || undefined,
    price: str("price") || "0",
    tags: str("tags"),
  });

  const errors: Record<string, string> = {};

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
  }

  // The image is optional when editing: no new file means keep the current one.
  const image = formData.get("image");
  const imageFile = image instanceof File && image.size > 0 ? image : null;

  if (imageFile) {
    if (!imageFile.type.startsWith("image/")) {
      errors.image = "The file must be an image";
    } else if (imageFile.size > MAX_IMAGE_BYTES) {
      errors.image = "Image must be under 4 MB";
    }
  }

  if (!parsed.success || Object.keys(errors).length > 0) {
    return { errors };
  }

  try {
    const imageUrl = imageFile ? await uploadEventImage(imageFile) : null;
    const result = await updateEvent(
      user.id,
      eventId,
      parsed.data,
      imageUrl,
      new Date(),
    );
    if (!result.ok) return { message: result.error };

    refreshEverything();
    return { success: result.message };
  } catch (error) {
    console.error("updateEventAction failed", error);
    return { message: GENERIC_ERROR };
  }
}

export async function cancelEventAction(
  _prev: ManageEventState,
  formData: FormData,
): Promise<ManageEventState> {
  const user = await requireUser();
  const eventId = readEventId(formData);
  if (!eventId) return { message: GENERIC_ERROR };

  try {
    const result = await cancelEvent(user.id, eventId, new Date());
    if (!result.ok) return { message: result.error };

    refreshEverything();
    return { success: result.message };
  } catch (error) {
    console.error("cancelEventAction failed", error);
    return { message: GENERIC_ERROR };
  }
}

export async function deleteEventAction(
  _prev: ManageEventState,
  formData: FormData,
): Promise<ManageEventState> {
  const user = await requireUser();
  const eventId = readEventId(formData);
  if (!eventId) return { message: GENERIC_ERROR };

  try {
    const result = await deleteEvent(user.id, eventId);
    if (!result.ok) return { message: result.error };
    refreshEverything();
  } catch (error) {
    console.error("deleteEventAction failed", error);
    return { message: GENERIC_ERROR };
  }

  // redirect() works by throwing, so it must stay outside the try/catch.
  redirect("/my-events");
}
