"use client";

import { useEffect, useId, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  LayoutGrid,
  Search,
  Tag,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import type { Suggestion } from "@/lib/search-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<Suggestion["type"], LucideIcon> = {
  event: CalendarDays,
  organizer: User,
  category: LayoutGrid,
  tag: Tag,
};

type Option = {
  key: string;
  label: string;
  detail?: string;
  href: string;
  icon: LucideIcon;
  highlight: boolean;
};

function searchUrl(term: string) {
  return `/search?q=${encodeURIComponent(term)}`;
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Bolds the part of the text that matches what was typed.
function Highlight({ text, query }: { text: string; query: string }) {
  const tokens = query
    .trim()
    .split(/\s+/)
    .filter((token) => token.length >= 2)
    .map(escapeRegExp);
  if (tokens.length === 0) return <>{text}</>;

  const parts = text.split(new RegExp(`(${tokens.join("|")})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-extrabold">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function SearchBox({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const id = useId();
  const listId = `${id}-list`;
  const inputId = `${id}-input`;

  // On the results page, start with the words that were searched.
  const [query, setQuery] = useState(() =>
    pathname.startsWith("/search") ? (searchParams.get("q") ?? "") : "",
  );
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [fetched, setFetched] = useState<Suggestion[]>([]);

  const term = query.trim();

  // Fetch suggestions 200 ms after the person stops typing.
  useEffect(() => {
    if (term.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search/suggest?q=${encodeURIComponent(term)}`,
          { signal: controller.signal },
        );
        if (!res.ok) return;
        const data = (await res.json()) as { suggestions: Suggestion[] };
        setFetched(data.suggestions);
      } catch {
        // Aborted or offline: keep what is on screen.
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term]);

  const suggestions = term.length >= 2 ? fetched : [];

  const options: Option[] = term
    ? [
        {
          key: "search",
          label: `Search for “${term}”`,
          href: searchUrl(term),
          icon: Search,
          highlight: false,
        },
        ...suggestions.map((item, index) => ({
          key: `${item.type}-${index}`,
          label: item.label,
          detail: item.detail,
          href: item.href,
          icon: TYPE_ICONS[item.type],
          highlight: true,
        })),
      ]
    : [];

  const showList = open && options.length > 0;

  function go(href: string) {
    setOpen(false);
    setActiveIndex(-1);
    document.getElementById(inputId)?.blur();
    router.push(href);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (term) go(searchUrl(term));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (options.length === 0) return;
      setOpen(true);
      setActiveIndex((index) => (index + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (options.length === 0) return;
      setActiveIndex((index) => (index <= 0 ? options.length - 1 : index - 1));
    } else if (e.key === "Enter") {
      const chosen = showList ? options[activeIndex] : undefined;
      if (chosen) {
        e.preventDefault();
        go(chosen.href);
      }
      // Otherwise the form submits and searches for what was typed.
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div
      className={cn("relative", className)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setOpen(false);
          setActiveIndex(-1);
        }
      }}
    >
      <form role="search" onSubmit={handleSubmit} className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={inputId}
          name="q"
          type="text"
          role="combobox"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          placeholder="Search events, venues, tags"
          aria-label="Search events"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${id}-opt-${activeIndex}` : undefined
          }
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="h-11 rounded-full pl-11 pr-24 text-base"
        />
        <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                setFetched([]);
                setActiveIndex(-1);
                document.getElementById(inputId)?.focus();
              }}
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
          <Button
            type="submit"
            size="icon"
            aria-label="Search"
            className="size-8 rounded-full"
          >
            <Search className="size-4" />
          </Button>
        </div>
      </form>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          // Keeps focus in the input while clicking an option.
          onMouseDown={(e) => e.preventDefault()}
          className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border bg-popover py-2 shadow-lg"
        >
          {options.map((option, index) => (
            <li
              key={option.key}
              id={`${id}-opt-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => go(option.href)}
              className={cn(
                "flex cursor-pointer items-center gap-3 px-4 py-2.5",
                index === activeIndex && "bg-brand-blue/15",
              )}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full",
                  option.highlight
                    ? "bg-brand-blue/20 text-brand-indigo"
                    : "bg-muted text-foreground",
                )}
              >
                <option.icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">
                  {option.highlight ? (
                    <Highlight text={option.label} query={term} />
                  ) : (
                    option.label
                  )}
                </span>
                {option.detail && (
                  <span className="block truncate text-xs text-muted-foreground">
                    {option.detail}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
