"use client";

import type Fuse from "fuse.js";
import { useCallback, useEffect, useRef, useState } from "react";

import { SearchBox } from "@/components/search/SearchBox";
import { SearchResults } from "@/components/search/SearchResults";
import {
  createSearchIndex,
  searchIndex,
  type SearchIndexEntry,
} from "@/lib/search";

export function SearchClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ReturnType<typeof searchIndex>>([]);
  const [loading, setLoading] = useState(false);
  const fuseRef = useRef<Fuse<SearchIndexEntry> | null>(null);
  const indexPromiseRef = useRef<Promise<Fuse<SearchIndexEntry>> | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(new URLSearchParams(window.location.search).get("q") ?? "");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const ensureIndex = useCallback(async () => {
    if (fuseRef.current) return fuseRef.current;
    if (indexPromiseRef.current) return indexPromiseRef.current;
    setLoading(true);
    indexPromiseRef.current = (async () => {
      const response = await fetch("/search-index.json");
      if (!response.ok)
        throw new Error(`Search index failed: ${response.status}`);
      const entries = (await response.json()) as SearchIndexEntry[];
      fuseRef.current = createSearchIndex(entries);
      return fuseRef.current;
    })();
    try {
      return await indexPromiseRef.current;
    } finally {
      setLoading(false);
      indexPromiseRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!query.trim()) return;
    let active = true;
    void ensureIndex()
      .then((fuse) => {
        if (active && fuse) setResults(searchIndex(fuse, query));
      })
      .catch(() => {
        if (active) setResults([]);
      });
    return () => {
      active = false;
    };
  }, [ensureIndex, query]);

  return (
    <>
      <SearchBox
        onChange={(event) => {
          const value = event.target.value;
          setQuery(value);
          const url = new URL(window.location.href);
          if (value) url.searchParams.set("q", value);
          else url.searchParams.delete("q");
          window.history.replaceState(null, "", url);
        }}
        onFocus={() => void ensureIndex()}
        value={query}
      />
      <p aria-live="polite" className="mt-3 text-sm text-[var(--gray-500)]">
        {loading
          ? "טוען את החיפוש…"
          : query.trim()
            ? `נמצאו ${results.length.toLocaleString("he-IL")} צעדים`
            : "החיפוש כולל גם כותרות של משימות בתוך הצעדים."}
      </p>
      <SearchResults query={query} results={results} />
    </>
  );
}
