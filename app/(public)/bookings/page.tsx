import type { Metadata } from "next";
import { Suspense } from "react";
import { MyBookings, MyBookingsSkeleton } from "@/components/my-bookings";

export const metadata: Metadata = {
  title: "My bookings",
  robots: { index: false, follow: false },
};

export default function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<MyBookingsSkeleton />}>
      <MyBookings searchParams={searchParams} />
    </Suspense>
  );
}
