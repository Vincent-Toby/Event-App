import { requireUser } from "@/lib/session";

export default async function NewEventPage() {
  const user = await requireUser();

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Create event</h1>
      <p className="text-sm text-muted-foreground">
        Logged in as {user.email}
      </p>
    </div>
  );
}
