import { Skeleton } from "@/components/ui/skeleton";

export function EventPageSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="aspect-video w-full rounded-3xl sm:aspect-[21/9]" />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-12 w-4/5" />
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <Skeleton className="hidden h-64 w-full rounded-2xl lg:block" />
      </div>
    </div>
  );
}
