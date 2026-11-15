import { Suspense } from "react";
import { MyBookings, MyBookingsSkeleton } from "@/components/my-bookings";

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
