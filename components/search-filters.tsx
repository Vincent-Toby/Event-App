import Link from "next/link";
import { BROWSE_TABS, type BrowseFilters } from "@/lib/browse-params";
import { CATEGORY_LABELS, EVENT_CATEGORIES } from "@/lib/event-categories";
import { searchHref } from "@/lib/search-href";
import { cn } from "@/lib/utils";

function SidebarLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        "block rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
        active
          ? "bg-brand-indigo text-white"
          : "text-foreground hover:bg-brand-blue/15",
      )}
    >
      {children}
    </Link>
  );
}

// Desktop: the filters column on the left.
export function SearchFiltersSidebar({ filters }: { filters: BrowseFilters }) {
  return (
    <aside className="hidden lg:block">
      <div className="space-y-8">
        <h2 className="text-2xl">Filters</h2>

        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Category
          </h3>
          <nav aria-label="Filter by category" className="space-y-1">
            <SidebarLink
              href={searchHref(filters, { category: null })}
              active={filters.category === null}
            >
              All categories
            </SidebarLink>
            {EVENT_CATEGORIES.map((value) => (
              <SidebarLink
                key={value}
                href={searchHref(filters, { category: value })}
                active={filters.category === value}
              >
                {CATEGORY_LABELS[value]}
              </SidebarLink>
            ))}
          </nav>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Date
          </h3>
          <nav aria-label="Filter by date" className="space-y-1">
            {BROWSE_TABS.map((tab) => (
              <SidebarLink
                key={tab.id}
                href={searchHref(filters, { tab: tab.id })}
                active={filters.tab === tab.id}
              >
                {tab.id === "all" ? "Any date" : tab.label}
              </SidebarLink>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
        active
          ? "bg-brand-indigo text-white"
          : "bg-muted hover:bg-secondary",
      )}
    >
      {children}
    </Link>
  );
}

// Mobile: scrolling chips above the results.
export function SearchFiltersChips({ filters }: { filters: BrowseFilters }) {
  return (
    <div className="-mx-4 space-y-3 px-4 lg:hidden">
      <nav
        aria-label="Filter by date"
        className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
      >
        {BROWSE_TABS.map((tab) => (
          <Chip
            key={tab.id}
            href={searchHref(filters, { tab: tab.id })}
            active={filters.tab === tab.id}
          >
            {tab.id === "all" ? "Any date" : tab.label}
          </Chip>
        ))}
      </nav>
      <nav
        aria-label="Filter by category"
        className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
      >
        <Chip
          href={searchHref(filters, { category: null })}
          active={filters.category === null}
        >
          All categories
        </Chip>
        {EVENT_CATEGORIES.map((value) => (
          <Chip
            key={value}
            href={searchHref(filters, { category: value })}
            active={filters.category === value}
          >
            {CATEGORY_LABELS[value]}
          </Chip>
        ))}
      </nav>
    </div>
  );
}
