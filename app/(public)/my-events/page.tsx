import type { Metadata } from "next";
import { Suspense } from "react";
import { MyEvents, MyEventsSkeleton } from "@/components/my-events";

export const metadata: Metadata = {
  title: "My events",
  robots: { index: false, follow: false },
};

export default function MyEventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<MyEventsSkeleton />}>
      <MyEvents searchParams={searchParams} />
    </Suspense>
  );
}
