import {
  EVENT_CATEGORIES,
  type EventCategoryValue,
} from "@/lib/event-categories";

export const BROWSE_TABS = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "weekend", label: "This weekend" },
] as const;

export type BrowseTab = (typeof BROWSE_TABS)[number]["id"];

export type BrowseFilters = {
  category: EventCategoryValue | null;
  tab: BrowseTab;
  q: string;
};

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

// Turns the page's URL query (?category=MUSIC&tab=today&q=jazz) into safe values.
// Anything invalid falls back to "no filter".
export function parseBrowseParams(raw: RawParams): BrowseFilters {
  const category = first(raw.category) ?? "";
  const tab = first(raw.tab) ?? "";
  const q = (first(raw.q) ?? "").trim().slice(0, 100);

  return {
    category: (EVENT_CATEGORIES as readonly string[]).includes(category)
      ? (category as EventCategoryValue)
      : null,
    tab: BROWSE_TABS.some((item) => item.id === tab) ? (tab as BrowseTab) : "all",
    q,
  };
}

// Builds a link to the home page that keeps the other filters.
// Pass `category: null` to clear the category.
export function browseHref(
  current: BrowseFilters,
  changes: Partial<BrowseFilters>,
) {
  const next = { ...current, ...changes };
  const params = new URLSearchParams();
  if (next.category) params.set("category", next.category);
  if (next.tab !== "all") params.set("tab", next.tab);
  if (next.q) params.set("q", next.q);
  const query = params.toString();
  return query ? `/?${query}` : "/";
}
