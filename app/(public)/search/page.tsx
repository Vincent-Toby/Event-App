import type { Metadata } from "next";
import { Suspense } from "react";
import {
  SearchResults,
  SearchSkeleton,
} from "@/components/search-results";

export const metadata: Metadata = {
  title: "Search events",
  description: "Search events by name, place, or topic.",
};

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchResults searchParams={searchParams} />
    </Suspense>
  );
}
