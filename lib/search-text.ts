export type SearchTerm = { word: string; stem: string };

export type SearchableEvent = {
  title: string;
  description: string;
  venue: string;
  city: string | null;
  tags: string[];
  categoryLabel: string;
  organizerName: string;
};

export type MatchResult = {
  score: number;
  matched: SearchTerm[];
  exact: boolean;
};

const STOP_WORDS = new Set([
  "a", "an", "and", "the", "of", "in", "on", "at", "for", "to", "with", "by",
  "is", "are", "or", "my", "me", "near",
]);

const MAX_TERMS = 6;

export function normalizeText(text: string) {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Very light stemming so "conventions" and "convention" match each other.
function stem(word: string) {
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.length > 4 && word.endsWith("sses")) return word.slice(0, -2);
  if (
    word.length > 3 &&
    word.endsWith("s") &&
    !word.endsWith("ss") &&
    !word.endsWith("us")
  ) {
    return word.slice(0, -1);
  }
  return word;
}

// "Anime Conventions in Lagos" -> [{ word: "anime", stem: "anime" }, { word: "conventions", stem: "convention" }, ...]
export function tokenize(query: string): SearchTerm[] {
  const words = normalizeText(query)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 2);
  const meaningful = words.filter((word) => !STOP_WORDS.has(word));
  const chosen = meaningful.length > 0 ? meaningful : words;

  const seen = new Set<string>();
  const terms: SearchTerm[] = [];
  for (const word of chosen) {
    const s = stem(word);
    if (seen.has(s)) continue;
    seen.add(s);
    terms.push({ word, stem: s });
    if (terms.length === MAX_TERMS) break;
  }
  return terms;
}

const WEIGHTS = {
  title: 5,
  tags: 4,
  category: 3,
  organizer: 3,
  venue: 2,
  description: 1,
} as const;

// Scores one event against the search words.
// `exact` is true when every word matched somewhere.
export function scoreEvent(
  event: SearchableEvent,
  terms: SearchTerm[],
): MatchResult {
  const title = normalizeText(event.title);
  const tags = event.tags.map(normalizeText);
  const category = normalizeText(event.categoryLabel);
  const organizer = normalizeText(event.organizerName);
  const venue = normalizeText(`${event.venue} ${event.city ?? ""}`);
  const description = normalizeText(event.description);

  let score = 0;
  const matched: SearchTerm[] = [];

  for (const term of terms) {
    let termScore = 0;
    if (title.includes(term.stem)) termScore += WEIGHTS.title;
    if (tags.some((tag) => tag.includes(term.stem))) termScore += WEIGHTS.tags;
    if (category.includes(term.stem)) termScore += WEIGHTS.category;
    if (organizer.includes(term.stem)) termScore += WEIGHTS.organizer;
    if (venue.includes(term.stem)) termScore += WEIGHTS.venue;
    if (description.includes(term.stem)) termScore += WEIGHTS.description;

    if (termScore > 0) {
      score += termScore;
      matched.push(term);
    }
  }

  // Bonus when the whole phrase appears in the title.
  if (terms.length > 1) {
    const phrase = terms.map((term) => term.stem).join(" ");
    if (title.includes(phrase)) score += 6;
  }

  return {
    score,
    matched,
    exact: terms.length > 0 && matched.length === terms.length,
  };
}
