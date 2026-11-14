"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { uploadEventImage } from "@/lib/cloudinary";
import { slugWithSuffix } from "@/lib/slug";
import { eventSchema } from "@/lib/validations/event";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export type CreateEventState = {
  errors?: Record<string, string>;
  message?: string;
};

export async function createEvent(
  _prevState: CreateEventState,
  formData: FormData,
): Promise<CreateEventState> {
  const user = await requireUser();
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

  const image = formData.get("image");
  const imageFile = image instanceof File && image.size > 0 ? image : null;

  if (!imageFile) {
    errors.image = "Add a cover image";
  } else if (!imageFile.type.startsWith("image/")) {
    errors.image = "The file must be an image";
  } else if (imageFile.size > MAX_IMAGE_BYTES) {
    errors.image = "Image must be under 4 MB";
  }

  if (!parsed.success || !imageFile || Object.keys(errors).length > 0) {
    return { errors };
  }

  try {
    const imageUrl = await uploadEventImage(imageFile);
    const data = parsed.data;

    await prisma.event.create({
      data: {
        slug: slugWithSuffix(data.title),
        title: data.title,
        description: data.description,
        imageUrl,
        category: data.category,
        venue: data.venue,
        city: data.city || null,
        isOnline: data.isOnline,
        tags: data.tags,
        startsAt: data.startsAt,
        endsAt: data.endsAt ?? null,
        capacity: data.capacity ?? null,
        price: Math.round(data.price * 100),
        organizerId: user.id,
      },
    });
  } catch (error) {
    console.error("createEvent failed", error);
    return {
      message: "Something went wrong while creating your event. Please try again.",
    };
  }

  // redirect() works by throwing, so it must stay outside the try/catch.
  redirect("/");
}