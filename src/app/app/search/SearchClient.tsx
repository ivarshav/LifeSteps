"use client";

import type Fuse from "fuse.js";
import { useCallback, useEffect, useRef, useState } from "react";

import { SearchBox } from "@/components/search/SearchBox";
import { SearchResults } from "@/components/search/SearchResults";
import { Button } from "@/components/ui/Button";
import {
  createSearchIndex,
  searchIndex,
  type SearchIndexEntry,
} from "@/lib/search";

export function SearchClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ReturnType<typeof searchIndex>>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const fuseRef = useRef<Fuse<SearchIndexEntry> | null>(null);
  const indexPromiseRef = useRef<Promise<Fuse<SearchIndexEntry>> | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(new URLSearchParams(window.location.search).get("q") ?? "");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const ensureIndex = useCallback(() => {
    if (fuseRef.current) return Promise.resolve(fuseRef.current);
    if (indexPromiseRef.current) return indexPromiseRef.current;
    const pending = (async () => {
      const response = await fetch("/search-index.json");
      if (!response.ok)
        throw new Error(`Search index failed: ${response.status}`);
      const entries = (await response.json()) as SearchIndexEntry[];
      fuseRef.current = createSearchIndex(entries);
      return fuseRef.current;
    })().finally(() => {
      indexPromiseRef.current = null;
    });
    indexPromiseRef.current = pending;
    return pending;
  }, []);

  const loadIndex = useCallback(
    (searchQuery: string, isActive: () => boolean = () => true) => {
      setLoading(true);
      setLoadError(false);
      void ensureIndex()
        .then((fuse) => {
          if (isActive() && searchQuery.trim())
            setResults(searchIndex(fuse, searchQuery));
        })
        .catch(() => {
          if (isActive()) {
            setResults([]);
            setLoadError(true);
          }
        })
        .finally(() => {
          if (isActive()) setLoading(false);
        });
    },
    [ensureIndex],
  );

  useEffect(() => {
    if (!query.trim()) return;
    let active = true;
    const timer = window.setTimeout(() => loadIndex(query, () => active), 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [loadIndex, query]);

  return (
    <>
      <SearchBox
        onChange={(event) => {
          const value = event.target.value;
          setQuery(value);
          setResults([]);
          setLoadError(false);
          setLoading(false);
          const url = new URL(window.location.href);
          if (value) url.searchParams.set("q", value);
          else url.searchParams.delete("q");
          window.history.replaceState(null, "", url);
        }}
        onFocus={() => {
          setLoadError(false);
          loadIndex(query);
        }}
        value={query}
      />
      {loadError ? (
        <div className="mt-3 space-y-2">
          <p
            aria-live="assertive"
            className="text-sm text-[var(--danger-500)]"
            role="alert"
          >
            לא הצלחנו לטעון את החיפוש. בדקו את החיבור ונסו שוב.
          </p>
          <Button
            disabled={loading}
            onClick={() => {
              setLoadError(false);
              loadIndex(query);
            }}
            size="sm"
            variant="secondary"
          >
            לנסות שוב
          </Button>
        </div>
      ) : (
        <>
          <p
            aria-live="polite"
            className="mt-3 text-sm text-[var(--gray-500)]"
            role="status"
          >
            {loading
              ? "טוען את החיפוש…"
              : query.trim()
                ? `נמצאו ${results.length.toLocaleString("he-IL")} צעדים`
                : "החיפוש כולל גם כותרות של משימות בתוך הצעדים."}
          </p>
          {!loading ? <SearchResults query={query} results={results} /> : null}
        </>
      )}
    </>
  );
}
