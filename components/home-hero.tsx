import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-brand-indigo px-6 py-14 text-white sm:px-12 sm:py-20">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -right-16 -top-16 size-72 rounded-full bg-brand-pink/40" />
        <div className="absolute -bottom-24 right-24 size-64 rounded-full bg-brand-yellow/30" />
        <div className="absolute right-1/3 top-8 size-24 rounded-full bg-brand-blue/40" />
      </div>

      <div className="relative max-w-2xl space-y-6">
        <span className="inline-block bg-brand-yellow px-3 py-1 text-sm font-extrabold uppercase tracking-wide text-foreground">
          Get into it
        </span>
        <h1 className="space-y-2 text-3xl font-extrabold uppercase leading-tight sm:text-5xl">
          <span className="block">
            <span className="inline-block bg-gradient-to-r from-brand-blue to-brand-pink px-3 py-1 text-foreground">
              Find events you&apos;ll love
            </span>
          </span>
          <span className="block">
            <span className="inline-block bg-gradient-to-r from-brand-pink to-brand-blue px-3 py-1 text-foreground">
              and book in seconds
            </span>
          </span>
        </h1>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            className="h-12 rounded-full bg-white px-6 text-base font-semibold text-foreground hover:bg-white/90"
            nativeButton={false}
            render={<Link href="#events" />}
          >
            Browse events
          </Button>
          <Button
            className="h-12 rounded-full px-6 text-base font-semibold"
            nativeButton={false}
            render={<Link href="/events/new" />}
          >
            Create an event
          </Button>
        </div>
      </div>
    </section>
  );
}
