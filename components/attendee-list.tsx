import { Users } from "lucide-react";
import { formatEventDate } from "@/lib/event-utils";
import type { Attendee } from "@/lib/organizer";

export function AttendeeList({
  attendees,
  now,
}: {
  attendees: Attendee[];
  now: Date;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl">Attendees ({attendees.length})</h2>

      {attendees.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-brand-blue/50 bg-brand-blue/10 px-6 py-12 text-center">
          <Users className="size-9 text-brand-indigo" />
          <div className="space-y-1">
            <p className="text-lg font-bold">No attendees yet</p>
            <p className="text-muted-foreground">
              People who book will show up here.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border">
          <table className="hidden w-full text-left text-sm md:table">
            <thead className="bg-muted/60 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Ref</th>
                <th className="px-4 py-3">Booked</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {attendees.map((person) => (
                <tr key={person.bookingId}>
                  <td className="px-4 py-3 font-semibold">{person.name}</td>
                  <td className="px-4 py-3">
                    <a
                      href={`mailto:${person.email}`}
                      className="break-all text-brand-indigo hover:underline"
                    >
                      {person.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{person.ref}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatEventDate(person.bookedAt, now)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="divide-y md:hidden">
            {attendees.map((person) => (
              <li key={person.bookingId} className="space-y-1 px-4 py-3">
                <p className="font-semibold">{person.name}</p>
                <a
                  href={`mailto:${person.email}`}
                  className="block break-all text-sm text-brand-indigo hover:underline"
                >
                  {person.email}
                </a>
                <p className="text-xs text-muted-foreground">
                  Ref <span className="font-mono">{person.ref}</span> • Booked{" "}
                  {formatEventDate(person.bookedAt, now)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
