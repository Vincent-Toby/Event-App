import { z } from "zod";
import { EVENT_CATEGORIES } from "@/lib/event-categories";

export const eventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(120, "Title must be 120 characters or fewer"),
    description: z
      .string()
      .trim()
      .min(20, "Description must be at least 20 characters")
      .max(5000, "Description must be 5000 characters or fewer"),
    category: z.enum(EVENT_CATEGORIES, { message: "Choose a category" }),
    venue: z
      .string()
      .trim()
      .min(2, "Enter a venue (or a link for online events)")
      .max(200, "Venue must be 200 characters or fewer"),
    city: z.string().trim().max(100, "City must be 100 characters or fewer").optional(),
    isOnline: z.boolean(),
    startsAt: z.coerce.date({ message: "Choose a start date and time" }),
    endsAt: z.coerce.date({ message: "Enter a valid end date and time" }).optional(),
    capacity: z.coerce
      .number()
      .int("Capacity must be a whole number")
      .min(1, "Capacity must be at least 1")
      .max(100000, "Capacity is too large")
      .optional(),
    price: z.coerce
      .number()
      .min(0, "Price cannot be negative")
      .max(100000, "Price is too large"),
    tags: z
      .string()
      .optional()
      .transform((value) =>
        (value ?? "")
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean)
          .slice(0, 8),
      ),
  })
  .refine((data) => data.startsAt > new Date(), {
    message: "Start time must be in the future",
    path: ["startsAt"],
  })
  .refine((data) => !data.endsAt || data.endsAt > data.startsAt, {
    message: "End time must be after the start time",
    path: ["endsAt"],
  });