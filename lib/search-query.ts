import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { EventCardData } from "@/components/event-card";
import type { BrowseFilters } from "@/lib/browse-params";
import {
  CATEGORY_LABELS,
  EVENT_CATEGORIES,
} from "@/lib/event-categories";
import { formatEventDate, todayRange, weekendRange } from "@/lib/event-utils";
import { normalizeText, scoreEvent, tokenize } from "@/lib/search-text";

// Version 1: load upcoming events, then score them in code. This is fine for a
// few thousand events. We can move the ranking into SQL later.
const CANDIDATE_LIMIT = 500;
const MAX_EXACT = 48;
const MAX_RELATED = 24;
const MAX_FALLBACK = 8;

function upcomingWhere(now: Date): Prisma.EventWhereInput {
  return {
    status: "PUBLISHED",
    OR: [{ endsAt: { gte: now } }, { endsAt: null, startsAt: { gte: now } }],
  };
}

export type SearchResults = {
  // The words that were searched, for display.
  terms: string[];
  // Events that matched every word.
  exact: EventCardData[];
  // Events that matched some of the words.
  related: EventCardData[];
  // The words the related events matched.
  relatedTerms: string[];
  // Upcoming events, only filled when nothing matched at all.
  fallback: EventCardData[];
};

export async function searchEvents(
  filters: BrowseFilters,
  now: Date,
): Promise<SearchResults> {
  const and: Prisma.EventWhereInput[] = [upcomingWhere(now)];

  if (filters.category) and.push({ category: filters.category });

  if (filters.tab === "today") {
    const { start, end } = todayRange(now);
    and.push({ startsAt: { gte: start, lt: end } });
  } else if (filters.tab === "weekend") {
    const { start, end } = weekendRange(now);
    and.push({ startsAt: { gte: start, lt: end } });
  }

  const candidates = await prisma.event.findMany({
    where: { AND: and },
    orderBy: { startsAt: "asc" },
    take: CANDIDATE_LIMIT,
    select: {
      slug: true,
      title: true,
      description: true,
      imageUrl: true,
      venue: true,
      city: true,
      isOnline: true,
      tags: true,
      category: true,
      startsAt: true,
      createdAt: true,
      price: true,
      currency: true,
      capacity: true,
      // Never select the organizer's email here.
      organizer: { select: { name: true } },
      _count: { select: { bookings: { where: { status: "CONFIRMED" } } } },
    },
  });

  const toCard = (item: (typeof candidates)[number]): EventCardData => ({
    slug: item.slug,
    title: item.title,
    imageUrl: item.imageUrl,
    venue: item.venue,
    isOnline: item.isOnline,
    startsAt: item.startsAt,
    createdAt: item.createdAt,
    price: item.price,
    currency: item.currency,
    capacity: item.capacity,
    confirmedCount: item._count.bookings,
  });

  const terms = tokenize(filters.q);

  // No search words: just return everything that passes the filters.
  if (terms.length === 0) {
    return {
      terms: [],
      exact: candidates.slice(0, MAX_EXACT).map(toCard),
      related: [],
      relatedTerms: [],
      fallback: [],
    };
  }

  const scored = candidates
    .map((item) => ({
      item,
      match: scoreEvent(
        {
          title: item.title,
          description: item.description,
          venue: item.venue,
          city: item.city,
          tags: item.tags,
          categoryLabel: CATEGORY_LABELS[item.category],
          organizerName: item.organizer.name,
        },
        terms,
      ),
    }))
    .filter((entry) => entry.match.score > 0);

  const byRelevance = (a: (typeof scored)[number], b: (typeof scored)[number]) =>
    b.match.score - a.match.score ||
    a.item.startsAt.getTime() - b.item.startsAt.getTime();

  const exact = scored
    .filter((entry) => entry.match.exact)
    .sort(byRelevance)
    .slice(0, MAX_EXACT);

  const related = scored
    .filter((entry) => !entry.match.exact)
    .sort(byRelevance)
    .slice(0, MAX_RELATED);

  const relatedTerms = terms
    .filter((term) => related.some((entry) => entry.match.matched.includes(term)))
    .map((term) => term.word);

  return {
    terms: terms.map((term) => term.word),
    exact: exact.map((entry) => toCard(entry.item)),
    related: related.map((entry) => toCard(entry.item)),
    relatedTerms,
    fallback:
      exact.length === 0 && related.length === 0
        ? candidates.slice(0, MAX_FALLBACK).map(toCard)
        : [],
  };
}

export type Suggestion = {
  type: "event" | "organizer" | "category" | "tag";
  label: string;
  detail?: string;
  href: string;
};

const MAX_SUGGESTIONS = 8;

// Dropdown suggestions: events first, then organizers, categories and tags.
export async function getSuggestions(
  rawQuery: string,
  now: Date,
): Promise<Suggestion[]> {
  const q = rawQuery.trim().slice(0, 60);
  if (q.length < 2) return [];

  const needle = normalizeText(q);
  const upcoming = upcomingWhere(now);

  const [events, organizers, tagRows] = await Promise.all([
    prisma.event.findMany({
      where: {
        AND: [upcoming, { title: { contains: q, mode: "insensitive" } }],
      },
      orderBy: { startsAt: "asc" },
      take: 4,
      select: { slug: true, title: true, startsAt: true },
    }),
    prisma.user.findMany({
      where: {
        name: { contains: q, mode: "insensitive" },
        events: { some: upcoming },
      },
      take: 2,
      // Only the name and a count. Never the email.
      select: {
        name: true,
        _count: { select: { events: { where: upcoming } } },
      },
    }),
    prisma.event.findMany({
      where: upcoming,
      orderBy: { startsAt: "asc" },
      take: 200,
      select: { tags: true },
    }),
  ]);

  const suggestions: Suggestion[] = [];

  for (const event of events) {
    suggestions.push({
      type: "event",
      label: event.title,
      detail: formatEventDate(event.startsAt, now),
      href: `/events/${event.slug}`,
    });
  }

  for (const organizer of organizers) {
    const count = organizer._count.events;
    suggestions.push({
      type: "organizer",
      label: organizer.name,
      detail: `Organizer • ${count} upcoming ${count === 1 ? "event" : "events"}`,
      href: `/search?q=${encodeURIComponent(organizer.name)}`,
    });
  }

  for (const value of EVENT_CATEGORIES.filter((category) =>
    normalizeText(CATEGORY_LABELS[category]).includes(needle),
  ).slice(0, 2)) {
    suggestions.push({
      type: "category",
      label: `${CATEGORY_LABELS[value]} events`,
      detail: "Category",
      href: `/search?category=${value}`,
    });
  }

  const tagCounts = new Map<string, number>();
  for (const row of tagRows) {
    for (const tag of row.tags) {
      if (normalizeText(tag).includes(needle)) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      }
    }
  }
  const topTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);
  for (const [tag] of topTags) {
    suggestions.push({
      type: "tag",
      label: tag,
      detail: "Tag",
      href: `/search?q=${encodeURIComponent(tag)}`,
    });
  }

  return suggestions.slice(0, MAX_SUGGESTIONS);
}
