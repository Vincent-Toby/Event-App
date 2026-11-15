"use client";

import { startTransition, useActionState, useState } from "react";
import { CalendarClock, ImagePlus, MapPin, Monitor } from "lucide-react";
import {
  updateEventAction,
  type ManageEventState,
} from "@/app/(public)/events/[slug]/manage/actions";
import { fieldClass, OutlinedField, Section } from "@/components/form-parts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  CATEGORY_LABELS,
  EVENT_CATEGORIES,
  type EventCategoryValue,
} from "@/lib/event-categories";
import { fromInputParts, toInputParts } from "@/lib/event-time";
import { cn } from "@/lib/utils";

type LocationMode = "venue" | "online" | "tba";

const LOCATION_MODES = [
  { id: "venue", label: "Venue", icon: MapPin },
  { id: "online", label: "Online event", icon: Monitor },
  { id: "tba", label: "To be announced", icon: CalendarClock },
] as const;

export type ManageEventFormProps = {
  event: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    category: EventCategoryValue;
    venue: string;
    city: string | null;
    isOnline: boolean;
    tags: string[];
    startsAt: string;
    endsAt: string | null;
    capacity: number | null;
    // In cents.
    price: number;
    currency: string;
    confirmedCount: number;
  };
};

const initialState: ManageEventState = {};

function currencySymbol(currency: string) {
  return (
    new Intl.NumberFormat("en-US", { style: "currency", currency })
      .formatToParts(0)
      .find((part) => part.type === "currency")?.value ?? currency
  );
}

export function ManageEventForm({ event }: ManageEventFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateEventAction,
    initialState,
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [category, setCategory] = useState<string>(event.category);
  const [startDate, setStartDate] = useState(
    () => toInputParts(new Date(event.startsAt)).date,
  );
  const [startTime, setStartTime] = useState(
    () => toInputParts(new Date(event.startsAt)).time,
  );
  const [endDate, setEndDate] = useState(() =>
    event.endsAt ? toInputParts(new Date(event.endsAt)).date : "",
  );
  const [endTime, setEndTime] = useState(() =>
    event.endsAt ? toInputParts(new Date(event.endsAt)).time : "",
  );
  const [mode, setMode] = useState<LocationMode>(
    event.isOnline
      ? "online"
      : event.venue === "To be announced"
        ? "tba"
        : "venue",
  );
  const [isFree, setIsFree] = useState(event.price === 0);
  const [price, setPrice] = useState(() => (event.price / 100).toString());

  const errors = state.errors ?? {};
  const priceLocked = event.confirmedCount > 0;
  const onlineLink =
    event.isOnline && event.venue !== "Online event" ? event.venue : "";

  // We submit manually (instead of using the form's action prop) because React 19
  // clears every field after an action finishes, which would wipe the form
  // whenever there is a validation error.
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    fd.set("eventId", event.id);
    fd.set("category", category);
    fd.set("startsAt", fromInputParts(startDate, startTime));
    fd.set("endsAt", fromInputParts(endDate, endTime));
    fd.set("price", isFree ? "0" : price);

    if (mode === "online") {
      fd.set("isOnline", "on");
      const link = String(fd.get("link") ?? "").trim();
      fd.set("venue", link || "Online event");
      fd.delete("city");
    } else if (mode === "tba") {
      fd.delete("isOnline");
      fd.set("venue", "To be announced");
      fd.delete("city");
    } else {
      fd.delete("isOnline");
    }
    fd.delete("link");

    startTransition(() => {
      formAction(fd);
    });
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <Section title="Cover image" description="Pick a new image to replace it.">
        <div className="space-y-1.5">
          <label
            htmlFor="image"
            className="group relative block aspect-video w-full cursor-pointer overflow-hidden rounded-xl bg-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview ?? event.imageUrl}
              alt="Cover"
              className="size-full object-cover"
            />
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-background/95 px-4 py-2 text-sm font-semibold shadow">
              <ImagePlus className="size-4" />
              Change image
            </span>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="sr-only"
            />
          </label>
          {errors.image && (
            <p className="text-sm text-destructive">{errors.image}</p>
          )}
        </div>
      </Section>

      <Section title="Event name">
        <OutlinedField
          label="Event title"
          htmlFor="title"
          required
          error={errors.title}
        >
          <Input
            id="title"
            name="title"
            maxLength={120}
            defaultValue={event.title}
            className={fieldClass}
          />
        </OutlinedField>
      </Section>

      <Section title="Category">
        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-2">
            {EVENT_CATEGORIES.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={category === value}
                onClick={() => setCategory(value)}
                className={cn(
                  "rounded-full px-5 py-3 text-sm font-semibold transition-colors",
                  category === value
                    ? "bg-ring text-white"
                    : "bg-muted hover:bg-secondary",
                )}
              >
                {CATEGORY_LABELS[value]}
              </button>
            ))}
          </div>
          {errors.category && (
            <p className="text-sm text-destructive">{errors.category}</p>
          )}
        </div>
      </Section>

      <Section title="Description">
        <OutlinedField
          label="Description"
          htmlFor="description"
          required
          error={errors.description}
        >
          <Textarea
            id="description"
            name="description"
            defaultValue={event.description}
            className={cn(fieldClass, "min-h-40 py-4")}
          />
        </OutlinedField>
      </Section>

      <Section title="Date and time">
        <div className="grid gap-5 sm:grid-cols-2">
          <OutlinedField
            label="Start date"
            htmlFor="startDate"
            required
            error={errors.startsAt}
          >
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={fieldClass}
            />
          </OutlinedField>
          <OutlinedField label="Start time" htmlFor="startTime" required>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={fieldClass}
            />
          </OutlinedField>
          <OutlinedField
            label="End date (optional)"
            htmlFor="endDate"
            error={errors.endsAt}
          >
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={fieldClass}
            />
          </OutlinedField>
          <OutlinedField label="End time (optional)" htmlFor="endTime">
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={fieldClass}
            />
          </OutlinedField>
        </div>
      </Section>

      <Section title="Location">
        <div
          role="tablist"
          className="inline-flex flex-wrap gap-1 rounded-lg bg-muted p-1"
        >
          {LOCATION_MODES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={mode === item.id}
              onClick={() => setMode(item.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-4 py-3 text-sm font-semibold transition-colors",
                mode === item.id ? "bg-ring text-white" : "hover:bg-secondary",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </button>
          ))}
        </div>

        {mode === "venue" && (
          <div className="grid gap-5 sm:grid-cols-2">
            <OutlinedField
              label="Venue name or address"
              htmlFor="venue"
              required
              error={errors.venue}
            >
              <Input
                id="venue"
                name="venue"
                defaultValue={event.venue === "To be announced" ? "" : event.venue}
                className={fieldClass}
              />
            </OutlinedField>
            <OutlinedField
              label="City (optional)"
              htmlFor="city"
              error={errors.city}
            >
              <Input
                id="city"
                name="city"
                defaultValue={event.city ?? ""}
                className={fieldClass}
              />
            </OutlinedField>
          </div>
        )}

        {mode === "online" && (
          <OutlinedField label="Event link (optional)" htmlFor="link">
            <Input
              id="link"
              name="link"
              placeholder="https://"
              defaultValue={onlineLink}
              className={fieldClass}
            />
          </OutlinedField>
        )}

        {mode === "tba" && (
          <p className="text-muted-foreground">
            People will see &quot;To be announced&quot; until you add a
            location.
          </p>
        )}
      </Section>

      <Section
        title="Tickets"
        description={
          priceLocked
            ? "The price can't be changed once people have booked."
            : "One general admission ticket for now."
        }
      >
        <div className="space-y-4">
          <OutlinedField
            label="Price"
            htmlFor="price"
            required
            error={errors.price}
            className="max-w-xs"
          >
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-muted-foreground">
              {currencySymbol(event.currency)}
            </span>
            <Input
              id="price"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={isFree ? "" : price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              disabled={isFree || priceLocked}
              className={cn(fieldClass, "pl-12")}
            />
          </OutlinedField>
          <div className="flex items-center gap-3">
            <Switch
              id="free"
              checked={isFree}
              onCheckedChange={setIsFree}
              disabled={priceLocked}
            />
            <label htmlFor="free" className="font-medium">
              My tickets are free
            </label>
          </div>
          <OutlinedField
            label="Total ticket quantity"
            htmlFor="capacity"
            error={errors.capacity}
            className="max-w-xs"
          >
            <Input
              id="capacity"
              name="capacity"
              type="number"
              min={Math.max(1, event.confirmedCount)}
              step={1}
              defaultValue={event.capacity ?? ""}
              placeholder="Unlimited"
              className={fieldClass}
            />
          </OutlinedField>
          {event.confirmedCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {event.confirmedCount}{" "}
              {event.confirmedCount === 1 ? "person has" : "people have"} booked,
              so capacity can&apos;t go below that.
            </p>
          )}
        </div>
      </Section>

      <Section title="Tags" description="Optional. Separate them with commas.">
        <OutlinedField label="Tags" htmlFor="tags" error={errors.tags}>
          <Input
            id="tags"
            name="tags"
            defaultValue={event.tags.join(", ")}
            className={fieldClass}
          />
        </OutlinedField>
      </Section>

      <div className="space-y-3">
        {state.message && (
          <p role="alert" className="text-sm font-semibold text-destructive">
            {state.message}
          </p>
        )}
        {state.success && (
          <p role="status" className="text-sm font-semibold text-brand-indigo">
            {state.success}
          </p>
        )}
        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          className="h-12 px-8 text-base font-semibold"
        >
          {isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
