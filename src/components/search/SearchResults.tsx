"use client";

import type { FuseResult } from "fuse.js";

import type { SearchIndexEntry } from "@/lib/search";
import { normalize, stripPrefixes } from "@/lib/hebrew";

function Highlighted({ query, text }: { query: string; text: string }) {
  const needles = normalize(query)
    .split(/\s+/)
    .filter((token) => token.length > 1);
  return (
    <>
      {text.split(/(\s+)/).map((part, index) => {
        const normalized = normalize(part);
        const matched = needles.some(
          (needle) =>
            normalized.includes(needle) ||
            normalized.includes(stripPrefixes(needle)),
        );
        return matched ? <mark key={index}>{part}</mark> : part;
      })}
    </>
  );
}

export function SearchResults({
  query,
  results,
}: {
  query: string;
  results: FuseResult<SearchIndexEntry>[];
}) {
  const normalizedQuery = normalize(query);

  if (!query.trim()) {
    return (
      <p className="mt-6 text-[var(--gray-500)]">
        התחילו להקליד כדי לחפש בכל הצעדים ובכל המשימות.
      </p>
    );
  }
  if (results.length === 0) {
    return (
      <div className="mt-6 rounded-xl bg-[var(--gray-100)] p-5">
        <h2 className="font-semibold text-[var(--gray-900)]">
          לא מצאנו תוצאה מתאימה
        </h2>
        <p className="mt-1 text-sm text-[var(--gray-500)]">
          נסו ניסוח קצר יותר או עברו לעיון בקטגוריות.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3" role="list">
      {results.map(({ item }) => {
        const taskHits = item.tasks.filter((task) => {
          const title = task.titleN;
          return (
            title.includes(normalizedQuery) ||
            title.includes(stripPrefixes(normalizedQuery))
          );
        });
        return (
          <article
            className="rounded-[var(--radius-lg)] border border-[var(--gray-200)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]"
            key={item.id}
            role="listitem"
          >
            <a
              className="flex items-start gap-3 text-inherit no-underline hover:no-underline"
              href={`/steps/${item.id}`}
            >
              <span aria-hidden className="text-2xl">
                {item.emoji}
              </span>
              <div>
                <h2 className="text-lg font-semibold text-[var(--gray-900)]">
                  <Highlighted query={query} text={item.title} />
                </h2>
                <p className="mt-1 text-sm text-[var(--gray-500)]">
                  <Highlighted query={query} text={item.summary} />
                </p>
              </div>
            </a>
            {taskHits.length > 0 ? (
              <ul className="border-block-start mt-3 space-y-1 border-[var(--gray-100)] ps-8 pt-3 text-sm">
                {taskHits.slice(0, 5).map((task) => (
                  <li key={task.id}>
                    <a href={`/steps/${item.id}`}>
                      <Highlighted query={query} text={task.title} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
