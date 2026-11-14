import Link from "next/link";
import {
  BROWSE_TABS,
  browseHref,
  type BrowseFilters,
} from "@/lib/browse-params";
import { cn } from "@/lib/utils";

export function BrowseTabs({ filters }: { filters: BrowseFilters }) {
  return (
    <nav aria-label="Filter by date" className="flex gap-6 overflow-x-auto border-b">
      {BROWSE_TABS.map((tab) => {
        const active = filters.tab === tab.id;
        return (
          <Link
            key={tab.id}
            href={browseHref(filters, { tab: tab.id })}
            scroll={false}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px shrink-0 border-b-2 py-3 text-base font-semibold transition-colors",
              active
                ? "border-brand-indigo text-brand-indigo"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
