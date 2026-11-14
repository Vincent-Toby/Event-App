import { Suspense } from "react";
import { BrowseContent, BrowseSkeleton } from "@/components/browse-content";
import { HomeHero } from "@/components/home-hero";

export default function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="space-y-10">
      <HomeHero />
      <Suspense fallback={<BrowseSkeleton />}>
        <BrowseContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
