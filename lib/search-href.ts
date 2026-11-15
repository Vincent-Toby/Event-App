import type { BrowseFilters } from "@/lib/browse-params";

// Builds a link to /search that keeps the other filters.
// Pass `category: null` to clear the category.
export function searchHref(
  current: BrowseFilters,
  changes: Partial<BrowseFilters>,
) {
  const next = { ...current, ...changes };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.category) params.set("category", next.category);
  if (next.tab !== "all") params.set("tab", next.tab);
  const query = params.toString();
  return query ? `/search?${query}` : "/search";
}
