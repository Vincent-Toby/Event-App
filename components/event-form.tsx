"use client";

import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import {
  CalendarClock,
  CalendarDays,
  ImagePlus,
  MapPin,
  Monitor,
  Plus,
} from "lucide-react";
import {
  createEvent,
  type CreateEventState,
} from "@/app/(create)/events/new/actions";
import { CATEGORY_LABELS, EVENT_CATEGORIES } from "@/lib/event-categories";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

// Change this together with the currency default in prisma/schema.prisma.
const CURRENCY_SYMBOL = "$";

type LocationMode = "venue" | "online" | "tba";

const LOCATION_MODES = [
  { id: "venue", label: "Venue", icon: MapPin },
  { id: "online", label: "Online event", icon: Monitor },
  { id: "tba", label: "To be announced", icon: CalendarClock },
] as const;

const initialState: CreateEventState = {};

const fieldClass =
  "h-14 rounded-lg border-input bg-background px-4 text-base shadow-none focus-visible:border-foreground focus-visible:ring-1 focus-visible:ring-foreground";

function toIso(date: string, time: string) {
  if (!date || !time) return "";
  const parsed = new Date(`${date}T${time}`);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl">{title}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function OutlinedField({
  label,
  htmlFor,
  required,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="relative">
        <label
          htmlFor={htmlFor}
          className="absolute -top-2.5 left-3 z-10 bg-background px-1.5 text-sm text-muted-foreground"
        >
          {label}
          {required && <span className="text-primary"> *</span>}
        </label>
        {children}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function EventForm() {
  const [state, formAction, isPending] = useActionState(
    createEvent,
    initialState,
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [mode, setMode] = useState<LocationMode>("venue");
  const [showDetails, setShowDetails] = useState(false);
  const [isFree, setIsFree] = useState(true);
  const errors = state.errors ?? {};

  // We submit manually (instead of using the form's action prop) because React 19
  // clears every field after an action finishes, which would wipe the form
  // whenever there is a validation error.
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    fd.set("category", category);
    fd.set("startsAt", toIso(startDate, startTime));
    fd.set("endsAt", toIso(endDate, endTime));
    fd.set("price", isFree ? "0" : String(fd.get("price") ?? ""));

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
    <form
      id="event-form"
      onSubmit={handleSubmit}
      className="relative min-h-svh overflow-x-hidden"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-28 left-[22%] h-56 w-[28rem] -rotate-12 rounded-[100%] bg-[#C98CA7]/40" />
        <div className="absolute -right-32 top-1/3 h-[28rem] w-72 rounded-[100%] bg-muted" />
      </div>

      <div className="relative z-10">
        <header className="px-6 py-5">
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CalendarDays className="size-4" />
            </span>
            Event App
          </Link>
        </header>

        <div className="mx-auto w-full max-w-2xl space-y-12 px-6 pb-40 pt-8">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl">Create an event</h1>
            <p className="text-lg">
              Answer a few questions and your event page will be live for
              people to find and book.
            </p>
          </div>

          <Section
            title="Add a cover image"
            description="This is the first thing people see."
          >
            <div className="space-y-1.5">
              <label
                htmlFor="image"
                className="relative flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-input bg-muted/40 transition-colors hover:bg-muted"
              >
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt="Cover preview"
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImagePlus className="size-8" />
                    <span className="font-semibold">Upload a cover image</span>
                    <span className="text-sm">JPG or PNG, up to 4 MB</span>
                  </div>
                )}
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

          <Section
            title="What's the name of your event?"
            description="This is the title people will see, so be specific."
          >
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
                className={fieldClass}
              />
            </OutlinedField>
          </Section>

          <Section
            title="Pick a category"
            description="Help people find your event."
          >
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

          <Section
            title="What should people know?"
            description="Describe your event: what happens, who it is for, and anything to bring."
          >
            <OutlinedField
              label="Description"
              htmlFor="description"
              required
              error={errors.description}
            >
              <Textarea
                id="description"
                name="description"
                className={cn(fieldClass, "min-h-40 py-4")}
              />
            </OutlinedField>
          </Section>

          <Section title="When does your event start and end?">
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

          <Section title="Where is it located?">
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
                    mode === item.id
                      ? "bg-ring text-white"
                      : "hover:bg-secondary",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </button>
              ))}
            </div>

            {mode === "venue" && (
              <div className="space-y-4">
                <OutlinedField
                  label="Venue name or address"
                  htmlFor="venue"
                  required
                  error={errors.venue}
                >
                  <Input id="venue" name="venue" className={fieldClass} />
                </OutlinedField>
                {showDetails ? (
                  <OutlinedField
                    label="City (optional)"
                    htmlFor="city"
                    error={errors.city}
                  >
                    <Input id="city" name="city" className={fieldClass} />
                  </OutlinedField>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDetails(true)}
                    className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                  >
                    <Plus className="size-4" />
                    Add location details
                  </button>
                )}
              </div>
            )}

            {mode === "online" && (
              <OutlinedField label="Event link (optional)" htmlFor="link">
                <Input
                  id="link"
                  name="link"
                  placeholder="https://"
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
            title="How much do you want to charge for tickets?"
            description="One general admission ticket for now."
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
                  {CURRENCY_SYMBOL}
                </span>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  disabled={isFree}
                  className={cn(fieldClass, "pl-9")}
                />
              </OutlinedField>
              <div className="flex items-center gap-3">
                <Switch
                  id="free"
                  checked={isFree}
                  onCheckedChange={setIsFree}
                />
                <label htmlFor="free" className="font-medium">
                  My tickets are free
                </label>
              </div>
            </div>
          </Section>

          <Section
            title="How many tickets do you want to sell?"
            description="Leave empty for unlimited."
          >
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
                min={1}
                step={1}
                placeholder="Unlimited"
                className={fieldClass}
              />
            </OutlinedField>
          </Section>

          <Section
            title="Add some tags"
            description="Optional. Separate them with commas."
          >
            <OutlinedField label="Tags" htmlFor="tags" error={errors.tags}>
              <Input
                id="tags"
                name="tags"
                placeholder="networking, tech, free"
                className={fieldClass}
              />
            </OutlinedField>
          </Section>

          {state.message && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-end gap-6 px-6">
          <Link href="/" className="font-semibold text-ring hover:underline">
            Exit
          </Link>
          <Button
            type="submit"
            size="lg"
            className="h-12 px-8 text-base font-semibold"
            disabled={isPending}
          >
            {isPending ? "Creating event..." : "Create event"}
          </Button>
        </div>
      </div>
    </form>
  );
}
