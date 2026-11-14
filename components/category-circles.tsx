import Link from "next/link";
import {
  Briefcase,
  Gamepad2,
  Gift,
  Heart,
  Laptop,
  Mic,
  PartyPopper,
  Theater,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { browseHref, type BrowseFilters } from "@/lib/browse-params";
import {
  CATEGORY_LABELS,
  EVENT_CATEGORIES,
  type EventCategoryValue,
} from "@/lib/event-categories";
import { cn } from "@/lib/utils";

const ICONS: Record<EventCategoryValue, LucideIcon> = {
  MUSIC: Mic,
  NIGHTLIFE: PartyPopper,
  ARTS: Theater,
  HOLIDAYS: Gift,
  DATING: Heart,
  HOBBIES: Gamepad2,
  BUSINESS: Briefcase,
  FOOD_DRINK: UtensilsCrossed,
  TECH: Laptop,
};

export function CategoryCircles({ filters }: { filters: BrowseFilters }) {
  return (
    <nav
      aria-label="Browse by category"
      className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:mx-0 lg:justify-between lg:px-0"
    >
      {EVENT_CATEGORIES.map((value) => {
        const Icon = ICONS[value];
        const active = filters.category === value;
        return (
          <Link
            key={value}
            href={browseHref(filters, { category: active ? null : value })}
            scroll={false}
            aria-current={active ? "true" : undefined}
            className="group flex w-24 shrink-0 flex-col items-center gap-2 text-center"
          >
            <span
              className={cn(
                "flex size-20 items-center justify-center rounded-full border-2 transition-colors sm:size-24",
                active
                  ? "border-brand-indigo bg-brand-indigo text-white"
                  : "border-brand-blue/50 bg-background text-foreground group-hover:bg-brand-blue/15",
              )}
            >
              <Icon className="size-8" strokeWidth={1.5} />
            </span>
            <span className="text-sm font-semibold leading-tight">
              {CATEGORY_LABELS[value]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
