import Fuse, { type IFuseOptions, type FuseResult } from "fuse.js";

import { normalize, stripPrefixes } from "./hebrew";

export type SearchIndexTask = {
  id: string;
  title: string;
  titleN: string;
};

export type SearchIndexEntry = {
  id: string;
  title: string;
  titleN: string;
  summary: string;
  categoryId: string;
  emoji: string;
  keywords: string[];
  tasks: SearchIndexTask[];
};

export const SEARCH_OPTIONS: IFuseOptions<SearchIndexEntry> = {
  includeMatches: true,
  includeScore: true,
  ignoreLocation: true,
  minMatchCharLength: 2,
  threshold: 0.6,
  keys: [
    { name: "titleN", weight: 0.4 },
    { name: "keywords", weight: 0.25 },
    { name: "summary", weight: 0.1 },
    { name: "tasks.titleN", weight: 0.25 },
  ],
};

function normalizeQuery(query: string): string {
  return normalize(query).trim().replace(/\s+/g, " ");
}

export function createSearchIndex(
  entries: readonly SearchIndexEntry[],
): Fuse<SearchIndexEntry> {
  return new Fuse([...entries], SEARCH_OPTIONS);
}

export function searchIndex(
  fuse: Fuse<SearchIndexEntry>,
  query: string,
  limit = 20,
): FuseResult<SearchIndexEntry>[] {
  const normalized = normalizeQuery(query);
  if (!normalized) return [];

  const direct = fuse.search(normalized, { limit });
  const withoutPrefixes = stripPrefixes(normalized);
  if (withoutPrefixes === normalized) return direct;

  const bestById = new Map<string, FuseResult<SearchIndexEntry>>();
  for (const result of [
    ...direct,
    ...fuse.search(withoutPrefixes, { limit }),
  ]) {
    const current = bestById.get(result.item.id);
    if (
      !current ||
      (result.score ?? Number.POSITIVE_INFINITY) <
        (current.score ?? Number.POSITIVE_INFINITY)
    ) {
      bestById.set(result.item.id, result);
    }
  }

  return [...bestById.values()]
    .sort(
      (left, right) =>
        (left.score ?? Number.POSITIVE_INFINITY) -
        (right.score ?? Number.POSITIVE_INFINITY),
    )
    .slice(0, limit);
}

export function searchContent(
  entries: readonly SearchIndexEntry[],
  query: string,
  limit = 20,
): FuseResult<SearchIndexEntry>[] {
  return searchIndex(createSearchIndex(entries), query, limit);
}
