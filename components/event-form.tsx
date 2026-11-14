"use client";

import { startTransition, useActionState, useState } from "react";
import {
  createEvent,
  type CreateEventState,
} from "@/app/(app)/events/new/actions";
import { CATEGORY_LABELS, EVENT_CATEGORIES } from "@/lib/event-categories";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: CreateEventState = {};

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function EventForm() {
  const [state, formAction, isPending] = useActionState(
    createEvent,
    initialState,
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [startLocal, setStartLocal] = useState("");
  const [endLocal, setEndLocal] = useState("");
  const errors = state.errors ?? {};

  // We submit manually (instead of using the form's action prop) because React 19
  // clears every field after an action finishes, which would wipe the form
  // whenever there is a validation error.
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="image">Cover image</Label>
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Cover preview"
                className="aspect-video w-full rounded-lg border object-cover"
              />
            )}
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            <FieldError message={errors.image} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" maxLength={120} />
            <FieldError message={errors.title} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select id="category" name="category" defaultValue="" className={selectClass}>
              <option value="" disabled>
                Select a category
              </option>
              {EVENT_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {CATEGORY_LABELS[value]}
                </option>
              ))}
            </select>
            <FieldError message={errors.category} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={6} />
            <FieldError message={errors.description} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startsAtLocal">Starts</Label>
              <Input
                id="startsAtLocal"
                type="datetime-local"
                value={startLocal}
                onChange={(e) => setStartLocal(e.target.value)}
              />
              <FieldError message={errors.startsAt} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endsAtLocal">Ends (optional)</Label>
              <Input
                id="endsAtLocal"
                type="datetime-local"
                value={endLocal}
                onChange={(e) => setEndLocal(e.target.value)}
              />
              <FieldError message={errors.endsAt} />
            </div>
          </div>

          {/* The browser converts the local time to a full timestamp, so the
              server stores the right moment no matter where it runs. */}
          <input
            type="hidden"
            name="startsAt"
            value={startLocal ? new Date(startLocal).toISOString() : ""}
          />
          <input
            type="hidden"
            name="endsAt"
            value={endLocal ? new Date(endLocal).toISOString() : ""}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="venue">Venue</Label>
              <Input id="venue" name="venue" placeholder="Venue name or link" />
              <FieldError message={errors.venue} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City (optional)</Label>
              <Input id="city" name="city" />
              <FieldError message={errors.city} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isOnline"
              name="isOnline"
              type="checkbox"
              className="size-4 accent-primary"
            />
            <Label htmlFor="isOnline">This is an online event</Label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD, 0 for free)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min={0}
                step="0.01"
                defaultValue="0"
              />
              <FieldError message={errors.price} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (empty for unlimited)</Label>
              <Input id="capacity" name="capacity" type="number" min={1} step={1} />
              <FieldError message={errors.capacity} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input id="tags" name="tags" placeholder="networking, tech, free" />
            <FieldError message={errors.tags} />
          </div>

          {state.message && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating event..." : "Create event"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}